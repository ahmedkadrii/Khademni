import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
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
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  step: number = 1;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  showModal: boolean = true;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, this.usernameValidator(), Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      address: [''],
      bio: [''],
      name: ['']
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.showLoader();
      this.authService.registerUser(this.registerForm.value)
        .subscribe(
          response => {
            console.log('Registration successful:', response);
            this.successMessage = 'Registration successful! Please check your email to confirm your account.';
            this.toastr.success(this.successMessage, 'Success');
            this.hideLoader();
          },
          error => {
            console.error('Registration error:', error);
            if (error.status === 400 && error.error.message) {
              this.errorMessage = error.error.message;
            } else {
              this.errorMessage = 'Registration failed. Please try again.';
            }
            this.toastr.error(this.errorMessage, 'Error');
            this.hideLoader();
          }
        );
    } else {
      this.validateStep1();
    }
  }

  ngOnInit(): void {
    // Show the modal when the component is initialized
    this.showModal = true;
  }

  selectUserType(type: string): void {
    if (type === 'enterprise') {
      this.router.navigate(['/enterprise/register']);
    } else {
      this.showModal = false;
      this.step = 1;
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

  clearFieldErrors(fieldName: string): void {
    const field = this.registerForm.get(fieldName);
    if (field) {
      field.setErrors(null);
    }
  }

  validateStep1(): void {
    this.registerForm!.get('username')!.markAsTouched();
    this.registerForm!.get('email')!.markAsTouched();
    this.registerForm!.get('password')!.markAsTouched();
  }

  isStep1Valid(): boolean {
    return this.registerForm!.get('username')!.valid &&
           this.registerForm!.get('email')!.valid &&
           this.registerForm!.get('password')!.valid;
  }

  validateField(fieldName: string): void {
    const field = this.registerForm.get(fieldName);
    if (field) {
      field.markAsTouched();
    }
  }

  usernameValidator(): any {
    return (control: { value: string; }) => {
      const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
      if (control.value && !usernameRegex.test(control.value)) {
        return { 'invalidUsername': true };
      }
      return null;
    };
  }


  showLoader(): void {
    this.isLoading = true;
  }

  hideLoader(): void {
    this.isLoading = false;
  }

}
