import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { MatDialog } from '@angular/material/dialog';
import { JobService } from '../job.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditJobModalComponent } from '../edit-job-modal/edit-job-modal.component';
import { AdminService } from '../admin.service';
import { ReportService } from '../report.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userId: string = '';
  userRole: string = '';
  jobs: any[] = [];
  applicants: any[] = [];
  appliedJobs: any[] = [];
  pendingEnterprises: any[] = []; // Ensure this is an array
  totalUsers: number = 0;
  allUsers: any[] = []; // Ensure this is an array
  totalEnterprises: number = 0;
  allEnterprises: any[] = [];
  reports: any[] = [];


  constructor(
    private userService: UserService,
    private jobService: JobService,
    private adminService: AdminService,
    private router: Router,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private reportService: ReportService

  ) { }

  ngOnInit(): void {
    this.userService.getDashboardInfo().subscribe(
      (response: any) => {
        if (response && response.id && response.role) {
          this.userId = response.id;
          this.userRole = response.role;

          if (this.userRole === 'enterprise') {
            this.jobService.getJobsByEnterprise(this.userId).subscribe(
              (jobs: any[]) => {
                this.jobs = jobs;
                console.log('Jobs:', this.jobs);
                this.cdr.markForCheck(); // Ensure the view is updated

              },
              error => {
                console.error('Error fetching jobs:', error);
              }
            );
          }

          if (this.userRole === 'admin') {
            this.PendingEnterprises();
            this.getUsers();
            this.getEnterprises();
            this.loadReports();


          }
        } else {
          console.error('Invalid response format:', response);
        }
      },
      error => {
        console.error('Error fetching dashboard info:', error);
      }
    );

    this.fetchAppliedJobs(); // Assuming this is for fetching jobs for 'user' role
  }


  loadReports(): void {
    this.reportService.getReports().subscribe(
      (data) => {
        this.reports = data;
        console.log('Reports:', data); // Log the reports data to debug

      },
      (error) => {
        console.error('Error fetching reports', error);
      }
    );
  }

  markAsReviewed(reportId: string): void {
    this.reportService.updateReportStatus(reportId, 'reviewed').subscribe(
      (response) => {
        // Update the report status in the local array
        const report = this.reports.find(r => r._id === reportId);
        if (report) {
          report.status = 'reviewed';
        }
      },
      (error) => {
        console.error('Error updating report status', error);
      }
    );
  }


  fetchAppliedJobs(): void {
    this.jobService.getApplications().subscribe(
      (response: any) => {
        this.appliedJobs = response.appliedJobs;
      },
      error => {
        console.error('Error fetching applied jobs:', error);
      }
    );
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'accepted':
        return 'accepted';
      case 'pending':
        return 'pending';
      case 'rejected':
        return 'rejected';
      default:
        return '';
    }
  }  

  viewApplicants(jobId: string) {
    this.jobService.getApplicantsForJob(jobId).subscribe(
      (response: any) => {
        if (response && response.applicants) {
          this.applicants = response.applicants;
          console.log('Applicants for Job:', this.applicants);
        } else {
          console.error('Invalid response format:', response);
        }
      },
      error => {
        console.error('Error fetching applicants for job:', error);
      }
    );
  }

  openEditJobModal(job: any): void {
    const modalRef = this.modalService.open(EditJobModalComponent);
    modalRef.componentInstance.jobId = job._id;
    modalRef.componentInstance.job = job;
  }

  navigateToApplicants(jobId: string) {
    this.router.navigate(['/applicants', jobId]);
  }


// ADMIN DASHBOARD LOGIC

PendingEnterprises(): void {
  this.adminService.PendingEnterprises().subscribe(
    (enterprises: any[]) => this.pendingEnterprises = enterprises,
    error => console.error('Error fetching pending enterprises:', error)
  );
}



approveEnterprise(id: string): void {
  this.adminService.approveEnterprise(id).subscribe(
    () => {
      this.PendingEnterprises();
      this.router.navigate([this.router.url]).then(() => {
        window.location.reload();
      });
  },
    error => console.error(error)
  );
}

rejectEnterprise(id: string): void {
  this.adminService.rejectEnterprise(id).subscribe(
    () => {
      this.PendingEnterprises();
      this.router.navigate([this.router.url]).then(() => {
        window.location.reload();
      });
  },
    error => console.error(error)
  );
}

getUsers(): void {
  this.userService.getUsers().subscribe(
    (users: any[]) => {
      this.allUsers = users;
      this.totalUsers = users.length;
    },
    error => console.error('Error fetching users:', error)
  );
}


getEnterprises(): void{
  this.userService.getEnterprises().subscribe(
    (enterprises: any[]) => {
      this.totalEnterprises = enterprises.length;
      this.allEnterprises = enterprises;
    },
    error => console.error('Error fetching enterprises:', error)
  );
}


getBusinessDocumentUrl(documentPath: string): string {
  if (!documentPath) {
    return ''; // Handle undefined path
  }
  // Extract the relative path from the absolute path
  const relativePath = documentPath.split('businessdocs')[1];
  return `http://localhost:3000/businessdocs${relativePath}`;
}



viewUsers(): void {
  this.router.navigate(['/admin/users']);
}



}


