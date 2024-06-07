import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from './user.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.userService.checkAuthStatus().pipe(
      map((response: any) => {
        if (response.isLoggedIn) {
          return true; // Allow access to the route if user is logged in
        } else {
          this.router.navigate(['/login']); // Redirect to login if user is not logged in
          return false;
        }
      })
    );
  }
}
