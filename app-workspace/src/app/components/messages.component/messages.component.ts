import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { ChatMessage } from '@code-zoom/shared-types';

@Component({
  selector: 'app-messages',
  imports: [CommonModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css',
})
export class MessagesComponent {
  messages = input<ChatMessage[]>([]);
}
