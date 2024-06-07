import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, switchMap, map, forkJoin, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobService {

  private baseUrl = 'http://localhost:3000/api';
  
  constructor(private http: HttpClient, private router:Router) {}





  createJob(jobData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/jobs`, jobData, { withCredentials: true });
  }


  getJobs(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/jobs?page=${page}&limit=${limit}`, { withCredentials: true });
  }




  //  api call to get all jobs and display in the stats container
   getAllJobs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/jobs/all`, { withCredentials: true });
   }     




  //  homepage latest jobs
   getLatestJobs(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/jobs/latest`, { withCredentials: true })
      .pipe(map(response => response.jobs)); // Map response to extract jobs array
  }


  // apply for job for USER
  applyForJob(jobId: string, formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/jobs/${jobId}/apply`, formData, { withCredentials: true });
  }





  // edit job for enterprise
  editJob(jobId: string, jobData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/jobs/${jobId}`, jobData, { withCredentials: true });
  }


// get applied jobs for users
      getApplications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/jobs/applied-jobs`, { withCredentials: true });
}




// get applicants for a specific job for enterprise
getApplicantsForJob(jobId: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/jobs/${jobId}/applicants`, { withCredentials: true });
}



// get all jobs by a specific enterprise
getJobsByEnterprise(enterpriseId: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/jobs/${enterpriseId}`, { withCredentials: true });
}

// accept application for enterprise
acceptApplication(applicationId: string, customMessage: string): Observable<any> {
  return this.http.patch(`${this.baseUrl}/jobs/${applicationId}`, { status: 'accepted', customMessage }, { withCredentials: true });
}


// reject application for enterprise

rejectApplication(applicationId: string, customMessage: string): Observable<any> {
  return this.http.patch(`${this.baseUrl}/jobs/${applicationId}`, { status: 'rejected', customMessage }, { withCredentials: true });
}

searchJobs(domain: string, city: string, minSalary: number, types: string[], exp: string[], searchTitle: string,  maxSalary?: number): Observable<any> {
  const params: any = { domain, city, minSalary, types: types.join(','), exp: exp.join(','), title: searchTitle };
  if (maxSalary !== undefined) {
    params.maxSalary = maxSalary;
  }
  return this.http.get<any>(`${this.baseUrl}/jobs/sort-jobs`, { params });
}


  // Add bookmark methods
  bookmarkJob(userId: string, jobId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/jobs/bookmark`, { userId, jobId }, { withCredentials: true });
  }

  removeBookmark(userId: string, jobId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/jobs/removeBookmark`, { userId, jobId }, { withCredentials: true });
  }

  fetchBookmarks(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/jobs/bookmarks`, { withCredentials: true })
      .pipe(
        map(response => response.bookmarks || []) // Ensure we get an array
      );
  }
  


  incrementJobViews(jobId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/jobs/${jobId}/increment-views`);
  }



}