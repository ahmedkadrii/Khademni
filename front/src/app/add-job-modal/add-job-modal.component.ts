import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JobService } from '../job.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-job-modal',
  templateUrl: './add-job-modal.component.html',
  styleUrls: ['./add-job-modal.component.css']
})
export class AddJobModalComponent implements OnInit {
  jobTitle: string = '';
  description: string = '';
  minSalary: number = 0;
  maxSalary: number = 0;
      cities: string[] = ["Tunis", "Sfax", "Sousse", "Ettadhamen", "Kairouan", "Bizerte", "Gabes", "Ariana", "Gafsa", "El Mourouj", "Kasserine", "Medenine", "Monastir", "La Goulette",
    "Tozeur", "Douane", "Korba", "La Marsa", "Gremda", "Jendouba", "Zarzis", "Hammam-Lif", "Mateur"];
      domains: string[] = ["Information Technology", "Finance", "Healthcare", "Education", "Marketing", "Engineering", "Sales", "Customer Service", "Human Resources", "Design", "Consulting", "Management",
    "Manufacturing", "Research", "Hospitality", "Real Estate", "Media", "Transportation", "Logistics", "Legal", "Nonprofit"];
    types : string[] = ["Full Time", "Part Time", "Remote", "Freelancer"];
      exp : string[] = ["Internship", "2+ Years", "5+ Years", "Fresher"];
  selectedType: string = '';
  selectedExp: string = '';
  selectedCity: string = '';
  selectedDomain: string = '';
  deadline: Date = new Date();

  constructor(public activeModal: NgbActiveModal, private jobService: JobService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  addJob(): void {
    const jobData = {
      title: this.jobTitle,
      description: this.description,
      minSalary: this.minSalary,
      maxSalary: this.maxSalary,
      types: [this.selectedType],
      exp: [this.selectedExp],
      domains: [this.selectedDomain],
      cities: [this.selectedCity],
      deadline: this.deadline
    };

    this.jobService.createJob(jobData).subscribe(
      (response) => {
        console.log('Job added successfully:', response);
        this.activeModal.close();
        this.router.navigate([this.router.url]).then(() => {
          window.location.reload();
        });
      },
      (error) => {
        console.error('Error adding job:', error);
      }
    );
  }

  closeModal(): void {
    this.activeModal.dismiss();
  }
}
