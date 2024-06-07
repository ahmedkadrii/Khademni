import { Component, OnInit } from '@angular/core';
import { JobService } from '../job.service';
import { UserService } from '../user.service';
import { switchMap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { JobDetailsModalComponent } from '../job-details-modal/job-details-modal.component';

@Component({
  selector: 'app-joblist',
  templateUrl: './joblist.component.html',
  styleUrls: ['./joblist.component.css']
})
export class JoblistComponent implements OnInit {

  jobs: any[] = [];
  isLoggedIn: boolean = false;
  isEnterprise: boolean = false;
  userId: string = '';
  cities: string[] = ["Tunis", "Sfax", "Sousse", "Ettadhamen", "Kairouan", "Bizerte", "Gabes", "Ariana", "Gafsa", "El Mourouj", "Kasserine", "Medenine", "Monastir", "La Goulette", "Tozeur", "Douane", "Korba", "La Marsa", "Gremda", "Jendouba", "Zarzis", "Hammam-Lif", "Mateur"];
  domains: string[] = ["Information Technology", "Finance", "Healthcare", "Education", "Marketing", "Engineering", "Sales", "Customer Service", "Human Resources", "Design", "Consulting", "Management", "Manufacturing", "Research", "Hospitality", "Real Estate", "Media", "Transportation", "Logistics", "Legal", "Nonprofit"];
  types: string[] = ["Full Time", "Part Time", "Remote", "Freelancer"];
  exp: string[] = ["Internship", "2+ Years", "5+ Years", "Fresher"];
  deadline: Date | null = null; // Add the deadline property

  selectedCity: string = '';
  selectedDomain: string = '';
  searchTitle: string = ''; // Add searchTitle property
  minSalary: number | null = null;
  maxSalary: number | null = null; // Add maxSalary property
  selectedTypes: string[] = []; // Add selected types
  selectedExp: string[] = []; // Add selected experience levels
  isSearchHidden = false;
  bookmarks: string[] = []; // Store bookmarked job IDs
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(private jobService: JobService, private userService: UserService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.checkAuthStatus();
    this.fetchJobs();

  }

  toggleSearchSection() {
    this.isSearchHidden = !this.isSearchHidden;
  }

  fetchJobs(page: number = 1): void {
    this.jobService.getJobs(page).subscribe(
      response => {
        this.jobs = response.jobs;
        this.currentPage = response.currentPage;
        this.totalPages = response.totalPages;
      },
      error => {
        console.error('Error fetching jobs:', error);
      }
    );
  }


  checkAuthStatus(): void {
    this.userService.checkAuthStatus().pipe(
      switchMap((response: any) => {
        this.isLoggedIn = response.isLoggedIn;
        this.isEnterprise = response.role === 'enterprise';
        if (this.isLoggedIn) {
          this.fetchBookmarks();
        }
        return this.jobService.getJobs(this.currentPage);
      })
    ).subscribe(
      (response: any) => {
        this.jobs = response.jobs;
        this.userId = response.userId;
        this.totalPages = response.totalPages;
      },
      error => {
        console.error('Error fetching jobs:', error);
      }
    );
  }

  fetchBookmarks(): void {
    this.jobService.fetchBookmarks().subscribe(bookmarks => {
      this.bookmarks = bookmarks.map(bookmark => bookmark._id);
    });
  }

  bookmarkJob(jobId: string): void {
    this.jobService.bookmarkJob(this.userId, jobId).subscribe(() => {
      this.bookmarks.push(jobId);
    });
  }

  removeBookmark(jobId: string): void {
    this.jobService.removeBookmark(this.userId, jobId).subscribe(() => {
      this.bookmarks = this.bookmarks.filter(id => id !== jobId);
    });
  }

  isBookmarked(jobId: string): boolean {
    return this.bookmarks.includes(jobId);
  }

  openJobDetails(job: any): void {
    const jobId = job._id;
    const cookieName = `job_viewed_${jobId}`;

    if (!this.getCookie(cookieName)) {
      this.jobService.incrementJobViews(jobId).subscribe(
        response => {
          console.log('Job views incremented:', response.views);
          this.setCookie(cookieName, 'true', 1); // 1 day expiry
        },
        error => {
          console.error('Error incrementing job views:', error);
        }
      );
    }

    const modalRef = this.modalService.open(JobDetailsModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });
    modalRef.componentInstance.job = job;
  }

  getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  setCookie(name: string, value: string, days: number) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  searchJobs(): void {
    const salary = this.minSalary !== null ? this.minSalary : 0;
    const maxSalary = this.maxSalary !== null ? this.maxSalary : undefined;
    this.jobService.searchJobs(this.selectedDomain, this.selectedCity, salary, this.selectedTypes, this.selectedExp, this.searchTitle, maxSalary).subscribe(
      (response: any) => {
        this.jobs = response.jobs;
      },
      error => {
        console.error('Error searching jobs:', error);
      }
    );
  }
  
  toggleTypeSelection(type: string): void {
    const index = this.selectedTypes.indexOf(type);
    if (index > -1) {
      this.selectedTypes.splice(index, 1);
    } else {
      this.selectedTypes.push(type);
    }
  }

  toggleExpSelection(exp: string): void {
    const index = this.selectedExp.indexOf(exp);
    if (index > -1) {
      this.selectedExp.splice(index, 1);
    } else {
      this.selectedExp.push(exp);
    }
  }

  setSalaryRange(min: number, max: number | null): void {
    this.minSalary = min;
    this.maxSalary = max;
    this.searchJobs(); // Trigger the search with updated salary range
  }

  resetFilters(): void {
    this.selectedCity = '';
    this.selectedDomain = '';
    this.searchTitle = '';
    this.minSalary = null;
    this.maxSalary = null;
    this.selectedTypes = [];
    this.selectedExp = [];
    this.searchJobs(); // Optionally, trigger a new search with cleared filters
  }


  previousPage(): void {
    if (this.currentPage > 1) {
      this.fetchJobs(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.fetchJobs(this.currentPage + 1);
    }
  }


}
