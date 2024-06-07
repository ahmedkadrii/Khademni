import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddJobModalComponent } from '../add-job-modal/add-job-modal.component';
import { Dropdown } from 'bootstrap';
import { UnreadMessageService } from '../unread-message.service';
import { MessageService } from '../messages.service'; // Import MessageService
import { SocketService } from '../socket.service'; // Import SocketService
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  isLoggedIn: boolean = false;
  isEnterprise: boolean = false;
  isAdmin: boolean = false;
  loggedInUsername: string | null = null;
  navbarOpen = false;
  isDarkTheme: boolean = false;
  userProfile: any;
  userLogo: string = '';
  baseUrl = 'http://localhost:3000'; // Base URL for the backend
  hasUnreadMessages: boolean = false; // New variable for tracking unread messages
  private socketSubscription: Subscription | null = null; // Subscription for SocketService

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
    private modalService: NgbModal,
    private changeDetectorRef: ChangeDetectorRef,
    private el: ElementRef,
    private unreadMessageService: UnreadMessageService, // Inject the service
    private messageService: MessageService, // Inject MessageService
    private socketService: SocketService // Inject SocketService
  ) {}

  openAddJobModal() {
    this.modalService.open(AddJobModalComponent, { centered: true });
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  ngOnInit(): void {
    this.checkAuthStatus();
    this.authService.loginSuccessEvent.subscribe(
      (isLoggedIn: boolean) => {
        this.isLoggedIn = isLoggedIn;
        if (isLoggedIn) {
          this.checkAuthStatus();
          this.loadUserProfile(); // Load user profile after login
        }
      }
    );

    if (this.isLoggedIn) {
      this.loadUserProfile();
    }

    // Subscribe to changes in unread messages
    this.unreadMessageService.hasUnreadMessages$.subscribe((hasUnread) => {
      this.hasUnreadMessages = hasUnread;
      this.changeDetectorRef.detectChanges();
    });

    // Load initial unread messages count
    this.loadUnreadMessagesCount();

    // Listen for incoming messages
    this.socketSubscription = this.socketService.getMessages().subscribe((message) => {
      this.loadUnreadMessagesCount(); // Refresh unread messages count on new message
    });
  }

  ngAfterViewInit() {
    const dropdownElement = this.el.nativeElement.querySelector('#notificationDropdown');
    if (dropdownElement) {
      new Dropdown(dropdownElement);
    }
  }

  ngOnDestroy(): void {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
    this.socketService.disconnect();
  }

  checkAuthStatus(): void {
    this.userService.checkAuthStatus().subscribe(
      (response: any) => {
        this.isLoggedIn = response.isLoggedIn;
        this.isEnterprise = response.role === 'enterprise';
        this.isAdmin = response.role === 'admin';
        this.loggedInUsername = response.username || null;
        if (this.isLoggedIn) {
          this.loadUserProfile();
        }
      },
      (error) => {
        console.error('Error fetching user status:', error);
      }
    );
  }

  loadUserProfile(): void {
    if (this.loggedInUsername) {
      this.userService.getProfile(this.loggedInUsername).subscribe(
        (profile: any) => {
          this.userProfile = profile;
          this.userLogo = `${this.baseUrl}${profile.logo}`;
        },
        (error) => {
          console.error('Error fetching user profile:', error);
        }
      );
    }
  }

  logout(): void {
    this.userService.logout().subscribe(
      () => {
        this.authService.emitLoginSuccessEvent(false);
        this.router.navigate(['/home']);
      },
      (error) => {
        console.error('Error logging out:', error);
      }
    );
  }

  private loadUnreadMessagesCount(): void {
    this.messageService.getConversations().subscribe((data: any) => {
      const conversations = Object.values(data.data) as any[];
      const hasUnreadMessages = conversations.some((conversation: any) => conversation.unreadCount > 0);
      this.unreadMessageService.setUnreadMessages(hasUnreadMessages);
    });
  }
}
