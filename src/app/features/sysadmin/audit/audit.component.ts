import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-audit',
  imports: [FormsModule, RouterLink, DatePipe, MatPaginatorModule],
  templateUrl: './audit.component.html',
  styleUrl: '../sysadmin-shared.scss',
})
export class AuditComponent {
  private readonly admin = inject(AdminService);

  readonly actions = [
    'UserCreated', 'UserUpdated', 'RoleChanged', 'UserSuspended', 'UserDeactivated',
    'UserRestored', 'UserDeleted', 'PasswordReset', 'ResetEmailSent',
  ];

  readonly action = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(20);

  readonly entries = rxResource({
    params: () => ({ action: this.action(), page: this.pageIndex() + 1, pageSize: this.pageSize() }),
    stream: ({ params: p }) =>
      this.admin.audit({ action: p.action || undefined, page: p.page, pageSize: p.pageSize }),
  });

  setAction(value: string): void {
    this.action.set(value);
    this.pageIndex.set(0);
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  /** "UserSuspended" -> "User suspended". */
  label(action: string): string {
    const spaced = action.replace(/([a-z])([A-Z])/g, '$1 $2');
    return spaced.charAt(0) + spaced.slice(1).toLowerCase();
  }
}