import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../notification.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  notifications: any[] = [];
  maxNotifications = 10; // Adjust this value according to your requirements
  followButtonDisabled = false; // Track whether the follow button is disabled
  unfollowButtonDisabled = false; // Track whether the unfollow button is disabled
  followAttempts = 0; // Track consecutive follow attempts
  unfollowAttempts = 0; // Track consecutive unfollow attempts
  maxAttempts = 5; // Maximum number of consecutive attempts allowed
  cooldownDuration = 300000; // Cooldown duration in milliseconds (5 minutes)


  constructor(
    private notificationService: NotificationService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.checkAuthStatus().subscribe(
      (response: any) => {
        if (response.isLoggedIn) {
          const userId = response.userId;
          this.loadNotifications(userId);
        }
      },
      error => {
        console.error('Error fetching auth status:', error);
      }
    );
  }

  loadNotifications(userId: string): void {
    this.notificationService.getNotifications(userId).subscribe(
      (notifications: any[]) => {
        this.notifications = notifications;
      },
      error => {
        console.error('Error fetching notifications:', error);
      }
    );
  }
}
