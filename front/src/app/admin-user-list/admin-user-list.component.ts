import { Component, OnInit, TemplateRef } from '@angular/core';
import { UserService } from '../user.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Toast } from 'bootstrap'; // Import the Toast class from Bootstrap

@Component({
  selector: 'app-admin-user-list',
  templateUrl: './admin-user-list.component.html',
  styleUrls: ['./admin-user-list.component.css']
})
export class AdminUserListComponent implements OnInit {
  users: any[] = [];
  selectedUserId: string | null = null;
  private modalRef: NgbModalRef | null = null;

  constructor(private userService: UserService, private modalService: NgbModal) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(
      data => {
        this.users = data;
      },
      error => {
        console.error('Error loading users:', error);
      }
    );
  }

  confirmDelete(id: string, content: TemplateRef<any>): void {
    this.selectedUserId = id;
    this.modalRef = this.modalService.open(content);
  }

  deleteUser(modal: NgbModalRef): void {
    if (this.selectedUserId) {
      this.userService.deleteUserAccount(this.selectedUserId).subscribe(
        response => {
          this.loadUsers(); // Reload the list after deletion
          modal.close(); // Close the modal
          this.showSuccessToast(); // Show success toast
        },
        error => {
          console.error('Error deleting user account:', error);
          alert('An error occurred while deleting the user account.');
          modal.dismiss(); // Close the modal
        }
      );
    }
  }

  showSuccessToast(): void {
    const toastElement = document.getElementById('successToast');
    if (toastElement) {
      const toast = new Toast(toastElement);
      toast.show();
    }
  }
}
