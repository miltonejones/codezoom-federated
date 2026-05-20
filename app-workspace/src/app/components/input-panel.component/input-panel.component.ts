import { ChangeDetectorRef, Component, input, model, OnInit, output, signal } from '@angular/core';
import {
  ChatMessage,
  ChatType,
  ConversationRequest,
  IResponse,
  TitleRequest,
  UploadedFile,
} from '@code-zoom/shared-types';
import { FileCardComponent } from '../file-card.component/file-card.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChattypeComponent, chatTypes } from '../chattype.component/chattype.component';
import { LangtypeComponent } from '../langtype.component/langtype.component';
import { PlaceholderImage } from '../../directives/placeholder-image';
import { AssetsService } from '../../services/assets.service';
import { QuickPromptsComponent } from '../quick-prompts.component/quick-prompts.component';

@Component({
  selector: 'app-input-panel',
  imports: [
    FileCardComponent,
    CommonModule,
    FormsModule,
    ChattypeComponent,
    LangtypeComponent,
    PlaceholderImage,
    QuickPromptsComponent,
  ],
  templateUrl: './input-panel.component.html',
  styleUrl: './input-panel.component.css',
})
export class InputPanelComponent implements OnInit {
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

  constructor(private cdr: ChangeDetectorRef, private assetSvc: AssetsService) {}

  startMessage() {
    const message = this.localInput();
    this.localInput.set('');
    this.cdr.detectChanges();
    this.messageSend.emit(message);
  }

  ngOnInit(): void {
    this.updateLogo(this.chatType());
  }

  setMessage(msg: string) {
    this.localInput.set(msg);
    this.startMessage();
  }

  updateLogo(key: string) {
    // debugger;
    const updatedType: ChatType | undefined = chatTypes.find((t) => t.key === key);
    if (!updatedType) return;
    window.dispatchEvent(
      new CustomEvent('logoUpdate', {
        detail: { logo: this.assetSvc.getImageUrl(updatedType.logo), label: updatedType.label },
      })
    );
  }

  handleKeyChange(key: string) {
    this.state.set({ chatType: key });
    this.chatTypeChange.emit(key);
    this.updateLogo(key);
  }
  handleInputChange(key: string) {
    this.userInputChange.emit(key);
  }

  handleLangChange(key: string) {
    this.langTypeChange.emit(key);
  }
}
