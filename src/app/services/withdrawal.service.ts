import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { Withdrawal, WithdrawalCreate, WithdrawalUpdate } from '../models/withdrawal.model';

@Injectable({ providedIn: 'root' })
export class WithdrawalService {
  private apiUrl = `${environment.apiUrl}/withdrawals`;

  constructor(private http: HttpClient) {}

  getWithdrawals(startDate?: Date, endDate?: Date): Observable<Withdrawal[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());
    return this.http.get<any>(this.apiUrl, { params }).pipe(map(r => r.data));
  }

  getWithdrawalById(id: number): Observable<Withdrawal> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(map(r => r.data));
  }

  createWithdrawal(withdrawal: WithdrawalCreate): Observable<Withdrawal> {
    return this.http.post<any>(this.apiUrl, withdrawal).pipe(map(r => r.data));
  }

  updateWithdrawal(id: number, withdrawal: WithdrawalUpdate): Observable<Withdrawal> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, withdrawal).pipe(map(r => r.data));
  }

  deleteWithdrawal(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(map(r => r.data));
  }

  getFiverrBalance(): Observable<number> {
    return this.http.get<any>(`${this.apiUrl}/balance`).pipe(map(r => r.data));
  }
}
