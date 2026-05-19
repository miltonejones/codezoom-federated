import { loadRemoteModule } from '@angular-architects/native-federation';
import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatMessage, ConversationManager, SavedConversation } from '@code-zoom/shared-types';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnChanges {
  protected readonly title = signal('app-list');
  @Input() dynamoService: ConversationManager | null = null;

  messages = signal<ChatMessage[]>([]);
  savedConversations = signal<SavedConversation[]>([]);
  SELECT_EVENT_NAME = 'get-conversation';
  currentConversationId = '';

  ngOnInit(): void {
    this.loadService();

    window.addEventListener('updateList', (e: Event) => {
      // debugger;
      const customEvent = e as CustomEvent;
      this.currentConversationId = customEvent.detail.conversationId;
      // alert(this.currentConversationId);
      this.updateSaveList();
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    // this.loadService();
  }

  public counter = '';
  // iterate() {
  //   this.counter++;
  //   this.announce();
  // }

  // announce() {
  //   this.currentConversationId = this.counter;
  //   window.dispatchEvent(
  //     new CustomEvent(this.SELECT_EVENT_NAME, { detail: { counter: this.counter } })
  //   );
  // }

  async loadService() {
    // console.log('Loading service');
    // // Load the service from the host at RUNTIME (not build time)
    // const hostModule = await loadRemoteModule({
    //   remoteName: 'app-host',
    //   exposedModule: './SharedService',
    //   remoteEntry: 'http://localhost:4200/remoteEntry.json',
    // });
    console.log('Service loaded');
    // this.dynamoService = hostModule.ConversationManagerService;
    console.log({ c: this.dynamoService });
    // debugger;
    const items = await this.dynamoService?.loadAllConversations();
    // If it's a class (not an instance), you'd need to instantiate it
    // Or if the host exported an instance directly, you can use it
    // debugger;
    console.log('Service loaded:', this.dynamoService, { items });

    this.updateSaveList();
  }

  async updateSaveList() {
    const savedConversations = await this.dynamoService?.loadAllConversations();
    console.log({ savedConversations });
    if (savedConversations) {
      this.savedConversations.set(savedConversations);
    }
  }

  loadConversation(id: string) {
    this.currentConversationId = id;
    window.dispatchEvent(new CustomEvent(this.SELECT_EVENT_NAME, { detail: { id } }));
  }
}
