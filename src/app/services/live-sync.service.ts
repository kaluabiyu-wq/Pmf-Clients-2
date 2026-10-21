import { InjectionToken, Service, computed, effect, inject, signal, untracked } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  HUB_METHODS,
  InventoryStatusChangedMessage,
  LIVE_EVENTS,
  LiveSyncState,
  OrderCreatedMessage,
  OrderStatusChangedMessage,
  PrescriptionVerifiedMessage,
} from '../model/live-sync.model';
import { AuthService } from './auth-service.service';


export type HubConnectionFactory = (accessToken: () => string) => HubConnection;

const MAX_RETRY_DELAY_MS = 30_000;


export function retryDelayMs(previousRetryCount: number): number {
  return Math.min(1000 * 2 ** previousRetryCount, MAX_RETRY_DELAY_MS);
}

export const HUB_CONNECTION_FACTORY = new InjectionToken<HubConnectionFactory>('HUB_CONNECTION_FACTORY', {
  providedIn: 'root',
  factory: () => (accessToken) =>
    new HubConnectionBuilder()
      // Relative on purpose: in development the dev-server proxy (proxy.conf.json) forwards /hubs to PmfApi.
      .withUrl(environment.hubUrl, { accessTokenFactory: accessToken })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (context) => retryDelayMs(context.previousRetryCount) + Math.random() * 1000,
      })
      .configureLogging(environment.production ? LogLevel.Warning : LogLevel.Information)
      .build(),
});

/**
 * One SignalR connection for the whole app, alive exactly while a user is signed in.
 *
 * Components never touch the connection. They subscribe to the typed streams below, or watch a
 * medicine, and react (usually by reloading a resource). The service is started once at app startup
 * by {@link activate} (see provideAppInitializer in app.config.ts).
 */
@Service()
export class LiveSyncService {
  private readonly auth = inject(AuthService);
  private readonly createConnection = inject(HUB_CONNECTION_FACTORY);

  private connection: HubConnection | null = null;
  /** Bumped on every start/stop so a slow, abandoned connect loop can tell it has been superseded. */
  private generation = 0;
  /** medicineId → number of components watching it. Groups are lost on reconnect, so we remember them. */
  private readonly watched = new Map<number, number>();

  private readonly _state = signal<LiveSyncState>('disconnected');
  readonly state = this._state.asReadonly();
  readonly isConnected = computed(() => this._state() === 'connected');

  private readonly inventorySubject = new Subject<InventoryStatusChangedMessage>();
  private readonly orderCreatedSubject = new Subject<OrderCreatedMessage>();
  private readonly orderStatusSubject = new Subject<OrderStatusChangedMessage>();
  private readonly prescriptionSubject = new Subject<PrescriptionVerifiedMessage>();
  private readonly connectedSubject = new Subject<void>();

  readonly inventoryStatusChanged$: Observable<InventoryStatusChangedMessage> = this.inventorySubject.asObservable();
  readonly orderCreated$: Observable<OrderCreatedMessage> = this.orderCreatedSubject.asObservable();
  readonly orderStatusChanged$: Observable<OrderStatusChangedMessage> = this.orderStatusSubject.asObservable();
  readonly prescriptionVerified$: Observable<PrescriptionVerifiedMessage> = this.prescriptionSubject.asObservable();

  /**
   * Emits every time the connection is (re)established. SignalR does not replay events missed while
   * offline, so a consumer that wants to be correct reloads its data when this fires.
   */
  readonly connected$: Observable<void> = this.connectedSubject.asObservable();

  /**
   * Ties the connection to the session: connect when someone signs in, disconnect on logout, and
   * reconnect as the new user if a different account signs in. Must run in an injection context.
   */
  activate(): void {
    // A computed only changes when the user id changes, so token refreshes do not bounce the socket.
    const signedInUserId = computed(() => (this.auth.isAuthenticated() ? (this.auth.currentUser()?.id ?? null) : null));

    effect(() => {
      const userId = signedInUserId();
      // The connect/disconnect work reads other signals; they must not become dependencies of this effect.
      untracked(() => (userId === null ? this.stop() : this.restart()));
    });
  }

