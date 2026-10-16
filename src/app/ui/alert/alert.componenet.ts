// src/app/ui/alert/alert.componenet.ts
import { Component, inject } from '@angular/core';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-alert',
  standalone: true,
  templateUrl: './alert.componenet.html',
  styleUrl: './alert.componenet.scss',
})
export class AlertComponent {
  protected readonly alertService = inject(AlertService);
}