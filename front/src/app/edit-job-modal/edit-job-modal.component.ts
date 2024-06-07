import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JobService } from '../job.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-job-modal',
  templateUrl: './edit-job-modal.component.html',
  styleUrls: ['./edit-job-modal.component.css']
})
export class EditJobModalComponent implements OnInit {
  @Input() jobId!: string;
  @Input() job: any = {};
  editedJob: any = {};

  expOptions: string[] = ["Internship", "2+ Years", "5+ Years", "Fresher"];
  typeOptions: string[] = ["Full Time", "Part Time", "Remote", "Freelancer"];
  cityOptions: string[] = ["Tunis", "Sfax", "Sousse", "Ettadhamen", "Kairouan", "Bizerte", "Gabes", "Ariana", "Gafsa", "El Mourouj", "Kasserine", "Medenine", "Monastir", "La Goulette", "Tozeur", "Douane", "Korba", "La Marsa", "Gremda", "Jendouba", "Zarzis", "Hammam-Lif", "Mateur"];
  domainOptions: string[] = ["Information Technology", "Finance", "Healthcare", "Education", "Marketing", "Engineering", "Sales", "Customer Service", "Human Resources", "Design", "Consulting", "Management", "Manufacturing", "Research", "Hospitality", "Real Estate", "Media", "Transportation", "Logistics", "Legal", "Nonprofit"];

  constructor(
    public activeModal: NgbActiveModal,
    private jobService: JobService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Ensure salary object is initialized correctly
    this.editedJob = { 
      ...this.job,
      salary: {
        minSalary: this.job.salary?.minSalary || 0,
        maxSalary: this.job.salary?.maxSalary || 0
      }
    };
  }

  saveChanges(): void {
    const updatedJobData = {
      ...this.editedJob,
      salary: {
        minSalary: this.editedJob.salary.minSalary,
        maxSalary: this.editedJob.salary.maxSalary
      }
    };

    this.jobService.editJob(this.jobId, updatedJobData).subscribe(
      (response) => {
        console.log('Job updated successfully:', response);
        this.activeModal.close();
        this.router.navigate([this.router.url]).then(() => {
          window.location.reload();
        });

      },
      (error) => {
        console.error('Error updating job:', error);
      }
    );
  }

  closeDialog(): void {
    this.activeModal.dismiss();
  }
}
