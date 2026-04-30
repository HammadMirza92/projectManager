import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { Withdrawal, WithdrawalCreate, WithdrawalUpdate } from '../models/withdrawal.model';
import {
  WithdrawalReport, DevPaymentTransfer, DevPaymentTransferCreate,
  DevBalanceSummary, FiverrDeposit, FiverrDepositCreate,
  AdminWithdrawal, AdminWithdrawalCreate
} from '../models/withdrawal-report.model';

@Injectable({ providedIn: 'root' })
export class WithdrawalService {
  private api = `${environment.apiUrl}/withdrawals`;

  constructor(private http: HttpClient) {}

  // ── Fiverr Withdrawals ──────────────────────────────────────────
  getWithdrawals(startDate?: Date, endDate?: Date): Observable<Withdrawal[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate)   params = params.set('endDate', endDate.toISOString());
    return this.http.get<any>(this.api, { params }).pipe(map(r => r.data));
  }

  getWithdrawalById(id: number): Observable<Withdrawal> {
    return this.http.get<any>(`${this.api}/${id}`).pipe(map(r => r.data));
  }

  createWithdrawal(withdrawal: WithdrawalCreate): Observable<Withdrawal> {
    return this.http.post<any>(this.api, withdrawal).pipe(map(r => r.data));
  }

  deleteWithdrawal(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.api}/${id}`).pipe(map(r => r.data));
  }

  getFiverrBalance(): Observable<number> {
    return this.http.get<any>(`${this.api}/balance`).pipe(map(r => r.data));
  }

  // ── Reports ─────────────────────────────────────────────────────
  getReports(search?: string, startDate?: Date, endDate?: Date): Observable<WithdrawalReport[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate)   params = params.set('endDate', endDate.toISOString());
    return this.http.get<any>(`${this.api}/reports`, { params }).pipe(map(r => r.data));
  }

  getReport(id: number): Observable<WithdrawalReport> {
    return this.http.get<any>(`${this.api}/reports/${id}`).pipe(map(r => r.data));
  }

  // ── Dev Payment Transfers ────────────────────────────────────────
  getDevPayments(developerId?: number): Observable<DevPaymentTransfer[]> {
    let params = new HttpParams();
    if (developerId) params = params.set('developerId', developerId.toString());
    return this.http.get<any>(`${this.api}/dev-payments`, { params }).pipe(map(r => r.data));
  }

  createDevPayment(dto: DevPaymentTransferCreate): Observable<DevPaymentTransfer> {
    return this.http.post<any>(`${this.api}/dev-payments`, dto).pipe(map(r => r.data));
  }

  deleteDevPayment(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.api}/dev-payments/${id}`).pipe(map(r => r.data));
  }

  getDevBalances(): Observable<DevBalanceSummary[]> {
    return this.http.get<any>(`${this.api}/dev-balance`).pipe(map(r => r.data));
  }

  // ── Fiverr Deposits ──────────────────────────────────────────────
  getDeposits(): Observable<FiverrDeposit[]> {
    return this.http.get<any>(`${this.api}/deposits`).pipe(map(r => r.data));
  }

  createDeposit(dto: FiverrDepositCreate): Observable<FiverrDeposit> {
    return this.http.post<any>(`${this.api}/deposits`, dto).pipe(map(r => r.data));
  }

  deleteDeposit(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.api}/deposits/${id}`).pipe(map(r => r.data));
  }

  // ── Admin Personal Withdrawals ───────────────────────────────────
  getAdminWithdrawals(): Observable<AdminWithdrawal[]> {
    return this.http.get<any>(`${this.api}/admin-withdrawals`).pipe(map(r => r.data));
  }

  createAdminWithdrawal(dto: AdminWithdrawalCreate): Observable<AdminWithdrawal> {
    return this.http.post<any>(`${this.api}/admin-withdrawals`, dto).pipe(map(r => r.data));
  }

  deleteAdminWithdrawal(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.api}/admin-withdrawals/${id}`).pipe(map(r => r.data));
  }
}
