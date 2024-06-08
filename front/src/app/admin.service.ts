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


    // Method to get all contact messages
    getAllContactMessages(): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/contact/messages`, { withCredentials: true });
    }
  
  // Method to submit a contact message
  submitContactMessage(contactData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/contact`, contactData);
  }

  deleteJob(jobId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/job/${jobId}`, { withCredentials: true });
  }

    // Method to send a reply email
    sendReplyEmail(replyData: any): Observable<any> {
      return this.http.post(`${this.apiUrl}/reply`, replyData , { withCredentials: true });
    }
  
}
