import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateMedicineRequest, Medicine, PagedResponse } from '../model/medicine.model';

@Injectable({ providedIn: 'root' })
export class MedicineService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/medicine`;

  getAll(page = 1, pageSize = 50): Observable<Medicine[]> {
    return this.getPage(page, pageSize).pipe(map((p) => p.items));
  }

  
  getPage(page = 1, pageSize = 50): Observable<PagedResponse<Medicine>> {
    return this.http.get<PagedResponse<Medicine>>(this.baseUrl, {
      params: { page: page.toString(), pageSize: pageSize.toString() },
    });
  }

  getById(id: number): Observable<Medicine> {
     return this.http.get<Medicine>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateMedicineRequest): Observable<Medicine> {
    return this.http.post<Medicine>(this.baseUrl, payload);
  }
}
