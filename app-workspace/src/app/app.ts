import {
  Component,
  computed,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  signal,
  SimpleChanges,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  ChatMessage,
  ConversationManager,
  ConversationRequest,
  FileService,
  IResponse,
  SavedConversation,
  TitleRequest,
  ChatManager,
} from '@code-zoom/shared-types';
import { MessagesComponent } from './components/messages.component/messages.component';
import { InputPanelComponent } from './components/input-panel.component/input-panel.component';
import { Subscription } from 'rxjs';
import { SendMessageService } from './services/send-message-service';
import { ChattypeComponent } from './components/chattype.component/chattype.component';
import { LangtypeComponent } from './components/langtype.component/langtype.component';

@Component({
  selector: 'app-root',
  imports: [MessagesComponent, InputPanelComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy, OnChanges {
  protected readonly title = signal('app-workspace');
  public currentConversationId = '';
  SELECT_EVENT_NAME = 'get-conversation';
  private conversationId: string | undefined = '';
  uploadedFiles = computed(() => this.fileService?.files() || []);
  /** Array of chat messages in the current conversation */
  messages = signal<ChatMessage[]>([]);
  /** Caption for the chat header/title, displayed when conversation starts */
  chatCaption = signal('');
  @Input() dynamoService: ConversationManager | null = null;
  @Input() fileService: FileService | null = null;
  @Input() chatService: ChatManager | null = null;

  userInput = signal('');
  /** Type of chat model to use (e.g., 'claude') */
  chatType = 'deep';

  /** Programming language for code explanation context */
  langType = 'typescript';

  chatName = 'Milton';
  welcomeMessage = signal('');

  /** Flag indicating whether an async operation is in progress */
  isLoading = false;
  private subscription?: Subscription;
  lastRequest: ConversationRequest | undefined;

  startMessage(message: string): void {
    const userInput = this.userInput();
    this.userInput.set('');
    // debugger;
    this.chatService?.initMessaage(
      this.messages(),
      message,
      this.chatType,
      this.langType,
      this.uploadedFiles()
    );
    this.isLoading = true;
    // this.userInput.set('');
  }

  announce() {
    window.dispatchEvent(
      new CustomEvent('updateList', { detail: { conversationId: this.currentConversationId } })
    );
  }

  async saveConversation() {
    // alert('saveConversation');
    if (!this.dynamoService) return alert('no dynamoService');

    const conversation: SavedConversation = {
      id: this.currentConversationId!,
      title: this.chatCaption(),
      code: this.chatService?.lastRequest!.code!,
      files: this.uploadedFiles(),
      language: this.langType,
      messages: this.messages(),
      lastUpdated: new Date().getTime(),
      createdAt: new Date().getTime(),
    };

    // alert(this.currentConversationId + '!!\n\n' + JSON.stringify(conversation));
    await this.dynamoService.saveConversation(this.currentConversationId!, conversation);
    this.announce();
  }

  constructor(private sendMessageService: SendMessageService) {}

  ngOnInit(): void {
    window.addEventListener(this.SELECT_EVENT_NAME, (e: Event) => {
      // debugger;
      const customEvent = e as CustomEvent;
      this.currentConversationId = customEvent.detail.id;
      this.loadConversation(customEvent.detail.id);
    });

    this.currentConversationId = `conv${Date.now()}`;
    console.log({ init: this.chatService });

    this.chatService?.messageComplete.subscribe((messages) => {
      this.messages.set(messages);
      this.highlight();
    });

    this.chatService?.messageStreaming.subscribe((isStreaming) => {
      if (!isStreaming) {
        this.isLoading = false;
        this.saveConversation();
        return;
      }
      console.log({ isStreaming });
    });

    this.chatService?.messageTitle.subscribe((title) => {
      this.chatCaption.set(title);
    });

    this.chatService?.messageWelcome.subscribe((msg) => {
      this.welcomeMessage.set(msg);
    });

    // this.chatService?.getWelcomeMessage({
    //   chatType: this.chatType,
    //   chatName: this.chatName,
    // });
  }

  updateWelcome() {
    // alert(this.chatType);

    this.welcomeMessage.set('loading...');
    this.chatService?.getWelcomeMessage({
      chatType: this.chatType,
      chatName: this.chatName,
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log({ changes });
  }

  handleFileUpload(e: Event): void {
    const target = e.target as HTMLInputElement;
    const files = target.files;
    if (!files || files.length === 0) return;
    this.fileService?.uploadFiles(Array.from(files));
  }

  async loadConversation(id: string) {
    if (!this.dynamoService || !this.fileService) return alert(id);
    const conversation = await this.dynamoService?.getConversation(id);
    console.log({ conversation });
    if (!conversation?.messages) return;
    this.messages.set(conversation?.messages!);
    this.chatCaption.set(conversation?.title!);
    this.fileService.files.set(conversation?.files!);
    this.conversationId = conversation?.id;
    this.userInput.set('');
    this.highlight();
  }

  highlight() {
    // Apply syntax highlighting after Angular renders the HTML
    setTimeout(() => {
      document.querySelectorAll('pre code').forEach((block) => {
        (window as any).hljs.highlightElement(block as HTMLElement);
      });
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener(this.SELECT_EVENT_NAME, (e: Event) => {});
  }
}
