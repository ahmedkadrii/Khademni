import { Component, OnInit, TemplateRef } from '@angular/core';
import { JobService } from '../job.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from '../admin.service';
import { Toast } from 'bootstrap';

@Component({
  selector: 'app-admin-job-list',
  templateUrl: './admin-job-list.component.html',
  styleUrls: ['./admin-job-list.component.css']
})
export class AdminJobListComponent implements OnInit {

  jobs: any[] = [];
  selectedJobId: string | null = null;
  private modalRef: NgbModalRef | null = null;

  constructor(private jobService: JobService, private modalService: NgbModal, private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.jobService.getAllJobs().subscribe(
      data => {
        this.jobs = data;
      },
      error => {
        console.error('Error loading jobs:', error);
      }
    );
  }

  confirmDelete(jobId: string, content: TemplateRef<any>): void {
    this.selectedJobId = jobId;
    this.modalRef = this.modalService.open(content);
  }

  deleteJob(modal: NgbModalRef): void {
    if (this.selectedJobId) {
      this.adminService.deleteJob(this.selectedJobId).subscribe(
        response => {
          this.jobs = this.jobs.filter(job => job._id !== this.selectedJobId); // Remove the job from the list
          this.showDeleteJobSuccessToast();
          modal.close();
        },
        error => {
          console.error('Error deleting job:', error);
          this.showDeleteJobErrorToast();
          modal.dismiss();
        }
      );
    }
  }

  showDeleteJobSuccessToast(): void {
    const toastElement = document.getElementById('deleteJobSuccessToast');
    if (toastElement) {
      const toast = new Toast(toastElement);
      toast.show();
    }
  }

  showDeleteJobErrorToast(): void {
    const toastElement = document.getElementById('deleteJobErrorToast');
    if (toastElement) {
      const toast = new Toast(toastElement);
      toast.show();
    }
  }
}
