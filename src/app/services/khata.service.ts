import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import {
  KhataEntry, KhataEntryCreate, KhataEntryUpdate,
  KhataExpense, KhataExpenseCreate, KhataExpenseUpdate,
  KhataDashboard, MonthlyExpenseSummary,
  KhataIncome, KhataIncomeCreate, KhataIncomeUpdate
} from '../models/khata.model';

@Injectable({ providedIn: 'root' })
export class KhataService {
  private apiUrl = `${environment.apiUrl}/khata`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<KhataDashboard> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`).pipe(map(r => r.data));
  }

  // Entries
  getEntries(params?: { type?: string; status?: string; month?: number; year?: number; search?: string }): Observable<KhataEntry[]> {
    let p = new HttpParams();
    if (params?.type) p = p.set('type', params.type);
    if (params?.status) p = p.set('status', params.status);
    if (params?.month) p = p.set('month', params.month.toString());
    if (params?.year) p = p.set('year', params.year.toString());
    if (params?.search) p = p.set('search', params.search);
    return this.http.get<any>(`${this.apiUrl}/entries`, { params: p }).pipe(map(r => r.data));
  }

  getEntry(id: number): Observable<KhataEntry> {
    return this.http.get<any>(`${this.apiUrl}/entries/${id}`).pipe(map(r => r.data));
  }

  createEntry(entry: KhataEntryCreate): Observable<KhataEntry> {
    return this.http.post<any>(`${this.apiUrl}/entries`, entry).pipe(map(r => r.data));
  }

  updateEntry(id: number, entry: KhataEntryUpdate): Observable<KhataEntry> {
    return this.http.put<any>(`${this.apiUrl}/entries/${id}`, entry).pipe(map(r => r.data));
  }

  deleteEntry(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/entries/${id}`).pipe(map(r => r.data));
  }

  payEntry(id: number, amount: number, paidAt?: Date): Observable<KhataEntry> {
    return this.http.post<any>(`${this.apiUrl}/entries/${id}/pay`, { amount, paidAt }).pipe(map(r => r.data));
  }

  sendReminder(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/entries/${id}/send-reminder`, {}).pipe(map(r => r));
  }

  getEntryHistory(params?: { type?: string; search?: string }): Observable<KhataEntry[]> {
    let p = new HttpParams();
    if (params?.type) p = p.set('type', params.type);
    if (params?.search) p = p.set('search', params.search);
    return this.http.get<any>(`${this.apiUrl}/entries/history`, { params: p }).pipe(map(r => r.data));
  }

  getExpenseHistory(params?: { category?: string; search?: string }): Observable<KhataExpense[]> {
    let p = new HttpParams();
    if (params?.category) p = p.set('category', params.category);
    if (params?.search) p = p.set('search', params.search);
    return this.http.get<any>(`${this.apiUrl}/expenses/history`, { params: p }).pipe(map(r => r.data));
  }

  // Expenses
  getExpenses(params?: { month?: number; year?: number; category?: string; search?: string; includeOutstanding?: boolean; showFuture?: boolean }): Observable<KhataExpense[]> {
    let p = new HttpParams();
    if (params?.month) p = p.set('month', params.month.toString());
    if (params?.year) p = p.set('year', params.year.toString());
    if (params?.category) p = p.set('category', params.category);
    if (params?.search) p = p.set('search', params.search);
    if (params?.includeOutstanding) p = p.set('includeOutstanding', 'true');
    if (params?.showFuture) p = p.set('showFuture', 'true');
    return this.http.get<any>(`${this.apiUrl}/expenses`, { params: p }).pipe(map(r => r.data));
  }

  getExpense(id: number): Observable<KhataExpense> {
    return this.http.get<any>(`${this.apiUrl}/expenses/${id}`).pipe(map(r => r.data));
  }

  createExpense(expense: KhataExpenseCreate): Observable<KhataExpense> {
    return this.http.post<any>(`${this.apiUrl}/expenses`, expense).pipe(map(r => r.data));
  }

  updateExpense(id: number, expense: KhataExpenseUpdate): Observable<KhataExpense> {
    return this.http.put<any>(`${this.apiUrl}/expenses/${id}`, expense).pipe(map(r => r.data));
  }

  deleteExpense(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/expenses/${id}`).pipe(map(r => r.data));
  }

  getExpenseSummary(): Observable<MonthlyExpenseSummary[]> {
    return this.http.get<any>(`${this.apiUrl}/expenses/summary`).pipe(map(r => r.data));
  }

  payExpenseOccurrence(id: number, occurrenceDate: string, notes?: string): Observable<KhataExpense> {
    return this.http.post<any>(`${this.apiUrl}/expenses/${id}/pay-occurrence`, { occurrenceDate, notes }).pipe(map(r => r.data));
  }

  ignoreExpenseOccurrence(id: number, occurrenceDate: string, notes?: string): Observable<KhataExpense> {
    return this.http.post<any>(`${this.apiUrl}/expenses/${id}/ignore-occurrence`, { occurrenceDate, notes }).pipe(map(r => r.data));
  }

  // Incomes
  getIncomes(params?: { month?: number; year?: number }): Observable<KhataIncome[]> {
    let p = new HttpParams();
    if (params?.month) p = p.set('month', params.month.toString());
    if (params?.year) p = p.set('year', params.year.toString());
    return this.http.get<any>(`${this.apiUrl}/incomes`, { params: p }).pipe(map(r => r.data));
  }

  createIncome(income: KhataIncomeCreate): Observable<KhataIncome> {
    return this.http.post<any>(`${this.apiUrl}/incomes`, income).pipe(map(r => r.data));
  }

  updateIncome(id: number, income: KhataIncomeUpdate): Observable<KhataIncome> {
    return this.http.put<any>(`${this.apiUrl}/incomes/${id}`, income).pipe(map(r => r.data));
  }

  deleteIncome(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/incomes/${id}`).pipe(map(r => r.data));
  }
}
