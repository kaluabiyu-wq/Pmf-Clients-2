import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateInventoryRequest,
  InventoryRecord,
  MedicinePharmacyInventoryResponse,
  PharmacyMedicineDetail,
} from '../model/inventory.model';

/**
 * Maps 1:1 onto PmfApi.Api.Controllers.InventoryController.
 *
 * That controller is mounted at [Route("api/pharmacies/{pharmacyId:int}/inventory")],
 * with the literal "api/" segment baked into the C# attribute itself --
 * unlike TmsApi, PMFApi has no {version:apiVersion} route token at all.
 * That means `environment.apiBaseUrl` here must be the bare host + port
 * (e.g. 'http://localhost:5135'), NOT 'http://localhost:5135/api' --
 * if apiBaseUrl already contains a trailing /api, every request below
 * doubles it to /api/api/pharmacies/... and 404s. Worth confirming
 * against the actual environment.ts, which wasn't part of what was
 * uploaded here.
 *
 * PmfDbContext seeds no API versioning and CORS is locked to
 * http://localhost:4200 (see Program.cs AddCors "AllowAngular"), so this
 * only works against `ng serve`'s default port as-is.
 */
@Injectable({ providedIn: 'root' })
export class InventoryService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  private inventoryUrl(pharmacyId: number): string {
    return `${this.baseUrl}/pharmacies/${pharmacyId}/inventory`;
  }

  getMedicinesByPharmacy(pharmacyId: number): Observable<PharmacyMedicineDetail[]> {
    return this.http.get<PharmacyMedicineDetail[]>(`${this.inventoryUrl(pharmacyId)}/medicines`);
  }

  
  getById(pharmacyId: number, id: number): Observable<InventoryRecord> {
    return this.http.get<InventoryRecord>(`${this.inventoryUrl(pharmacyId)}/${id}`);
  }

  
  getByMedicine(pharmacyId: number, medicineId: number): Observable<InventoryRecord> {
    return this.http.get<InventoryRecord>(this.inventoryUrl(pharmacyId), {
      params: { medicineId: medicineId.toString() },
    });
  }

  
  getPharmaciesByMedicine(medicineId: number): Observable<MedicinePharmacyInventoryResponse> {
    return this.http.get<MedicinePharmacyInventoryResponse>(
      `${this.baseUrl}/inventory/medicines/${medicineId}/pharmacies`
    );
  }

  
  getAllMedicinesWithPharmacies(): Observable<MedicinePharmacyInventoryResponse[]> {
    return this.http.get<MedicinePharmacyInventoryResponse[]>(
      `${this.baseUrl}/inventory/medicines/pharmacies`
    );
  }

  
  create(pharmacyId: number, payload: CreateInventoryRequest): Observable<InventoryRecord> {
    return this.http.post<InventoryRecord>(this.inventoryUrl(pharmacyId), payload);
  }

 }
