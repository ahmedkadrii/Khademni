import { Component, OnInit } from '@angular/core';
import { JobService } from '../job.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-bookmarks',
  templateUrl: './bookmarks.component.html',
  styleUrls: ['./bookmarks.component.css']
})
export class BookmarksComponent implements OnInit {
  bookmarks: any[] = [];
  userId: string = '';
  baseUrl = 'http://localhost:3000';
  constructor(private jobService: JobService, private userService: UserService) {}

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  checkAuthStatus(): void {
    this.userService.checkAuthStatus().subscribe(
      (response: any) => {
        this.userId = response.userId;
        this.fetchBookmarks(); // Fetch bookmarks after userId is set
      },
      error => {
        console.error('Error checking authentication status:', error);
      }
    );
  }

  fetchBookmarks(): void {
    this.jobService.fetchBookmarks().subscribe(bookmarks => {
      this.bookmarks = bookmarks;
    }, error => {
      console.error('Error fetching bookmarks:', error);
    });
  }

  removeBookmark(jobId: string): void {
    this.jobService.removeBookmark(this.userId, jobId).subscribe(() => {
      this.bookmarks = this.bookmarks.filter(bookmark => bookmark._id !== jobId);
    }, error => {
      console.error('Error removing bookmark:', error);
    });
  }
}
