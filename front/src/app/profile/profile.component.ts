import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { NotificationService } from '../notification.service';
import { ReportService } from '../report.service';
import { NgbModal, NgbModalRef, NgbToast  } from '@ng-bootstrap/ng-bootstrap';


declare var bootstrap: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  baseUrl = 'http://localhost:3000'; // Base URL for the backend
  username: string = '';
  userProfile: any; // Update the type based on your user model
  editedProfile: any = {}; // Object to store edited profile information
  editMode: boolean = false; // Track overall edit mode
  loggedInUser: any; // Object to store logged-in user data
  cv: File | null = null;
  logo: File | null = null;
  isLoggedIn: boolean = false;
  isFollowing: boolean = false; // Track follow status
  loggedInUsername: string | null = null; // Track the logged-in username
  isEnterprise: boolean = false;
  isAdmin: boolean = false;

  posts: any[] = []; // Array to store posts
  newPostContent: string = ''; // Content for new post
  postIdToDelete: string | null = null; // ID of the post to delete
  skillsInput: string = ''; // Temporary input for skills
  notifications: any[] = []; // Array to store notifications
  followButtonOnCooldown = false;
  unfollowButtonOnCooldown = false;
  followAttempts = 0; // Track consecutive follow attempts
  cooldownDuration = 300000;
  reportReason: string = ''; // Reason for reporting
  currentModal: NgbModalRef | null = null;
  showToast: boolean = false;



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private reportService: ReportService, // Inject ReportService
    private modalService: NgbModal

  ) { }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.checkAuthStatus();
    this.authService.loginSuccessEvent.subscribe(
      (isLoggedIn: boolean) => {
        this.isLoggedIn = isLoggedIn;
        if (isLoggedIn) {
          this.checkAuthStatus(); // Refresh user status after login
        }
      }
    );

    // Get the username from the route parameters
    this.route.params.subscribe(params => {
      this.username = params['username'];

      // Fetch user profile based on username
      this.userService.getProfile(this.username).subscribe(
        (profile: any) => {
          this.userProfile = profile;

          // Initialize edited profile with initial values
          this.editedProfile.name = profile.name;
          this.editedProfile.email = profile.email;
          this.editedProfile.address = profile.address;
          this.editedProfile.bio = profile.bio;
          this.editedProfile.skills = profile.skills;
          this.editedProfile.contactEmail = profile.contactEmail;
          this.editedProfile.phone = profile.phone;


          // Fetch follow status
          this.userService.isFollowingUser(this.username).subscribe(
            (res: any) => {
              this.isFollowing = res.isFollowing;
            },
            error => {
              console.error('Error checking follow status:', error);
            }
          );

          // Fetch user posts
          this.getPosts();

          // Fetch notifications for the current user
          this.getNotifications();
        },
        error => {
          console.error('Error fetching user profile:', error);
        }
      );
    });

    // Reinitialize Bootstrap tooltips, popovers, etc.
    Array.from(document.querySelectorAll('.dropdown-toggle')).forEach((element: any) => {
      new bootstrap.Dropdown(element);
    });
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      // Reset editedProfile to userProfile data if edit mode is turned off
      this.editedProfile = { ...this.userProfile };
    }
  }

  saveChanges(): void {
    const promises = [];

    if (this.cv) {
      promises.push(this.userService.uploadCV(this.cv).toPromise());
    }

    if (this.logo) {
      promises.push(this.userService.uploadLogo(this.username, this.logo).toPromise());
    }

    // Add profile update promise if there are profile changes
    promises.push(this.userService.updateProfile(this.username, this.editedProfile).toPromise());

    // Execute all promises simultaneously
    Promise.all(promises).then(() => {
      this.userService.getProfile(this.username).subscribe(
        (profile: any) => {
          this.userProfile = profile;
          this.editMode = false;
          this.cv = null;
          this.logo = null;
          
        },
        error => {
          console.error('Error fetching updated user profile:', error);
        }
      );
    }).catch(error => {
      console.error('Error saving changes:', error);
    });
  }

  cancelEdit(): void {
    this.editedProfile = { ...this.userProfile };
    this.cv = null;
    this.logo = null;
    this.editMode = false;
  }

  onCVFileChange(event: any): void {
    this.cv = event.target.files[0];
  }

  onLogoFileChange(event: any): void {
    this.logo = event.target.files[0];
  }

  checkAuthStatus(): void {
    this.userService.checkAuthStatus().subscribe(
      (response: any) => {
        this.isLoggedIn = response.isLoggedIn;
        this.isEnterprise = response.role === 'enterprise';
        this.isAdmin = response.role === 'admin';

        if (this.isLoggedIn) {
          this.loggedInUsername = response.username;
        } else {
          this.loggedInUsername = null;
        }
      },
      error => {
        console.error('Error fetching user status:', error);
      }
    );
  }

  openCV(): void {
    if (this.userProfile.cv) {
      const cvUrl = this.userProfile.cv;
      const iframe = document.createElement('iframe');
      iframe.setAttribute('src', cvUrl);
      iframe.setAttribute('style', 'width: 100%; height: 500px; border: none;');
      const cvContainer = document.getElementById('cv-container');
      if (cvContainer) {
        cvContainer.innerHTML = '';
        cvContainer.appendChild(iframe);
      }
    }
  }

  onSkillsInput(event: KeyboardEvent): void {
    if (event.key === ',') {
      this.parseSkills();
    }
  }

  parseSkills(): void {
    // Split the input by commas and trim any extra whitespace
    const skillsArray = this.skillsInput.split(',').map(skill => skill.trim()).filter(skill => skill);
    // Update the skills in the editedProfile
    this.editedProfile.skills = [...new Set([...this.editedProfile.skills, ...skillsArray])];
    // Clear the input
    this.skillsInput = '';
  }

  removeSkill(index: number): void {
    this.editedProfile.skills.splice(index, 1);
  }

  isProfileOwner(): boolean {
    return this.loggedInUsername === this.username;
  }

  getPosts(): void {
    this.userService.getPostsByUsername(this.username).subscribe(
      (posts: any[]) => {
        this.posts = posts;
      },
      error => {
        console.error('Error fetching posts:', error);
      }
    );
  }

  createPost(): void {
    if (!this.newPostContent) {
      return;
    }

    this.userService.createPost(this.newPostContent).subscribe(
      (post: any) => {
        this.posts.unshift(post); // Add the new post to the beginning of the posts array
        this.newPostContent = ''; // Clear the input field
      },
      error => {
        console.error('Error creating post:', error);
      }
    );
  }

  confirmDelete(postId: string): void {
    this.postIdToDelete = postId;
    // Show the delete confirmation modal
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'), {});
    deleteModal.show();
  }

  deletePost(): void {
    if (!this.postIdToDelete) {
      return;
    }

    this.userService.deletePost(this.postIdToDelete).subscribe(
      () => {
        this.posts = this.posts.filter(post => post._id !== this.postIdToDelete); // Remove the deleted post from the posts array
        this.postIdToDelete = null; // Clear the postIdToDelete
        // Hide the delete confirmation modal
        const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        deleteModal.hide();
      },
      error => {
        console.error('Error deleting post:', error);
      }
    );
  }

  editPost(post: any): void {
    post.editing = true;
  }

  cancelEditPost(post: any): void {
    post.editing = false;
    this.getPosts(); // Reload the posts to revert changes
  }

  updatePost(post: any): void {
    this.userService.updatePost(post._id, post.content).subscribe(
      (updatedPost: any) => {
        post.editing = false;
      },
      error => {
        console.error('Error updating post:', error);
      }
    );
  }

  openImage(imagePath: string): void {
    window.open(this.baseUrl + imagePath, '_blank');
  }

  followUser(): void {
    if (this.followButtonOnCooldown) {
      console.log('Follow button is on cooldown. Please wait.');
      return;
    }

    this.userService.followUser(this.username).subscribe(
      response => {
        console.log('User followed successfully:', response);
        this.isFollowing = true;

        // Reload notifications after following
        this.getNotifications();

        // Start cooldown for follow button
        this.followButtonOnCooldown = true;
        setTimeout(() => {
          this.followButtonOnCooldown = false;
        }, this.cooldownDuration);
      },
      error => {
        console.error('Error following user:', error);
      }
    );
  }

  unfollowUser(): void {
    if (this.unfollowButtonOnCooldown) {
      console.log('Unfollow button is on cooldown. Please wait.');
      return;
    }

    this.userService.unfollowUser(this.username).subscribe(
      response => {
        console.log('User unfollowed successfully:', response);
        this.isFollowing = false;

        // Reload notifications after unfollowing
        this.getNotifications();

        // Start cooldown for unfollow button
        this.unfollowButtonOnCooldown = true;
        setTimeout(() => {
          this.unfollowButtonOnCooldown = false;
        }, this.cooldownDuration);
      },
      error => {
        console.error('Error unfollowing user:', error);
      }
    );
  }

  getNotifications(): void {
    if (this.loggedInUser) {
      this.notificationService.getNotifications(this.loggedInUser._id).subscribe(
        (notifications: any[]) => {
          this.notifications = notifications;
        },
        error => {
          console.error('Error fetching notifications:', error);
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


  requestAccountDeletion(): void {
    const deleteAccountModal = new bootstrap.Modal(document.getElementById('deleteAccountModal'), {});
    deleteAccountModal.show();
  }

  confirmAccountDeletion(): void {
    this.userService.requestDeletion().subscribe(
      response => {
        // Optionally, you can log the user out and redirect to the login page
        this.logout();
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Error requesting account deletion:', error);
      }
    );
    const deleteAccountModal = bootstrap.Modal.getInstance(document.getElementById('deleteAccountModal'));
    deleteAccountModal.hide();
  }


  openReportModal(modal: any): void {
    this.currentModal = this.modalService.open(modal);
  }

  reportEntity(): void {
    if (!this.reportReason.trim()) {
      alert('Please provide a reason for reporting.');
      return;
    }
  
    this.reportService.createReport(this.userProfile._id, this.reportReason).subscribe(
      () => {
        this.reportReason = '';
        this.showSuccessToast();
  
        // Automatically close the modal after successful submission
        if (this.currentModal) {
          this.currentModal.close();
          this.currentModal = null;
        }
      },
      (error) => {
        console.error('Error reporting entity:', error);
        alert('There was an error submitting your report. Please try again.');
      }
    );
  }
    
  showSuccessToast(): void {
    const toastElement = document.getElementById('successToast');
    if (toastElement) {
      const toast = new bootstrap.Toast(toastElement);
      toast.show();
    }
  }

}
