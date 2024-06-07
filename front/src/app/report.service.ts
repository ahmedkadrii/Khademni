import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {


  private apiUrl = 'http://localhost:3000/api/report'; // Adjust the URL as necessary

  constructor(private http: HttpClient) { }


  getReports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reports`, { withCredentials: true });
  }

  createReport(id: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}`, { reason }, { withCredentials: true });
  }
  updateReportStatus(reportId: string, status: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/report/${reportId}/update-status`, { status }, { withCredentials: true });
  }


}
