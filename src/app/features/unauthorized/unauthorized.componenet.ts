import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './unauthorized.componenet.html',
  styleUrl: './unauthorized.componenet.css',
})
export class UnauthorizedComponent {}