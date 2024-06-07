import { ChangeDetectorRef, Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../messages.service';
import { UserService } from '../user.service';
import { SocketService } from '../socket.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { trigger, style, animate, transition } from '@angular/animations';
import { UnreadMessageService } from '../unread-message.service';

@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.css'],
  animations: [
    trigger('messageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
})
export class ConversationsComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  conversations: any[] = [];
  selectedConversation: any = null;
  messageForm: FormGroup;
  userId: string | null = null;
  currentUsername: string = ''; // Initialize as empty string
  currentUserId: string = ''; // Store current user's ID
  baseUrl = 'http://localhost:3000'; // Base URL for the backend
  socketSubscription: Subscription | null = null;

  messagesPage: number = 1;
  messagesLimit: number = 10;
  hasMoreMessages: boolean = true;

  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private socketService: SocketService,
    private unreadMessageService: UnreadMessageService // Inject the service
  ) {
    this.messageForm = this.fb.group({
      content: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Get the current user's username and ID
    this.userService.checkAuthStatus().subscribe((response) => {
      this.currentUsername = response.username; // Assuming the response contains the username
      this.currentUserId = response.userId; // Assuming the response contains the userId
      this.changeDetectorRef.detectChanges();
    });

    this.route.paramMap.subscribe(params => {
      this.userId = params.get('userId');
      if (this.userId) {
        this.openConversation(this.userId);
      }
    });

    this.loadConversations();

    // Subscribe to incoming messages via SocketService
    this.socketSubscription = this.socketService.getMessages().subscribe((message) => {
      if (this.selectedConversation && 
         (message.receiverUsername === this.selectedConversation.username || message.senderUsername === this.selectedConversation.username)) {
        this.selectedConversation.messages.push(message);
        this.scrollToBottom(); // Scroll to the bottom when a new message is received
        this.changeDetectorRef.detectChanges();
      }
      this.loadConversations(); // Refresh conversations list on new message
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    // Unsubscribe from the socket when the component is destroyed
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
    this.socketService.disconnect();
  }

  openConversation(userId: string): void {
    this.messagesPage = 1; // Reset page for new conversation
    this.hasMoreMessages = true; // Reset pagination flag
    this.loadMessages(userId, this.messagesPage, this.messagesLimit);

    // Mark messages as read in the backend
    this.messageService.getMessages(userId, this.messagesPage, this.messagesLimit).subscribe((data) => {
      this.selectedConversation = {
        userId,
        username: data.user2.username,
        logo: data.user2.logo, // Assuming the logo URL is included
        messages: data.messages
      };
      this.hasMoreMessages = data.pagination.total > this.messagesPage * this.messagesLimit;
      this.scrollToTop(); // Scroll to the top when loading older messages

      // Mark messages as read locally
      this.conversations.forEach(conversation => {
        if (conversation.userId === userId) {
          conversation.unreadCount = 0;
        }
      });

      this.unreadMessageService.setUnreadMessages(this.conversations.some(conversation => conversation.unreadCount > 0));
      this.changeDetectorRef.detectChanges();
    });
  }

  loadMessages(userId: string, page: number, limit: number): void {
    this.messageService.getMessages(userId, page, limit).subscribe((data) => {
      if (page === 1) {
        this.selectedConversation = {
          userId,
          username: data.user2.username,
          logo: data.user2.logo, // Assuming the logo URL is included
          messages: data.messages
        };
      } else {
        this.selectedConversation.messages = [...data.messages, ...this.selectedConversation.messages];
      }
      this.hasMoreMessages = data.pagination.total > page * limit;
      this.scrollToTop(); // Scroll to the top when loading older messages
      this.changeDetectorRef.detectChanges();
    });
  }

  loadMoreMessages(): void {
    if (this.selectedConversation && this.hasMoreMessages) {
      this.messagesPage++;
      this.loadMessages(this.selectedConversation.userId, this.messagesPage, this.messagesLimit);
    }
  }

  sendMessage(): void {
    if (this.messageForm.valid && this.selectedConversation) {
      const newMessage = {
        senderId: this.currentUserId, // Use the actual sender ID
        receiverId: this.selectedConversation.userId,
        content: this.messageForm.get('content')?.value
      };

      // Save message to the database
      this.messageService.sendMessage(newMessage).subscribe(
        (response) => {
          const message = response.data;

          // Reset the form and clear the input field
          this.messageForm.reset();
          this.changeDetectorRef.detectChanges();

          // Add the message to the selected conversation
          this.selectedConversation.messages.push({
            content: message.content,
            timestamp: message.timestamp,
            senderUsername: this.currentUsername,
            receiverUsername: this.selectedConversation.username
          });

          // Refresh the conversation to avoid duplicate messages
          this.loadMessages(this.selectedConversation.userId, 1, this.messagesPage * this.messagesLimit);
        },
        (error) => {
          console.error('Error sending message:', error);
        }
      );
    }
  }

  loadConversations(): void {
    this.messageService.getConversations().subscribe((data) => {
      this.conversations = Object.values(data.data);
      this.unreadMessageService.setUnreadMessages(this.conversations.some(conversation => conversation.unreadCount > 0));
      this.changeDetectorRef.detectChanges();
    });
  }

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  private scrollToTop(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = 0;
    } catch (err) {
      console.error('Error scrolling to top:', err);
    }
  }
}
