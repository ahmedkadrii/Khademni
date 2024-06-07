import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from '../auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-enterprise-register',
  templateUrl: './enterprise-register.component.html',
  styleUrls: ['./enterprise-register.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('0.3s ease-in-out', style({ transform: 'translateX(0%)' }))
      ]),
      transition(':increment', [
        style({ transform: 'translateX(-100%)' }),
        animate('0.3s ease-in-out', style({ transform: 'translateX(0%)' }))
      ]),
      transition(':decrement', [
        style({ transform: 'translateX(100%)' }),
        animate('0.3s ease-in-out', style({ transform: 'translateX(0%)' }))
      ])
    ])
  ]
})
export class EnterpriseRegisterComponent implements OnInit {
  enterpriseForm: FormGroup;
  step: number = 1;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  selectedFile: File | null = null;
  selectedFileName: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
  ) {
    this.enterpriseForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      name: ['', Validators.required],
      address: [''],
      bio: [''],
      businessDocument: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    this.selectedFileName = this.selectedFile ? this.selectedFile.name : null;
    if (this.enterpriseForm) {
      this.enterpriseForm.patchValue({ businessDocument: this.selectedFile });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.enterpriseForm.valid && this.selectedFile) {
      this.showLoader();

      const formData = new FormData();
      formData.append('username', this.enterpriseForm.get('username')!.value);
      formData.append('email', this.enterpriseForm.get('email')!.value);
      formData.append('password', this.enterpriseForm.get('password')!.value);
      formData.append('name', this.enterpriseForm.get('name')!.value);
      formData.append('address', this.enterpriseForm.get('address')!.value);
      formData.append('bio', this.enterpriseForm.get('bio')!.value);
      formData.append('businessDocument', this.selectedFile!, this.selectedFile!.name);

      try {
        const response = await this.authService.registerEnterprise(formData).toPromise();
        await this.delay(2000);  // Simulate a delay of 2 seconds
        this.successMessage =  'Signup successful. \n An email will be sent to you upon approval, thank you for waiting!';
        // this.successMessage = response.message || 'Signup successful. \n\n An email will be sent to you upon approval, thank you for waiting!';
        this.toastr.success(this.successMessage, 'Success');
        await this.delay(3000);  // Simulate a delay of 2 seconds

        this.router.navigate(['/dashboard']);

      } catch (error) {
        if (error instanceof HttpErrorResponse) {
          this.errorMessage = error.error.message || 'Registration failed. Please try again.';
        } else {
          this.errorMessage = 'An unexpected error occurred. Please try again.';
        }
        this.toastr.error(this.errorMessage, 'Error');
      } finally {
        this.hideLoader();
      }
    } else {
      this.errorMessage = 'Please fill out all required fields and upload a business document.';
      this.toastr.error(this.errorMessage, 'Error');
    }
  }

  nextStep(): void {
    if (this.isStep1Valid()) {
      this.step++;
    } else {
      this.validateStep1();
    }
  }

  prevStep(): void {
    this.step--;
  }

  isStep1Valid(): boolean {
    return this.enterpriseForm.get('username')!.valid &&
           this.enterpriseForm.get('email')!.valid &&
           this.enterpriseForm.get('password')!.valid;
  }

  validateStep1(): void {
    this.enterpriseForm.get('username')!.markAsTouched();
    this.enterpriseForm.get('email')!.markAsTouched();
    this.enterpriseForm.get('password')!.markAsTouched();
  }

  showLoader(): void {
    this.isLoading = true;
  }

  hideLoader(): void {
    this.isLoading = false;
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  formatMessage(message: string): string {
    return message.replace(/\n/g, '<br>');
  }

}
