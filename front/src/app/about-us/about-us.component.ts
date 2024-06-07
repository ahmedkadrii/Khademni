import { Component } from '@angular/core';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css']
})
export class AboutUsComponent {
  teamMembers = [
    { name: 'Ahmed Ben Ali', position: 'CEO', photo: 'assets/images/ahmed.jpg' },
    { name: 'Salma Mami', position: 'CTO', photo: 'assets/images/salma.jpg' },
    { name: 'Karim Jaziri', position: 'COO', photo: 'assets/images/karim.jpg' },
    { name: 'Rania Haddad', position: 'CFO', photo: 'assets/images/rania.jpg' }
  ];
}
