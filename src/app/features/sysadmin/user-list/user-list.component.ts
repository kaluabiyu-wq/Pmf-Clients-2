import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AccountStatus, AdminUserQuery } from '../../../model/admin.model';
import { AdminService } from '../../../services/admin.service';

type SortField = NonNullable<AdminUserQuery['orderBy']>;

@Component({
  selector: 'app-user-list',
  imports: [FormsModule, RouterLink, DatePipe, MatPaginatorModule],
  templateUrl: './user-list.component.html',
  styleUrl: '../sysadmin-shared.scss',
})
export class UserListComponent {
  private readonly admin = inject(AdminService);
  private readonly route = inject(ActivatedRoute);

  readonly statuses: AccountStatus[] = ['Active', 'Suspended', 'Inactive', 'Deleted'];

  // What the inputs show while typing, versus what the table is actually filtered by.
  readonly searchInput = signal('');
  private readonly appliedSearch = signal('');

  readonly roleId = signal<number | ''>(Number(this.route.snapshot.queryParamMap.get('roleId')) || '');
  readonly status = signal<AccountStatus | ''>('');
  readonly orderBy = signal<SortField>('CreatedAt');
  readonly descending = signal(true);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(20);

  readonly roles = rxResource({ stream: () => this.admin.roles() });

  readonly users = rxResource({
    params: () => ({
      search: this.appliedSearch(),
      roleId: this.roleId(),
      status: this.status(),
      orderBy: this.orderBy(),
      descending: this.descending(),
      page: this.pageIndex() + 1,
      pageSize: this.pageSize(),
    }),
    stream: ({ params: p }) =>
      this.admin.listUsers({
        search: p.search || undefined,
        roleId: p.roleId === '' ? undefined : p.roleId,
        status: p.status === '' ? undefined : p.status,
        orderBy: p.orderBy,
        descending: p.descending,
        page: p.page,
        pageSize: p.pageSize,
      }),
  });

  applySearch(): void {
    this.pageIndex.set(0);
    this.appliedSearch.set(this.searchInput().trim());
  }

  clearSearch(): void {
    this.searchInput.set('');
    this.applySearch();
  }

  /** Any filter change goes back to the first page. */
  setFilter(apply: () => void): void {
    apply();
    this.pageIndex.set(0);
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }
}