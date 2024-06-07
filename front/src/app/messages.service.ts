import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = 'http://localhost:3000/api/messages';

  constructor(private http: HttpClient) { }

  sendMessage(message: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, message, { withCredentials: true });
  }

  getConversations(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/conversations`, { withCredentials: true });
  }

  getMessages(userId2: string, page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/messages/${userId2}`, { params, withCredentials: true });
  }
}
