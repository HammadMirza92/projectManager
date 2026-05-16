import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { WebsiteLink, WebsiteLinkCreate, WebsiteLinkUpdate } from '../models/website-link.model';

@Injectable({ providedIn: 'root' })
export class WebsiteLinkService {
  private apiUrl = `${environment.apiUrl}/websitelinks`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<WebsiteLink[]> {
    return this.http.get<any>(this.apiUrl).pipe(map(r => r.data));
  }

  getById(id: number): Observable<WebsiteLink> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(map(r => r.data));
  }

  create(payload: WebsiteLinkCreate): Observable<WebsiteLink> {
    return this.http.post<any>(this.apiUrl, payload).pipe(map(r => r.data));
  }

  update(id: number, payload: WebsiteLinkUpdate): Observable<WebsiteLink> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(map(r => r.data));
  }

  toggleActive(id: number, isActive: boolean): Observable<WebsiteLink> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { isActive }).pipe(map(r => r.data));
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(map(r => r.data));
  }
}
