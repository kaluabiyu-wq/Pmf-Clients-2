import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-roles',
  imports: [RouterLink],
  templateUrl: './roles.component.html',
  styleUrl: '../sysadmin-shared.scss',
})
export class RolesComponent {
  readonly roles = rxResource({ stream: () => inject(AdminService).roles() });
}