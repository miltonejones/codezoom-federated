import { Component, input, output } from '@angular/core';
import { SavedConversation } from '@code-zoom/shared-types';
import { GroupedListComponent } from '../grouped-list.component/grouped-list.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-modal',
  imports: [GroupedListComponent, FormsModule],
  templateUrl: './search-modal.component.html',
  styleUrl: './search-modal.component.css',
})
export class SearchModalComponent {
  savedConversations = input<SavedConversation[]>([]);
  getConversationId = output<string>();
  searchParam = '';

  loadConversation(id: string) {
    this.getConversationId.emit(id);
    this.hideModal();
  }

  hideModal() {
    window.hideSearchModal();
  }
}

declare global {
  interface Window {
    hideSearchModal: () => void;
  }
}
