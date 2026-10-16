// src/app/services/alert.service.ts
import { Injectable, signal } from '@angular/core';

export type AlertKind = 'success' | 'error' | 'warning' | 'info';

export interface AlertMessage {
  id: number;
  kind: AlertKind;
  text: string;
}

/** How long each kind stays on screen (ms). 0 = stays until dismissed. */
const DURATION: Record<AlertKind, number> = {
  success: 4000,
  info: 5000,
  warning: 7000,
  error: 0,
};

@Injectable({ providedIn: 'root' })
export class AlertService {
  private nextId = 1;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  private readonly _alerts = signal<AlertMessage[]>([]);
  readonly alerts = this._alerts.asReadonly();

  success(text: string, duration = DURATION.success): void { this.show('success', text, duration); }
  error(text: string, duration = DURATION.error): void { this.show('error', text, duration); }
  warning(text: string, duration = DURATION.warning): void { this.show('warning', text, duration); }
  info(text: string, duration = DURATION.info): void { this.show('info', text, duration); }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer) { clearTimeout(timer); this.timers.delete(id); }
    this._alerts.update((list) => list.filter((a) => a.id !== id));
  }

  clear(): void {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers.clear();
    this._alerts.set([]);
  }

  private show(kind: AlertKind, text: string, duration: number): void {
    // Don't stack identical messages (e.g. a double-clicked button).
    if (this._alerts().some((a) => a.kind === kind && a.text === text)) return;

    const id = this.nextId++;
    this._alerts.update((list) => [...list, { id, kind, text }]);
    if (duration > 0) {
      this.timers.set(id, setTimeout(() => this.dismiss(id), duration));
    }
  }
}