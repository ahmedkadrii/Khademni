import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any;
  private readonly url: string = 'http://localhost:3000'; // Backend URL

  constructor() {
    this.socket = io(this.url);
  }

  public sendMessage(message: any): void {
    this.socket.emit('sendMessage', message);
  }

  public getMessages(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('receiveMessage', (message: any) => {
        observer.next(message);
      });
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
