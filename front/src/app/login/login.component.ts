import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  showLoginForm: boolean = true;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService
  ) {}

  login(): void {
    this.authService.login(this.email, this.password)
      .subscribe(
        (response: any) => {
          if (response && response.userData && response.userData.id) {
            // Emit login success event with true indicating successful login
            this.authService.emitLoginSuccessEvent(true);
            
            // Handle successful login response
            console.log(response);
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = 'Unexpected response format.';
          }
        },
        error => {
          // Emit login success event with false indicating unsuccessful login
          this.authService.emitLoginSuccessEvent(false);
          
          if (error.status === 400 && error.error.message) {
            this.errorMessage = error.error.message;
  
            // Check for the specific message indicating awaiting admin approval
            if (this.errorMessage === 'Your account is awaiting admin approval') {
              // Display info message for enterprises awaiting admin approval
              this.toastr.info(this.errorMessage, 'Info');
            } else {
              // Display error message for other cases
              this.toastr.error(this.errorMessage, 'Error');
            }
          } else {
            this.errorMessage = 'An error occurred. Please try again.';
            this.toastr.error(this.errorMessage, 'Error');
          }
        }
      );
  }
  
  toggleLoginForm(): void {
    this.showLoginForm = !this.showLoginForm;
  }
}
