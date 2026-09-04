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

   
    getInventoryByPharmacyAndMedicine(pharmacyId: number,
      medicineId: number): Observable<InventoryRecord> {
  return this.http.get<InventoryRecord>(this.inventoryUrl(pharmacyId), {
    params: { medicineId: medicineId.toString() },
  });
}
  
  create(pharmacyId: number, payload: CreateInventoryRequest): Observable<InventoryRecord> {
    return this.http.post<InventoryRecord>(this.inventoryUrl(pharmacyId), payload);
  }

 }
