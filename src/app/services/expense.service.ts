import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { Expense, ExpenseCreate, ExpenseUpdate } from '../models/expense.model';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private apiUrl = `${environment.apiUrl}/expenses`;

  constructor(private http: HttpClient) {}

  getExpenses(startDate?: Date, endDate?: Date, projectId?: number): Observable<Expense[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());
    if (projectId) params = params.set('projectId', projectId.toString());
    return this.http.get<any>(this.apiUrl, { params }).pipe(map(r => r.data));
  }

  getExpenseById(id: number): Observable<Expense> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(map(r => r.data));
  }

  createExpense(expense: ExpenseCreate): Observable<Expense> {
    return this.http.post<any>(this.apiUrl, expense).pipe(map(r => r.data));
  }

  updateExpense(id: number, expense: ExpenseUpdate): Observable<Expense> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, expense).pipe(map(r => r.data));
  }

  deleteExpense(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(map(r => r.data));
  }
}
