import { loadRemoteModule } from '@angular-architects/native-federation';
import { CommonModule } from '@angular/common';
import {
  AfterContentInit,
  afterNextRender,
  Component,
  Input,
  OnChanges,
  OnInit,
  signal,
  SimpleChanges,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatMessage, ConversationManager, SavedConversation } from '@code-zoom/shared-types';
import { SearchModalComponent } from './components/search-modal.component/search-modal.component';
import { ChatGrouperService } from './services/chat-grouper.service';
import { GroupedListComponent } from './components/grouped-list.component/grouped-list.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, SearchModalComponent, GroupedListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnChanges, AfterContentInit {
  protected readonly title = signal('app-list');
  @Input() dynamoService: ConversationManager | null = null;

  messages = signal<ChatMessage[]>([]);
  savedConversations = signal<SavedConversation[]>([]);
  SELECT_EVENT_NAME = 'get-conversation';
  currentConversationId = '';
  logo = signal('');
  label = signal('');
  collapsed = signal<Boolean>(false);
  groupedConversations = signal<Record<string, SavedConversation[]>>({});
  sortedDates = signal<string[]>([]);

  constructor(private chatGrouper: ChatGrouperService) {
    afterNextRender(() => {
      this.loadService();
    });
  }

  ngOnInit(): void {
    window.addEventListener('updateList', (e: Event) => {
      // debugger;
      const customEvent = e as CustomEvent;
      this.currentConversationId = customEvent.detail.conversationId;
      // alert(this.currentConversationId);
      this.updateSaveList();
    });

    window.addEventListener('logoUpdate', (e: Event) => {
      const customEvent = e as CustomEvent;
      this.logo.set(customEvent.detail.logo);
      this.label.set(customEvent.detail.label);
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    // this.loadService();
  }

  ngAfterContentInit(): void {
    // this.loadService();
  }

  public counter = '';

  async loadService() {
    this.updateSaveList();
  }

  async updateSaveList() {
    const savedConversations = await this.dynamoService?.loadAllConversations();
    if (savedConversations) {
      setTimeout(() => {
        this.savedConversations.set(savedConversations);
        // this.getSortedConversations(savedConversations);
      });
    }
  }

  getSortedConversations(savedConversations: SavedConversation[]) {
    this.groupedConversations.set(this.chatGrouper.groupByDate(savedConversations));
    this.sortedDates.set(this.chatGrouper.getSortedDates(this.groupedConversations()));
  }

  collapse() {
    this.collapsed.update((on) => {
      return !on;
    });
    window.dispatchEvent(
      new CustomEvent('paneSize', {
        detail: {
          collapsed: this.collapsed(),
        },
      })
    );
  }

  loadConversation(id: string) {
    this.currentConversationId = id;
    window.dispatchEvent(new CustomEvent(this.SELECT_EVENT_NAME, { detail: { id } }));
  }
  clearConversation() {
    this.currentConversationId = '';
    window.dispatchEvent(new CustomEvent('chatClear'));
  }

  showModal() {
    window.showSearchModal && window.showSearchModal();
  }
}

declare global {
  interface Window {
    showSearchModal: () => void;
  }
}
