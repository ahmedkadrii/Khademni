import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JobService } from '../job.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import * as bootstrap from 'bootstrap';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-applicants',
  templateUrl: './applicants.component.html',
  styleUrls: ['./applicants.component.css']
})
export class ApplicantsComponent implements OnInit {
  jobId: string = '';
  applicants: any[] = [];
  acceptedApplications: Set<string> = new Set<string>();
  rejectedApplications: Set<string> = new Set<string>();
  customMessage: string = '';
  interviewDate: NgbDateStruct | undefined; // For the date picker
  selectedApplicationId: string | null = null;
  modalType: string = ''; // 'accept' or 'reject'

  constructor(private route: ActivatedRoute, private jobService: JobService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.jobId = params.get('jobId')!;
      this.fetchApplicants();
    });
  }

  fetchApplicants(): void {
    this.jobService.getApplicantsForJob(this.jobId).subscribe(
      (response: any) => {
        if (response && response.applicants) {
          this.applicants = response.applicants;
          console.log('Applicants for Job:', this.applicants);
          this.applicants.forEach(app => {
            if (app.status === 'accepted') {
              this.acceptedApplications.add(app.jobApp);
            } else if (app.status === 'rejected') {
              this.rejectedApplications.add(app.jobApp);
            }
          });
        } else {
          console.error('Invalid response format:', response);
        }
      },
      error => {
        console.error('Error fetching applicants for job:', error);
      }
    );
  }

  getCvUrl(cvPath: string): string {
    return `http://localhost:3000/${cvPath}`;
  }

  openDialog(message: string): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '250px',
      data: { message }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.fetchApplicants();
    });
  }

  openModal(type: string, applicationId: string): void {
    this.selectedApplicationId = applicationId;
    this.customMessage = '';
    this.interviewDate = undefined;
    this.modalType = type;

    if (type === 'accept') {
      const acceptModalElement = document.getElementById('acceptModal') as HTMLElement;
      const acceptModal = new bootstrap.Modal(acceptModalElement);
      acceptModal.show();
    } else if (type === 'reject') {
      const rejectModalElement = document.getElementById('rejectModal') as HTMLElement;
      const rejectModal = new bootstrap.Modal(rejectModalElement);
      rejectModal.show();
    }
  }

  submitAcceptApplication(): void {
    if (this.selectedApplicationId) {
      const formattedDate = this.interviewDate ? `${this.interviewDate.year}-${this.interviewDate.month}-${this.interviewDate.day}` : '';
      const fullMessage = `${this.customMessage}\nInterview Date: ${formattedDate}`;
      this.acceptApplication(this.selectedApplicationId, fullMessage);
      const acceptModalElement = document.getElementById('acceptModal') as HTMLElement;
      const acceptModal = bootstrap.Modal.getInstance(acceptModalElement) as bootstrap.Modal;
      acceptModal.hide();
    }
  }

  submitRejectApplication(): void {
    if (this.selectedApplicationId) {
      this.rejectApplication(this.selectedApplicationId, this.customMessage);
      const rejectModalElement = document.getElementById('rejectModal') as HTMLElement;
      const rejectModal = bootstrap.Modal.getInstance(rejectModalElement) as bootstrap.Modal;
      rejectModal.hide();
    }
  }

  acceptApplication(applicationId: string, customMessage: string): void {
    if (!this.acceptedApplications.has(applicationId) && !this.rejectedApplications.has(applicationId)) {
      this.jobService.acceptApplication(applicationId, customMessage).subscribe(
        () => {
          console.log('Application accepted');
          this.updateApplicationStatus(applicationId, 'accepted');
          this.acceptedApplications.add(applicationId);
          this.openDialog('Application accepted');
          this.removeButtons(applicationId);
        },
        error => {
          console.error('Error accepting application:', error);
        }
      );
    }
  }

  rejectApplication(applicationId: string, customMessage: string): void {
    if (!this.acceptedApplications.has(applicationId) && !this.rejectedApplications.has(applicationId)) {
      this.jobService.rejectApplication(applicationId, customMessage).subscribe(
        () => {
          console.log('Application rejected');
          this.updateApplicationStatus(applicationId, 'rejected');
          this.rejectedApplications.add(applicationId);
          this.openDialog('Application rejected');
          this.removeButtons(applicationId);
        },
        error => {
          console.error('Error rejecting application:', error);
        }
      );
    }
  }

  removeButtons(applicationId: string): void {
    const index = this.applicants.findIndex(app => app.jobApp === applicationId);
    if (index !== -1) {
      this.applicants.splice(index, 1);
    }
  }

  updateApplicationStatus(applicationId: string, status: string): void {
    const application = this.applicants.find(app => app.jobApp === applicationId);
    if (application) {
      application.status = status;
    }
  }
}
