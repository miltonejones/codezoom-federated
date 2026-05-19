import { Injectable, EventEmitter, OnInit } from '@angular/core';
import {
  ChatMessage,
  ConversationRequest,
  IResponse,
  TitleRequest,
  UploadedFile,
  WelcomeRequest,
} from '../shared/interfaces/interfaces';
import { SendMessageService, ThinkingCallback } from './send-message';
import { Subject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatManagerService implements OnInit {
  messages: ChatMessage[] = [];
  userInput = '';
  /** Type of chat model to use (e.g., 'claude') */
  chatType = 'claude';

  /** Programming language for code explanation context */
  langType = 'typescript';
  currentMessageId = '';
  uploadedFiles: UploadedFile[] = [];
  private subscription: Subscription | null = null;
  lastRequest: ConversationRequest | undefined;
  private conversationId: string | undefined = '';
  messageComplete = new Subject<ChatMessage[]>();
  messageStreaming = new Subject<boolean | undefined>();
  messageTitle = new Subject<string | undefined>();
  messageWelcome = new Subject<string | undefined>();

  constructor(private sendMessageService: SendMessageService) {
    this.messageComplete.subscribe((message) => {});
    this.sendMessageService.messageStreaming.subscribe((callback) => {
      const newMsg: ChatMessage = {
        role: 'assistant',
        content: callback.message!,
        timestamp: Date.now(),
        messageId: this.currentMessageId,
        isComplete: !callback.isStreaming,
      };

      console.log({ callback });

      // alert(JSON.stringify(newMsg));

      const messages = this.messages.filter((msg) => msg.messageId !== this.currentMessageId);
      messages.push(newMsg);
      this.messages = messages;
      this.scrollIntoView();
      this.messageComplete.next(this.messages);
      this.messageStreaming.next(callback.isStreaming);
    });
  }

  ngOnInit(): void {}

  initMessaage(
    messages: ChatMessage[],
    message: string,
    mode: string,
    language: string,
    attachments: UploadedFile[]
  ): void {
    this.currentMessageId = `msg_${Date.now()}`;
    this.messages = messages;
    this.userInput = message;
    this.chatType = mode;
    this.langType = language;
    this.uploadedFiles = attachments;
    this.startMessage();
  }

  private startMessage(): void {
    const isInitial = this.messages.length === 0;
    // this.chatCaption.set('Loading...');

    // If not initial, just send the message directly
    if (!isInitial) {
      this.sendChatRequest();
      return;
    }

    // Validate that there's input or uploaded files
    if (!this.userInput.trim() && !this.uploadedFiles.length) return;

    // this.isLoading = true;

    // Create request for generating a conversation title
    const welcomeRequest: TitleRequest = {
      chatType: this.chatType,
      code: this.userInput,
    };

    // If files are uploaded, include them in the request
    if (this.uploadedFiles.length > 0) {
      welcomeRequest.code = '';
      const files: Record<string, string> = {};
      this.uploadedFiles.forEach((file) => {
        files[file.name] = file.content;
      });
      welcomeRequest.files = files;
    }

    // Get welcome/title response then proceed with sending the actual message
    this.subscription = this.sendMessageService.getChatTitle(welcomeRequest).subscribe({
      next: (response: IResponse) => {
        // this.chatCaption.set(response.messageContent);
        this.messageTitle.next(response.messageContent);
        this.sendChatRequest();
      },
      error: (error) => {
        console.error('Error sending message:', error);
        // this.isLoading = false;
      },
    });
  }

  getWelcomeMessage(request: WelcomeRequest) {
    this.sendMessageService.getChatWelcome(request).subscribe({
      next: (response: IResponse) => {
        // alert(JSON.stringify(response));
        this.messageWelcome.next(response.messageContent);
      },
      error: (error) => {
        console.error('Error sending message:', error);
        // this.isLoading = false;
      },
    });
  }

  private async sendChatRequest() {
    const currentMessageId = `msg_${Date.now()}`;
    const currentInput = this.userInput;

    // Validate that there's input or uploaded files
    if (!this.userInput.trim() && !this.uploadedFiles.length) return;

    // Clear the input field after capturing the value
    this.userInput = '';

    // Create request for initial message with default prompt
    const initialRequest: ConversationRequest = {
      message: 'explain this code',
      chatType: this.chatType,
      conversationHistory: this.messages,
      code: currentInput,
      language: this.langType,
    };

    // Create request for follow-up messages
    const followingRequest = {
      message: currentInput,
      chatType: this.chatType,
      conversationHistory: this.messages,
      code: initialRequest.code,
      language: this.langType,
      conversationId: this.conversationId,
    };

    const isInitial = this.messages.length === 0;
    this.lastRequest = isInitial ? initialRequest : followingRequest;

    // Add uploaded files to the request if any exist
    if (this.uploadedFiles.length > 0) {
      this.lastRequest.code = '';
      const files: Record<string, string> = {};
      this.uploadedFiles.forEach((file) => {
        files[file.name] = file.content;
      });
      this.lastRequest.files = files;
    }

    // this.isLoading = true;

    // Add user message to conversation history
    if (this.messages.length === 0) {
      this.messages = [
        {
          role: 'user',
          messageId: currentMessageId,
          content: 'explain this code',
          timestamp: Date.now(),
        },
      ];
    } else {
      this.messages.push({
        role: 'user',
        content: currentInput,
        timestamp: Date.now(),
      });
      this.messageComplete.next(this.messages);
    }

    this.scrollIntoView();

    await this.sendMessageService.sendStreamingMessageWithContinuation(this.lastRequest);

    // // Send message using RxJS Observable pattern
    // this.subscription = this.sendMessageService
    //   .sendMessageWithContinuation(this.lastRequest)
    //   .subscribe({
    //     next: (response: IResponse) => {
    //       this.messages.push({
    //         role: 'assistant',
    //         content: response.messageContent,
    //         timestamp: Date.now(),
    //         isComplete: response.isComplete,
    //       });
    //       if (isInitial) {
    //         this.conversationId = response.conversationId;
    //       }
    //       // this.isLoading = false;
    //       this.scrollIntoView();
    //       this.messageComplete.next(this.messages);
    //       // this.saveConversation();
    //     },
    //     error: (error) => {
    //       console.error('Error sending message:', error);
    //       // this.isLoading = false;
    //     },
    //   });
  }
  private scrollIntoView() {
    // Scroll to the last message
    const lastMessage = document.querySelector('.bubble-box');
    if (lastMessage) {
      setTimeout(() => {
        lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 0);
    }
  }
}
