import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from './user.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.userService.checkAuthStatus().pipe(
      map((response: any) => {
        if (response.isLoggedIn && response.role === 'admin') {
          return true; // Allow access to the route if user is an admin
        } else {
          this.router.navigate(['/unauthorized']); // Redirect to unauthorized page if user is not an admin
          return false;
        }
      })
    );
  }
}
