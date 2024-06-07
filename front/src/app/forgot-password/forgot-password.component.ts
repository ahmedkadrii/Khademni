import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service'; // Ensure this path is correct

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.isLoading = true; // Set loading to true
    this.authService.forgotPassword(this.email).subscribe(
      (response: any) => {
        // Handle successful response
        this.successMessage = 'Password reset link sent to your email.';
        this.errorMessage = '';
        this.isLoading = false; // Set loading to false
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000); // Redirect after 3 seconds
      },
      (error: any) => {
        // Handle error response
        console.error('Error response:', error);
        this.errorMessage = 'An error occurred. Please try again.';
        this.successMessage = '';
        this.isLoading = false; // Set loading to false
      }
    );
  }
}
