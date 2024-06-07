import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service'; // Ensure this path is correct

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  password: string = '';
  confirmPassword: string = '';
  resetToken: string = '';
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.resetToken = this.route.snapshot.params['resetToken'];
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.authService.resetPassword(this.resetToken, this.password).subscribe(
      (response: any) => {
        // Handle successful response
        this.successMessage = 'Password successfully reset.';
        this.errorMessage = '';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000); // Redirect after 3 seconds
      },
      (error: any) => {
        // Handle error response
        console.error('Error response:', error);
        this.errorMessage = 'An error occurred. Please try again.';
        this.successMessage = '';
      }
    );
  }
}
