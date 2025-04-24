import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { Project, ProjectCreate, ProjectUpdate, ProjectFilter } from '../models/project.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  getProjects(
    pageIndex: number = 0,
    pageSize: number = 10,
    filter?: ProjectFilter
  ): Observable<PaginatedResponse<Project>> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString());

    if (filter) {
      if (filter.startDate) params = params.set('startDate', filter.startDate.toISOString());
      if (filter.endDate) params = params.set('endDate', filter.endDate.toISOString());
      if (filter.developerId) params = params.set('developerId', filter.developerId.toString());
      if (filter.status) params = params.set('status', filter.status.toString());
      if (filter.platform) params = params.set('platform', filter.platform);
    }

    return this.http.get<ApiResponse<PaginatedResponse<Project>>>(`${this.apiUrl}`, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch projects');
        })
      );
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<ApiResponse<Project>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Project not found');
        })
      );
  }

  createProject(project: ProjectCreate): Observable<Project> {
    return this.http.post<ApiResponse<Project>>(`${this.apiUrl}`, project)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to create project');
        })
      );
  }

  updateProject(id: number, project: ProjectUpdate): Observable<Project> {
    return this.http.put<ApiResponse<Project>>(`${this.apiUrl}/${id}`, project)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to update project');
        })
      );
  }

  deleteProject(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to delete project');
        })
      );
  }

  getProjectsByDeveloper(developerId: number): Observable<Project[]> {
    return this.http.get<ApiResponse<Project[]>>(`${this.apiUrl}/developer/${developerId}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch developer projects');
        })
      );
  }

  getProjectsByClient(clientId: number): Observable<Project[]> {
    return this.http.get<ApiResponse<Project[]>>(`${this.apiUrl}/client/${clientId}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch client projects');
        })
      );
  }

  getUpcomingDeadlines(): Observable<Project[]> {
    return this.http.get<ApiResponse<Project[]>>(`${this.apiUrl}/upcoming-deadlines`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch upcoming deadlines');
        })
      );
  }
}
