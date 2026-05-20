import { Injectable } from '@angular/core';
import { SavedConversation } from '@code-zoom/shared-types';

@Injectable({
  providedIn: 'root',
})
export class ChatGrouperService {
  groupByDate(conversations: SavedConversation[]): Record<string, SavedConversation[]> {
    return conversations.reduce((groups: Record<string, SavedConversation[]>, conv) => {
      const date = new Date(conv.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(conv);
      return groups;
    }, {});
  }

  getSortedDates(groupedConversations: Record<string, SavedConversation[]>): string[] {
    return Object.keys(groupedConversations).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
  }
}
