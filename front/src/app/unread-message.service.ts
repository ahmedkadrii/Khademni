import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UnreadMessageService {
  private unreadMessagesSubject = new BehaviorSubject<boolean>(false);
  hasUnreadMessages$ = this.unreadMessagesSubject.asObservable();

  setUnreadMessages(hasUnreadMessages: boolean): void {
    this.unreadMessagesSubject.next(hasUnreadMessages);
  }
}
