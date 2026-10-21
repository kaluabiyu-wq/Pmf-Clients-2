import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HubConnection } from '@microsoft/signalr';
import { LIVE_EVENTS } from '../model/live-sync.model';
import { AuthService } from './auth-service.service';
import { HUB_CONNECTION_FACTORY, LiveSyncService, retryDelayMs } from './live-sync.service';

/** Just enough of HubConnection for the service: records calls and lets a test fire server events. */
class FakeConnection {
  handlers = new Map<string, (payload: unknown) => void>();
  reconnected: (() => void)[] = [];
  invoked: unknown[][] = [];
  started = 0;
  stopped = 0;

  on(name: string, handler: (payload: unknown) => void) { this.handlers.set(name, handler); }
  onreconnecting() { /* not needed */ }
  onreconnected(cb: () => void) { this.reconnected.push(cb); }
  onclose() { /* not needed */ }
  async start() { this.started++; }
  async stop() { this.stopped++; }
  async invoke(...args: unknown[]) { this.invoked.push(args); }

  emit(name: string, payload: unknown) { this.handlers.get(name)?.(payload); }
  reconnect() { this.reconnected.forEach((cb) => cb()); }
}

const flush = () => new Promise<void>((resolve) => setTimeout(resolve));

describe('LiveSyncService', () => {
  let connections: FakeConnection[];
  let userId: ReturnType<typeof signal<number | null>>;
  let service: LiveSyncService;

  beforeEach(() => {
    connections = [];
    userId = signal<number | null>(null);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => userId() !== null,
            currentUser: () => (userId() === null ? null : { id: userId() }),
            token: () => 'jwt',
          },
        },
        {
          provide: HUB_CONNECTION_FACTORY,
          useValue: () => {
            const fake = new FakeConnection();
            connections.push(fake);
            return fake as unknown as HubConnection;
          },
        },
      ],
    });

    service = TestBed.inject(LiveSyncService);
    TestBed.runInInjectionContext(() => service.activate());
  });

  async function signIn(id = 7) {
    userId.set(id);
    TestBed.tick();
    await flush();
  }

  it('stays disconnected until someone signs in', () => {
    TestBed.tick();
    expect(connections.length).toBe(0);
    expect(service.state()).toBe('disconnected');
  });

  it('connects on login and disconnects on logout', async () => {
    await signIn();
    expect(connections.length).toBe(1);
    expect(connections[0].started).toBe(1);
    expect(service.state()).toBe('connected');

    userId.set(null);
    TestBed.tick();
    await flush();
    expect(connections[0].stopped).toBe(1);
    expect(service.state()).toBe('disconnected');
  });

  it('replaces the connection when a different user signs in', async () => {
    await signIn(1);
    await signIn(2);
    expect(connections.length).toBe(2);
    expect(connections[0].stopped).toBe(1);
    expect(service.state()).toBe('connected');
  });

  it('routes server events to the matching typed stream', async () => {
    await signIn();
    const received: unknown[] = [];
    service.orderStatusChanged$.subscribe((m) => received.push(m));
    service.orderCreated$.subscribe(() => received.push('wrong stream'));

    const message = { orderId: 5, pharmacyId: 2, patientUserId: 7, status: 'Confirmed' };
    connections[0].emit(LIVE_EVENTS.orderStatusChanged, message);

    expect(received).toEqual([message]);
  });

  it('shares one server-side membership between watchers of the same medicine', async () => {
    await signIn();
    const releaseA = service.watchMedicine(9);
    const releaseB = service.watchMedicine(9);
    expect(connections[0].invoked).toEqual([['WatchMedicine', 9]]);

    releaseA();
    releaseA(); // releasing twice must not drop B's hold
    expect(connections[0].invoked.length).toBe(1);

    releaseB();
    expect(connections[0].invoked).toEqual([['WatchMedicine', 9], ['UnwatchMedicine', 9]]);
  });

  it('re-joins watched medicines and announces itself after a reconnect', async () => {
    await signIn();
    service.watchMedicine(9);
    connections[0].invoked.length = 0;

    let announced = 0;
    service.connected$.subscribe(() => announced++);
    connections[0].reconnect();
    await flush();

    expect(connections[0].invoked).toEqual([['WatchMedicine', 9]]);
    expect(announced).toBe(1);
  });

  it('joins medicines watched before the connection existed once it connects', async () => {
    service.watchMedicine(4);
    await signIn();
    expect(connections[0].invoked).toEqual([['WatchMedicine', 4]]);
  });

  it('backs off 1s, 2s, 4s ... and caps at 30s', () => {
    expect([0, 1, 2, 3, 4].map(retryDelayMs)).toEqual([1000, 2000, 4000, 8000, 16000]);
    expect(retryDelayMs(5)).toBe(30000);
    expect(retryDelayMs(50)).toBe(30000);
  });
});