  /**
   * Join a medicine's availability group so inventoryStatusChanged$ also fires for pharmacies the
   * patient is not otherwise connected to. Returns a function that leaves again; call it from
   * DestroyRef.onDestroy. Several watchers of one medicine share a single server-side membership.
   */
  watchMedicine(medicineId: number): () => void {
    const count = this.watched.get(medicineId) ?? 0;
    this.watched.set(medicineId, count + 1);
    if (count === 0) this.invokeIfConnected(HUB_METHODS.watchMedicine, medicineId);

    let released = false;
    return () => {
      if (released) return;
      released = true;

      const remaining = (this.watched.get(medicineId) ?? 1) - 1;
      if (remaining <= 0) {
        this.watched.delete(medicineId);
        this.invokeIfConnected(HUB_METHODS.unwatchMedicine, medicineId);
      } else {
        this.watched.set(medicineId, remaining);
      }
    };
  }

  // ---------- Connection lifecycle ----------

  private restart(): void {
    const generation = ++this.generation;
    const previous = this.connection;
    this.connection = null;
    void previous?.stop().catch(() => undefined);
    void this.connect(generation);
  }

  private stop(): void {
    this.generation++;
    const previous = this.connection;
    this.connection = null;
    this._state.set('disconnected');
    void previous?.stop().catch(() => undefined);
  }

  private async connect(generation: number): Promise<void> {
    const connection = this.createConnection(() => this.auth.token() ?? '');
    this.register(connection, generation);
    this.connection = connection;

    // The built-in automatic reconnect only applies to a connection that was once established, so
    // the first connect (server down at page load, for example) needs its own retry loop.
    for (let attempt = 0; generation === this.generation; attempt++) {
      this._state.set('connecting');
      try {
        await connection.start();
        if (generation !== this.generation) return; // signed out while negotiating
        await this.onEstablished(connection);
        return;
      } catch (error) {
        if (generation !== this.generation) return;
        console.warn('Live sync: could not connect, will retry.', error);
        this._state.set('reconnecting');
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs(attempt)));
      }
    }
  }

  private register(connection: HubConnection, generation: number): void {
    const current = () => generation === this.generation;

    connection.on(LIVE_EVENTS.inventoryStatusChanged, (m: InventoryStatusChangedMessage) => this.inventorySubject.next(m));
    connection.on(LIVE_EVENTS.orderCreated, (m: OrderCreatedMessage) => this.orderCreatedSubject.next(m));
    connection.on(LIVE_EVENTS.orderStatusChanged, (m: OrderStatusChangedMessage) => this.orderStatusSubject.next(m));
    connection.on(LIVE_EVENTS.prescriptionVerified, (m: PrescriptionVerifiedMessage) => this.prescriptionSubject.next(m));

    connection.onreconnecting(() => {
      if (current()) this._state.set('reconnecting');
    });
    connection.onreconnected(() => {
      if (current()) void this.onEstablished(connection);
    });
    connection.onclose(() => {
      if (current()) this._state.set('disconnected');
    });
  }

  /** Runs after the first connect and after every automatic reconnect. */
  private async onEstablished(connection: HubConnection): Promise<void> {
    this._state.set('connected');
    // A reconnect is a brand-new connection id on the server: user/role/pharmacy groups are rebuilt by
    // PmfHub.OnConnectedAsync, but medicine groups were opt-in and are gone until we ask again.
    await Promise.all(
      [...this.watched.keys()].map((id) =>
        connection.invoke(HUB_METHODS.watchMedicine, id).catch((e) => console.warn('Live sync: rejoin failed.', e)),
      ),
    );
    this.connectedSubject.next();
  }

  private invokeIfConnected(method: string, medicineId: number): void {
      if (this._state() !== 'connected' || !this.connection) return;
    this.connection.invoke(method, medicineId).catch((e) => console.warn(`Live sync: ${method} failed.`, e));
  }
}