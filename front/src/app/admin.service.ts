import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = 'http://localhost:3000/api/admin'; // Adjust the URL as necessary

  constructor(private http: HttpClient) { }

  PendingEnterprises(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pending-enterprises`, { withCredentials: true });
  }

  approveEnterprise(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/approve-enterprise`, { enterpriseId: id }, { withCredentials: true });
  }

  rejectEnterprise(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reject-enterprise`, { enterpriseId: id }, { withCredentials: true });
  }


  
}
