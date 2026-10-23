import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { InventoryService } from '../../../services/inventory.service';

type HistoryPage = ReturnType<InventoryService['getPriceHistory']> extends Observable<infer T>
  ? T
  : never;

@Component({
  selector: 'app-inventory-history',
  imports: [RouterLink, DatePipe, DecimalPipe, MatPaginatorModule],
  templateUrl: './inventory-history.component.html',
  styleUrl: './inventory-history.component.scss',
})
export class InventoryHistoryComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly inventoryService = inject(InventoryService);

  // Route is /pharmacy/inventory/:pharmacyId/:id/history. The pharmacyId is only used for the
  // back link; the API authorizes by looking up which pharmacy owns the inventory row itself.
  readonly pharmacyId = Number(this.route.snapshot.paramMap.get('pharmacyId'));
  readonly inventoryId = Number(this.route.snapshot.paramMap.get('id'));

  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly descending = signal(true);

  // One request per (page, pageSize, direction). Changing any signal re-runs the stream.
  readonly history = rxResource({
    params: () => ({
      inventoryId: this.inventoryId,
      page: this.pageIndex() + 1,
      pageSize: this.pageSize(),
      descending: this.descending(),
    }),
    stream: ({ params }) =>
      this.inventoryService.getPriceHistory(params.inventoryId, {
        page: params.page,
        pageSize: params.pageSize,
        descending: params.descending,
      }),
  });

  // Keeps the previous page on screen while the next one loads, so the paginator is not torn down.
  readonly page = linkedSignal<HistoryPage | undefined, HistoryPage | undefined>({
    source: () => this.history.value(),
    computation: (current, previous) => current ?? previous?.value,
  });

  readonly rows = computed(() =>
    (this.page()?.items ?? []).map((change) => {
      const delta = change.newPrice - change.oldPrice;
      return {
        ...change,
        delta,
        percent: change.oldPrice === 0 ? null : (delta / change.oldPrice) * 100,
        direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
      } as const;
    }),
  );
  readonly total = computed(() => this.page()?.totalCount ?? 0);

  readonly errorMessage = computed(() => {
    const raw: any = this.history.error();
    if (!raw) return '';
    const e = raw.cause ?? raw; // rxResource wraps HttpErrorResponse
    if (e?.status === 403) return "You don't have permission to view this pricing history.";
    if (e?.status === 404) return 'This inventory record no longer exists.';
    return e?.error?.detail || e?.error?.message || 'Failed to load price history.';
  });

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  toggleOrder(): void {
    this.descending.update((value) => !value);
    this.pageIndex.set(0);
  }

  refresh(): void {
    this.history.reload();
  }
}