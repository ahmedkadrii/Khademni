import { Component } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'front';
  isDarkTheme: boolean = false;

  constructor(private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
  }

  // Function to check if the current route is the login page
  isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  // Function to check if the current route is the register page
  isRegisterPage(): boolean {
    return this.router.url === '/register';
  }

  isEmailConfirmation(): boolean {
    return this.router.url === '/confirm/:token';
  }

  isTos(): boolean {
    return this.router.url === '/tos';
  }

  isPrivacyPolicy(): boolean {
    return this.router.url === '/privacy-policy';
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
  }

  isEnterpriseRegisterPage(): boolean {
    return this.router.url === '/enterprise/register';
  }

  isConfirm(): boolean {
    const primaryChild = this.router.parseUrl(this.router.url).root.children['primary'];
    if (!primaryChild) {
      return false;
    }
    const urlSegments = primaryChild.segments;
    return urlSegments.length === 2 && urlSegments[0].path === 'confirm' && !!urlSegments[1].path;
  }
}
