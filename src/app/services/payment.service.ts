import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { Payment, PaymentCreate, PaymentUpdate, PaymentFilter } from '../models/payment.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  getPayments(
    pageIndex: number = 0,
    pageSize: number = 10,
    filter?: PaymentFilter
  ): Observable<PaginatedResponse<Payment>> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString());

    if (filter) {
      if (filter.startDate) params = params.set('startDate', filter.startDate.toISOString());
      if (filter.endDate) params = params.set('endDate', filter.endDate.toISOString());
      if (filter.developerId) params = params.set('developerId', filter.developerId.toString());
      if (filter.projectId) params = params.set('projectId', filter.projectId.toString());
      if (filter.status) params = params.set('status', filter.status.toString());
    }

    return this.http.get<ApiResponse<PaginatedResponse<Payment>>>(`${this.apiUrl}`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch payments');
        })
      );
  }

  getPaymentById(id: number): Observable<Payment> {
    return this.http.get<ApiResponse<Payment>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Payment not found');
        })
      );
  }

  createPayment(payment: PaymentCreate): Observable<Payment> {
    return this.http.post<ApiResponse<Payment>>(`${this.apiUrl}`, payment)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to create payment');
        })
      );
  }

  updatePayment(id: number, payment: PaymentUpdate): Observable<Payment> {
    return this.http.put<ApiResponse<Payment>>(`${this.apiUrl}/${id}`, payment)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to update payment');
        })
      );
  }

  deletePayment(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to delete payment');
        })
      );
  }

  getPaymentsByDeveloper(developerId: number): Observable<Payment[]> {
    return this.http.get<ApiResponse<Payment[]>>(`${this.apiUrl}/developer/${developerId}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch developer payments');
        })
      );
  }

  getPaymentsByProject(projectId: number): Observable<Payment[]> {
    return this.http.get<ApiResponse<Payment[]>>(`${this.apiUrl}/project/${projectId}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch project payments');
        })
      );
  }
}
