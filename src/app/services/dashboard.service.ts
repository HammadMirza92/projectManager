import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import {
  AdminDashboard,
  DeveloperDashboard,
  ClientDashboard,
  DeveloperEarning
} from '../models/dashboard.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getAdminDashboard(startDate?: Date, endDate?: Date): Observable<AdminDashboard> {
    let params = new HttpParams();

    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());

    return this.http.get<ApiResponse<AdminDashboard>>(`${this.apiUrl}/admin`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch admin dashboard');
        })
      );
  }

  getDeveloperDashboard(developerId: number): Observable<DeveloperDashboard> {
    return this.http.get<ApiResponse<DeveloperDashboard>>(`${this.apiUrl}/developer/${developerId}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch developer dashboard');
        })
      );
  }

  getClientDashboard(clientId: number): Observable<ClientDashboard> {
    return this.http.get<ApiResponse<ClientDashboard>>(`${this.apiUrl}/client/${clientId}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch client dashboard');
        })
      );
  }

  getDeveloperEarnings(startDate?: Date, endDate?: Date): Observable<DeveloperEarning[]> {
    let params = new HttpParams();

    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());

    return this.http.get<ApiResponse<DeveloperEarning[]>>(`${this.apiUrl}/developer-earnings`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch developer earnings');
        })
      );
  }
}
