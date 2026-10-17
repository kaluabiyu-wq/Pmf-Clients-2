import { Component, computed, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { PharmacyAdminManageService } from '../../../services/pharmacy-admin-manage.service';
import { InventoryComponent } from '../../pharmacy/inventory/inventory.component';
import { PharmacyOrdersComponent } from '../../pharmacy/pharmacy-orders/pharmacy-orders.componenet';
import { UserFeedbackListComponent } from '../../pharmacy/user-feedback-list/user-feedback-list.component';

type ScopeView = 'inventory' | 'orders' | 'feedback';

const LABELS: Record<ScopeView, string> = {
  inventory: 'inventory',
  orders: 'orders',
  feedback: 'user feedback',
};

/**
 * PharmacyAdmin is a platform role, so it has no single "own" pharmacy. This page lets the admin
 * pick any pharmacy and then shows that pharmacy's inventory, orders or feedback by handing the
 * chosen id to the same components the pharmacy owner uses. The choice lives in ?pharmacyId=
 * so a refresh or a back button keeps it.
 */
@Component({
  selector: 'app-pharmacy-scope',
  standalone: true,
  imports: [InventoryComponent, PharmacyOrdersComponent, UserFeedbackListComponent],
  templateUrl: './pharmacy-scope.component.html',
  styleUrl: './pharmacy-scope.component.scss',
})
export class PharmacyScopeComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly manage = inject(PharmacyAdminManageService);

  readonly view = toSignal(
    this.route.data.pipe(map((d) => (d['view'] as ScopeView) ?? 'inventory')),
    { initialValue: 'inventory' as ScopeView },
  );
  readonly label = computed(() => LABELS[this.view()]);

  readonly selectedId = toSignal(
    this.route.queryParamMap.pipe(
      map((q) => {
        const id = Number(q.get('pharmacyId'));
        return Number.isInteger(id) && id > 0 ? id : null;
      }),
    ),
    { initialValue: null as number | null },
  );

  // The API caps a page at 50 rows.
  readonly pharmacies = rxResource({
    stream: () =>
      this.manage.getAll({ page: 1, pageSize: 50, orderBy: 'Name' }).pipe(map((r) => r.items)),
  });

  select(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pharmacyId: id > 0 ? id : null },
      queryParamsHandling: 'merge',
    });
  }
}