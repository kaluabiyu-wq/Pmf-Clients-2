import { AfterViewInit, Component, ElementRef, OnDestroy, input, viewChild } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import * as L from 'leaflet';

export const ADDIS_SUBCITIES = [
  'Addis Ketema', 'Akaky Kaliti', 'Arada', 'Bole', 'Gullele', 'Kirkos',
  'Kolfe Keranio', 'Lideta', 'Lemi Kura', 'Nifas Silk-Lafto', 'Yeka',
];

const ADDIS_CENTER: L.LatLngExpression = [9.0108, 38.7613];

@Component({
  selector: 'app-location-fields',
  imports: [ReactiveFormsModule],
  template: `
  <div class="location-fields" [formGroup]="group()">
    <div #map class="map" role="application"
         aria-label="Map. Click to choose your location."></div>

    <button type="button" class="btn-secondary" (click)="useMyLocation()">
      Use my current location
    </button>

    @if (group().controls['latitude'].value !== null) {
      <p class="coords">
        Pinned: {{ group().controls['latitude'].value }},
        {{ group().controls['longitude'].value }}
      </p>
    } @else if (group().touched) {
      <span class="error">Click the map to choose a location.</span>
    }

    <div class="field">
      <label for="locLabel">Place name</label>
      <input id="locLabel" formControlName="label" placeholder="e.g. Near Bole Medhanialem" />
    </div>

    <div class="row">
      <div class="field">
        <label for="subcity">Subcity</label>
        <select id="subcity" formControlName="subcity">
          <option value="" disabled>Select subcity</option>
          @for (s of subcities; track s) { <option [value]="s">{{ s }}</option> }
        </select>
      </div>
      <div class="field">
        <label for="woreda">Woreda</label>
        <input id="woreda" formControlName="woreda" placeholder="e.g. 03" />
      </div>
    </div>
  </div>
`,
  styles: [`.map { height: 320px; border-radius: 8px; margin-bottom: .5rem; }`],
})
export class LocationFieldsComponent implements AfterViewInit, OnDestroy {
  /** FormGroup with: label, subcity, woreda, latitude, longitude */
  readonly group = input.required<FormGroup>();
  readonly subcities = ADDIS_SUBCITIES;
  private readonly mapEl = viewChild.required<ElementRef<HTMLDivElement>>('map');

  private map?: L.Map;
  private marker?: L.CircleMarker;

  ngAfterViewInit(): void {
    this.map = L.map(this.mapEl().nativeElement).setView(ADDIS_CENTER, 12);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => this.setPoint(e.latlng.lat, e.latlng.lng));

    // Restore the pin if the form already has a value
    const { latitude, longitude } = this.group().getRawValue();
    if (latitude !== null && longitude !== null) this.setPoint(latitude, longitude);
  }

  useMyLocation(): void {
    navigator.geolocation?.getCurrentPosition(
      (pos) => this.setPoint(pos.coords.latitude, pos.coords.longitude, true),
      () => { /* permission denied: user can still click the map */ },
    );
  }

  private setPoint(lat: number, lng: number, recenter = false): void {
    const latlng = L.latLng(lat, lng);
    // circleMarker avoids Leaflet's default-icon asset problem with Angular builds
    this.marker
      ? this.marker.setLatLng(latlng)
      : (this.marker = L.circleMarker(latlng, { radius: 10 }).addTo(this.map!));
    if (recenter) this.map!.setView(latlng, 16);

    this.group().patchValue({
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
    });
    this.group().markAsDirty();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}