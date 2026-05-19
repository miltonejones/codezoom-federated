import { Injectable } from '@angular/core';
import { SavedConversation } from '../shared/interfaces/interfaces';

@Injectable({
  providedIn: 'root',
})
export class ConversationManagerService {
  DB_API_BASE_URL = 'https://rdldgdvug0.execute-api.us-east-1.amazonaws.com/dev';
  DEMO_USER_ID = 'demo-user-id-123';
  private readonly MAX_CONVERSATIONS = 100;
  savedConversations: SavedConversation[] = [];

  getUserId() {
    return this.DEMO_USER_ID;
  }

  /**
   * Saves a conversation to DynamoDB via the API.
   * @param id The unique identifier for the conversation.
   * @param conversation The SavedConversation object to save.
   */
  async saveConversation(id: string, conversation: SavedConversation): Promise<void> {
    try {
      const userId = this.getUserId();
      if (!userId) {
        console.error('No userId found - user not authenticated');
        return;
      }

      const conversationToSave = {
        ...conversation,
        id,
        lastUpdated: Date.now(),
      };

      const response = await fetch(`${this.DB_API_BASE_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          conversation: conversationToSave,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save conversation: ${response.statusText}`);
      }

      // After saving, fetch the latest conversations to update the UI
      this.savedConversations = await this.getRecentConversations();
      // this.store.setState({
      //   savedConversations: recentConversations,
      // });
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  }

  /**
   * Retrieves a single conversation by its ID from DynamoDB.
   * @param id The unique identifier of the conversation to retrieve.
   */
  async getConversation(id: string): Promise<SavedConversation | null> {
    // alert(JSON.stringify({ id }));
    try {
      const userId = this.getUserId();
      if (!userId) {
        console.error('No userId found - user not authenticated');
        return null;
      }
      const response = await fetch(`${this.DB_API_BASE_URL}/conversations/${userId}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // this.store.setState({ loading: false });
      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorMsg = `Failed to get conversation: ${response.statusText}`;
        // this.store.setState({ errorMsg });
        throw new Error(errorMsg);
      }

      const data = await response.json();

      // Transform the API response back to SavedConversation format
      return {
        id: data.conversationId,
        title: data.title,
        code: data.code,
        language: data.language,
        messages: data.messages,
        createdAt: data.createdAt,
        lastUpdated: data.lastUpdated,
        files: data.files || [],
      };
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  }

  /**
   * Deletes a conversation by its ID from DynamoDB.
   * @param id The unique identifier of the conversation to delete.
   */
  async deleteConversation(id: string): Promise<void> {
    try {
      const userId = this.getUserId();
      if (!userId) {
        console.error('No userId found - user not authenticated');
        return;
      }

      const response = await fetch(`${this.DB_API_BASE_URL}/conversations/${userId}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete conversation: ${response.statusText}`);
      }

      // After deletion, update the list of recent conversations
      this.savedConversations = await this.getRecentConversations();
      // this.store.setState({ savedConversations: recentConversations });

      // If the deleted conversation was the one currently loaded, clear it
      // if (id === this.store.state.currentConversationId) {
      //   this.clearConversation();
      // }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  /**
   * Loads all conversations for the current user from DynamoDB.
   */
  async loadAllConversations(): Promise<SavedConversation[]> {
    try {
      const userId = this.getUserId();
      if (!userId) {
        console.error('No userId found - user not authenticated');
        return [];
      }

      const response = await fetch(
        `${this.DB_API_BASE_URL}/conversations/${userId}?limit=${this.MAX_CONVERSATIONS}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load conversations: ${response.statusText}`);
      }

      const data = await response.json();
      return data.conversations || [];
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  }

  /**
   * Retrieves the most recently updated conversations.
   * The API already returns them sorted, so we just limit the results.
   */
  private async getRecentConversations(): Promise<SavedConversation[]> {
    return await this.loadAllConversations();
  }

  /**
   * Loads saved conversations and updates the application's state.
   */
  async loadSavedConversations(): Promise<void> {
    try {
      const recentConversations = await this.getRecentConversations();
      this.savedConversations = await this.getRecentConversations();
      console.log({ conversations: recentConversations });
    } catch (error) {
      console.error('Error loading saved conversations:', error);
    }
  }
}
