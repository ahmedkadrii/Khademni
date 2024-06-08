import { Component } from '@angular/core';
import { AdminService } from '../admin.service';
import { Toast } from 'bootstrap'; // Ensure Bootstrap Toast is imported

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  contactData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  constructor(private adminService: AdminService) {}

  submitContactForm(contactForm: any): void {
    if (contactForm.valid) {
      this.adminService.submitContactMessage(this.contactData).subscribe(
        response => {
          console.log('Message sent successfully');
          this.showSuccessToast();
        },
        error => {
          console.error('Error submitting contact form', error);
        }
      );
    } else {
      this.showErrorToast();
    }
  }

  showSuccessToast(): void {
    const toastElement = document.getElementById('contactSuccessToast');
    if (toastElement) {
      const toast = new Toast(toastElement);
      toast.show();
    }
  }

  showErrorToast(): void {
    const toastElement = document.getElementById('contactErrorToast');
    if (toastElement) {
      const toast = new Toast(toastElement);
      toast.show();
    }
  }
}
