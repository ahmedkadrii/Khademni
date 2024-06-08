import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = 'http://localhost:3000/api';
  
  constructor(private http: HttpClient) {}

  getProfile(username: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/profile/${username}`);
  }
  
  getDashboardInfo(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/auth/dashboard`, { withCredentials: true });
  }

  updateProfile(username: string, profileData: any): Observable<any> {
   const url = `${this.baseUrl}/auth/${username}`;
     return this.http.put<any>(url, profileData, { withCredentials: true });
  }
      


  logout(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/auth/logout`, { withCredentials: true });
  }

  checkAuthStatus(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/auth/check-auth-status`, { withCredentials: true });
  }

  uploadCV(cvFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('cv', cvFile, cvFile.name);

    return this.http.post<any>(`${this.baseUrl}/profile/upload-cv`, formData, { withCredentials: true });
  }


  uploadLogo(username: string, logoFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('logo', logoFile, logoFile.name);
    return this.http.post<any>(`${this.baseUrl}/profile/${username}/upload-logo`, formData, { withCredentials: true });
  }

  // Post-related API calls
  createPost(content: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/posts`, { content }, { withCredentials: true });
  }

  getPostsByUsername(username: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${username}/posts`, { withCredentials: true });
  }

  updatePost(postId: string, content: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/posts/${postId}`, { content }, { withCredentials: true });
  }

  deletePost(postId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/posts/${postId}`, { withCredentials: true });
  }



  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/user/all`, { withCredentials: true });
   }

   getEnterprises(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/enterprise/all`, { withCredentials: true });
   }
  // Follow a user
  followUser(targetUsername: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/profile/follow/${targetUsername}`, {}, { withCredentials: true });
  }

  // Unfollow a user
  unfollowUser(targetUsername: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/profile/unfollow/${targetUsername}`, {}, { withCredentials: true });
  }

  isFollowingUser(username: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/profile/is-following/${username}`, { withCredentials: true });
  }

  requestDeletion(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/request-deletion`, {}, { withCredentials: true });
  }

  deleteEnterprise(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/ent/${id}`, { withCredentials: true });
  }

  deleteUserAccount(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/user/${id}`, { withCredentials: true });
  }

}



