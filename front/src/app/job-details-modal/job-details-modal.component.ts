import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JobService } from '../job.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-job-details-modal',
  templateUrl: './job-details-modal.component.html',
  styleUrls: ['./job-details-modal.component.css']
})
export class JobDetailsModalComponent implements OnInit {
  @Input() job: any;
  appliedJobs: any[] = [];
  isUserLoggedIn: boolean = false;
  userRole: string = '';
  errorMessage: string | null = null;
  applicationSuccessful: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private jobService: JobService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  hasApplied(): boolean {
    return this.appliedJobs.some(appliedJob => appliedJob.jobId === this.job._id);
  }

  applyForJob(jobId: string): void {
    this.jobService.applyForJob(jobId, new FormData()).subscribe(
      (response: any) => {
        console.log('Applied for job:', jobId);
        this.applicationSuccessful = true;
        this.loadAppliedJobs();

        // Add a delay before closing the modal
        setTimeout(() => {
          this.activeModal.close('applied');
        }, 1000); // 1000 milliseconds = 1 second
      },
      error => {
        console.error('Error applying for job:', error);
        this.errorMessage = error.error.message || 'An error occurred while applying for the job.';
      }
    );
  }

  checkAuthStatus(): void {
    this.userService.checkAuthStatus().subscribe(
      (response: any) => {
        this.isUserLoggedIn = response.isLoggedIn;
        this.userRole = response.role;
        this.loadAppliedJobs();
      },
      error => {
        console.error('Error fetching authentication status:', error);
      }
    );
  }

  loadAppliedJobs(): void {
    if (this.userRole !== 'enterprise') {
      this.jobService.getApplications().subscribe(
        (response: any) => {
          if (response && response.appliedJobs) {
            this.appliedJobs = response.appliedJobs;
          } else {
            console.error('Invalid response format:', response);
          }
        },
        error => {
          console.error('Error fetching applied jobs:', error);
        }
      );
    }
  }
}
