import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = 'http://localhost:3000/api/notification';

  constructor(private http: HttpClient) {}

  getNotifications(userId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${userId}`, { withCredentials: true });
  }
}
