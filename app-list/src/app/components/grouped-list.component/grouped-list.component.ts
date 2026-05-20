import { Component, input, OnChanges, OnInit, output, signal, SimpleChanges } from '@angular/core';
import { SavedConversation } from '@code-zoom/shared-types';
import { ChatGrouperService } from '../../services/chat-grouper.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grouped-list',
  imports: [CommonModule],
  templateUrl: './grouped-list.component.html',
  styleUrl: './grouped-list.component.css',
})
export class GroupedListComponent implements OnInit, OnChanges {
  savedConversations = input<SavedConversation[]>([]);
  currentConversationId = input('');
  searchParam = input('');
  getConversationId = output<string>();

  groupedConversations = signal<Record<string, SavedConversation[]>>({});
  sortedDates = signal<string[]>([]);

  constructor(private chatGrouper: ChatGrouperService) {}

  ngOnInit(): void {
    this.getSortedConversations(this.savedConversations());
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getSortedConversations(this.savedConversations());
  }

  getSortedConversations(savedConversations: SavedConversation[]) {
    const filteredConversations = savedConversations.filter(
      (c) =>
        c.title.toLowerCase().indexOf(this.searchParam()) > -1 ||
        c.messages.find((msg) => msg.content.toLowerCase().indexOf(this.searchParam()) > -1)
    );
    this.groupedConversations.set(this.chatGrouper.groupByDate(filteredConversations));
    this.sortedDates.set(this.chatGrouper.getSortedDates(this.groupedConversations()));
  }

  loadConversation(id: string) {
    this.getConversationId.emit(id);
  }
}
