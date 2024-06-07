import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from './user.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardLoggedIn implements CanActivate {

  constructor(private userService: UserService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.userService.checkAuthStatus().pipe(
      map((response: any) => {
        if (response.isLoggedIn) {
          this.router.navigate(['/dashboard']); // Redirect to dashboard if user is already logged in
          return false; // Prevent access to login and register pages
        } else {
          return true; // Allow access to login and register pages for non-logged-in users
        }
      })
    );
  }
}
