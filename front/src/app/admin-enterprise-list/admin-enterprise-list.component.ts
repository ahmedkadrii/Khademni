import { Component, OnInit, TemplateRef } from '@angular/core';
import { UserService } from '../user.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Toast } from 'bootstrap'; // Import the Toast class from Bootstrap

@Component({
  selector: 'app-admin-enterprise-list',
  templateUrl: './admin-enterprise-list.component.html',
  styleUrls: ['./admin-enterprise-list.component.css']
})
export class AdminEnterpriseListComponent implements OnInit {
  enterprises: any[] = [];
  selectedEnterpriseId: string | null = null;
  private modalRef: NgbModalRef | null = null;

  constructor(private userService: UserService, private modalService: NgbModal) {}

  ngOnInit(): void {
    this.loadEnterprises();
  }

  loadEnterprises(): void {
    this.userService.getEnterprises().subscribe(
      data => {
        this.enterprises = data;
      },
      error => {
        console.error('Error loading enterprises:', error);
      }
    );
  }

  confirmDelete(id: string, content: TemplateRef<any>): void {
    this.selectedEnterpriseId = id;
    this.modalRef = this.modalService.open(content);
  }

  deleteEnterprise(modal: NgbModalRef): void {
    if (this.selectedEnterpriseId) {
      this.userService.deleteEnterprise(this.selectedEnterpriseId).subscribe(
        response => {
          this.loadEnterprises(); // Reload the list after deletion
          modal.close(); // Close the modal
          this.showSuccessToast(); // Show success toast
        },
        error => {
          console.error('Error deleting enterprise:', error);
          alert('An error occurred while deleting the enterprise.');
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

  getBusinessDocumentUrl(documentPath: string): string {
    if (!documentPath) {
      return ''; // Handle undefined path
    }
    // Extract the relative path from the absolute path
    const relativePath = documentPath.split('businessdocs')[1];
    return `http://localhost:3000/businessdocs${relativePath}`;
  }
}
