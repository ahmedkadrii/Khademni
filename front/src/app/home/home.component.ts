import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { JobService } from '../job.service';
import { UserService } from '../user.service';
import { animate, keyframes, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1s', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('1s', style({ transform: 'translateY(0)' }))
      ])
    ]),
    trigger('bounceIn', [
      transition(':enter', [
        animate('1s', keyframes([
          style({ transform: 'scale(0.5)', offset: 0 }),
          style({ transform: 'scale(1.1)', offset: 0.7 }),
          style({ transform: 'scale(1)', offset: 1 })
        ]))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit, AfterViewInit {
  latestJobs: any[] = [];

  totalUsers: number = 0;
  totalEnterprises: number = 0;
  totalJobs: number = 0;
  imageUrls: string[] = [
    '../../assets/other/img-01.jpg',
    '../../assets/other/img-02.jpg',
    '../../assets/other/img-03.jpg',
    '../../assets/other/img-04.jpg',
    '../../assets/other/img-05.jpg',
    '../../assets/other/img-06.jpg'
  ];
  shuffledImages: string[];

  constructor(
    private jobService: JobService,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
  ) {
    this.shuffledImages = this.shuffleArray(this.imageUrls);
  }

  ngOnInit(): void {
    this.fetchLatestJobs();
    this.fetchTotalUsers();
    this.fetchTotalEnterprises();
    this.fetchTotalJobs();
  }

  fetchTotalUsers(): void {
    this.userService.getUsers().subscribe(
      (users: any[]) => {
        this.totalUsers = users.length;
      },
      (error: any) => {
        console.error('Error fetching total users:', error);
      }
    );
  }

  fetchTotalEnterprises(): void {
    this.userService.getEnterprises().subscribe(
      (enterprises: any[]) => {
        this.totalEnterprises = enterprises.length;
      },
      (error: any) => {
        console.error('Error fetching total enterprises:', error);
      }
    );
  }

  fetchTotalJobs(): void {
    this.jobService.getAllJobs().subscribe(
      (jobs: any[]) => {
        this.totalJobs = jobs.length;
      },
      (error: any) => {
        console.error('Error fetching total jobs:', error);
      }
    );
  }

  fetchLatestJobs(): void {
    this.jobService.getLatestJobs().subscribe(
      (jobs: any[]) => {
        this.latestJobs = jobs;
        this.cdr.detectChanges(); // Manually trigger change detection
      },
      (error: any) => {
        console.error('Error fetching latest jobs:', error);
      }
    );
  }

  ngAfterViewInit(): void {
    this.initializeAnimations();
  }

  initializeAnimations(): void {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          observer.unobserve(entry.target); // Remove observer after animation
        }
      });
    }, {
      threshold: 0.1 // Adjust the threshold as needed
    });

    const targets = document.querySelectorAll('.animate-on-scroll');
    targets.forEach(target => observer.observe(target));
  }

  private shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  getJobImage(index: number): string {
    return this.shuffledImages[index % this.shuffledImages.length];
  }
}
