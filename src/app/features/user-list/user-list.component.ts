import {ChangeDetectionStrategy, Component,
  OnInit, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { LocationService } from '../../services/location.service';
import { UserService } from '../../services/user.service';
import { PagedUserQuery, USER_ROLES, User } from '../../model/user.model';

type SortField = NonNullable<PagedUserQuery['orderBy']>;

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatPaginatorModule, MatSortModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly locationService = inject(LocationService);

  readonly searchTerm = signal('');
  readonly users = signal<User[]>([]);
  readonly totalCount = signal(0);
  readonly isLoading = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly roles = USER_ROLES;

  pageIndex = 0;
  pageSize = 20;
  sortField: SortField | '' = '';
  sortDescending = false;

  private readonly locationsResource = rxResource({
    stream: () => this.locationService.getAll({ pageSize: 200 }),
  });

  readonly locationsById = computed(() => {
    const items = this.locationsResource.value()?.items ?? [];
    return new Map(items.map((location) => [location.id, location]));
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  onSearch(): void {
    this.pageIndex = 0;
    this.loadUsers();
  }

  onClear(): void {
    this.searchTerm.set('');
    this.pageIndex = 0;
    this.loadUsers();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  onSortChange(sort: Sort): void {
    this.sortField = sort.direction ? (sort.active as SortField) : '';
    this.sortDescending = sort.direction === 'desc';
    this.pageIndex = 0;
    this.loadUsers();
  }

  roleName(roleId: number): string {
    return this.roles.find((role) => role.id === roleId)?.name ?? `Role ${roleId}`;
  }

  locationLabel(locationId: number): string {
    return this.locationsById().get(locationId)?.label ?? `Location ${locationId}`;
  }

  private loadUsers(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.userService
      .getAll({
        search: this.searchTerm().trim() || undefined,
        page: this.pageIndex + 1,
        pageSize: this.pageSize,
        orderBy: this.sortField || undefined,
        descending: this.sortField ? this.sortDescending : undefined,
      })
      .subscribe({
        next: (response) => {
          this.users.set(response.items);
          this.totalCount.set(response.totalCount);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.loadError.set('Could not load users. Make sure your .NET API is running.');
        },
      });
  }
}