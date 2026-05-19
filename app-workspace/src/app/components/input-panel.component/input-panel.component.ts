import { ChangeDetectorRef, Component, input, model, output, signal } from '@angular/core';
import {
  ChatMessage,
  ConversationRequest,
  IResponse,
  TitleRequest,
  UploadedFile,
} from '@code-zoom/shared-types';
import { FileCardComponent } from '../file-card.component/file-card.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChattypeComponent } from '../chattype.component/chattype.component';
import { LangtypeComponent } from '../langtype.component/langtype.component';
import { PlaceholderImage } from '../../directives/placeholder-image';

@Component({
  selector: 'app-input-panel',
  imports: [
    FileCardComponent,
    CommonModule,
    FormsModule,
    ChattypeComponent,
    LangtypeComponent,
    PlaceholderImage,
  ],
  templateUrl: './input-panel.component.html',
  styleUrl: './input-panel.component.css',
})
export class InputPanelComponent {
  messages = input<ChatMessage[]>([]);

  userInput = input('');
  chatType = input<string>('claude');
  langType = input<string>('typescript');
  isLoading = input<boolean>(false);
  welcomeMessage = input<string>('');

  userInputChange = output<string>();
  chatTypeChange = output<string>();
  langTypeChange = output<string>();
  isLoadingChange = output<boolean>();

  uploadedFiles = input<UploadedFile[]>([]);

  messageSend = output<string>();
  protected localInput = signal('');
  state = signal<any>({});

  constructor(private cdr: ChangeDetectorRef) {}

  startMessage() {
    const message = this.localInput();
    // if (!message.trim()) return;

    this.localInput.set(''); // Clear immediately - no timing issues
    //debugger;
    this.cdr.detectChanges();
    this.messageSend.emit(message); // Emit the actual message
  }

  handleKeyChange(key: string) {
    this.state.set({ chatType: key });
    this.chatTypeChange.emit(key);
  }
  handleInputChange(key: string) {
    this.userInputChange.emit(key);
  }

  handleLangChange(key: string) {
    this.langTypeChange.emit(key);
  }
}
