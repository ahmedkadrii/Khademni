import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userId!: string; // Store the user ID
  private baseUrl = 'http://localhost:3000/api'; // Your backend API base URL
  loginSuccessEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private http: HttpClient) { }

  registerUser(userData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/user/signup`, userData);
  }

  registerEnterprise(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/enterprise/signup`, formData, {
      withCredentials: true
    });
  }



  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/login`, { email, password }, { withCredentials: true });
  }

  emitLoginSuccessEvent(isLoggedIn: boolean): void {
    this.loginSuccessEvent.emit(isLoggedIn);
  }

  confirmEmail(token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/confirm/${token}`);
  }


  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/forgot-password`, { email });
  }

  resetPassword(resetToken: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/reset-password/${resetToken}`, { password });
  }

  
}
