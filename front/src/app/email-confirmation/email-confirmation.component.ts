import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-email-confirmation',
  templateUrl: './email-confirmation.component.html',
  styleUrls: ['./email-confirmation.component.css']
})
export class EmailConfirmationComponent implements OnInit {
  isLoading: boolean = true;
  message: string = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.authService.confirmEmail(token).subscribe(
        (response: any) => {
          this.message = 'WOHOO! Confirmation successful, redirecting you...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000); // Redirect after 3 seconds
        },
        (error) => {
          this.message = 'Nooooooo! Token expired or already used, redirecting you...';
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000); // Redirect after 3 seconds
        }
      );
    } else {
      this.message = 'Ops, Token not found, redirecting you...';
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3000); // Redirect after 3 seconds
    }
  }
}
