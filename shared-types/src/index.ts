import { Subject } from "rxjs";

/**
 * Interface defining the observable aspect of state management.
 * Provides methods to read state and subscribe to state changes.
 */
export interface IStateObservable {
  /**
   * Retrieves the current state object.
   * @returns {IState} A copy of the current state to prevent direct mutation.
   */
  getState(): IState;

  /**
   * Registers a listener function to be called whenever the state changes.
   * @param {function(IState): void} listener - Callback function that receives the new state.
   * @returns {function(): void} Unsubscribe function that removes the listener when called.
   */
  subscribe(listener: (state: IState) => void): () => void;
}

export interface ConversationManager {
  conversations: string[];
  saveConversation(id: string, conversation: SavedConversation): Promise<void>;
  loadAllConversations(): Promise<SavedConversation[]>;
  getConversation(id: string): Promise<SavedConversation>;
}

export interface ChatManager {
  messages: ChatMessage[];
  userInput: string;
  chatType: string;
  langType: string;
  uploadedFiles: UploadedFile[];
  lastRequest: ConversationRequest | undefined;
  conversationId: string | undefined;

  messageStreaming: Subject<boolean | undefined>;
  messageComplete: Subject<ChatMessage[]>;
  messageTitle: Subject<string>;
  messageWelcome: Subject<string>;

  initMessaage(
    messages: ChatMessage[],
    message: string,
    mode: string,
    language: string,
    attachments: UploadedFile[]
  ): void;

  getWelcomeMessage(request: WelcomeRequest): void;
}

type Signal<T> = {
  (): T;
  set(value: T): void;
  update(updater: (value: T) => T): void;
  mutate(mutator: (value: T) => void): void;
  asReadonly(): Signal<T>;
};

export interface FileService {
  readonly files: Signal<UploadedFile[]>;

  appendFile(file: UploadedFile): void;
  removeFile(fileName: string): void;
  uploadFiles(files: File[]): Promise<void>;
  readFilesFromURLs(addresses: string[]): Promise<void>;
}

/**
 * Interface defining the mutable aspect of state management.
 * Provides methods to update the application state.
 */
export interface IStateMutable {
  /**
   * Updates the current state with the provided partial state object.
   * @param {Partial<IState>} updates - Partial state object containing properties to update.
   */
  setState(updates: Partial<IState>): void;
}

/**
 * Interface for components that manage event binding and unbinding.
 */
export interface IEventHandler {
  /** Binds all necessary event listeners. */
  bindEvents(): void;
  /** Removes all bound event listeners to prevent memory leaks. */
  removeEvents(): void;
}

/**
 * Interface for a service that manages the display of various modal dialogs.
 */
export interface IModalService {
  /** Shows an error modal with a specific message. */
  showError(message: string): void;
  /** Shows a general alert modal with a specific message. */
  showAlert(message: string): void;
  /** Hides the currently displayed alert modal. */
  hideAlert(): void;
  /** Shows the search modal. */
  showSearch(): void;
  /** Hides the search modal. */
  hideSearch(): void;
  /** Shows the file upload modal. */
  showUpload(): void;
  /** Hides the file upload modal. */
  hideUpload(): void;
  /** Hides the currently displayed error modal. */
  hideError(): void;
}

/**
 * Interface for components responsible for rendering UI based on application state.
 */
export interface IRenderer {
  /**
   * Renders or updates the UI based on the provided state.
   * @param {IState} state - The current application state.
   */
  render(state: IState): void;
}

/**
 * Represents a type of chat, e.g., a specific AI model or integration.
 */
export interface ChatType {
  /** A unique key identifying the chat type. */
  key: string;
  /** A user-friendly label for the chat type. */
  label: string;
  /** URL to the logo image for the chat type. */
  logo: string;
  /** The API endpoint or internal URL associated with this chat type. */
  url: string;
}

/**
 * Represents a file that has been uploaded by the user.
 */
export interface UploadedFile {
  /** The name of the uploaded file. */
  name: string;
  /** The content of the file, typically as a string. */
  content: string;
  /** Optional: The size of the file in bytes. */
  size?: number;

  extension?: string;
}

/**
 * Represents a feature flag used for toggling functionality.
 */
export interface FeatureFlags {
  /** The unique key for the feature flag. */
  key: string;
  /** Indicates if the feature is enabled. */
  enabled: boolean;
  /** Optional: A description of the feature flag. */
  description?: string;
}

/**
 * Represents an authenticated user's profile information.
 */
export interface IAuthUser {
  /** A unique identifier for the user in Cognito. */
  userId: string;
  /** The username used for login (could be email if configured that way). */
  username: string;
  /** Optional: The user's full name. */
  name?: string;
  /** Optional: URL to the user's profile picture. */
  picture?: string;
  /** Optional: The user's email address. */
  email?: string;
  /**
   * Optional details about how the user signed in, often present after a successful sign-in.
   */
  signInDetails?: {
    /** Optional: The login ID used (e.g., email or username). */
    loginId?: string; // <--- CHANGED: Made loginId optional
    /** Optional: The authentication flow type used (e.g., 'USER_SRP_AUTH'). */
    authFlowType?: string; // <--- CHANGED: Made authFlowType optional for robustness
  };
  /**
   * An object containing standard and custom user attributes.
   * Keys are attribute names (e.g., 'email', 'phone_number', 'custom:myAttribute'), values are strings.
   */
  attributes?: Record<string, string>;
}

/**
 * Data required for user registration.
 */
export interface IAuthRegistrationData {
  /** Optional: The desired username for registration. */
  username?: string;
  /** Optional: The user's email address for registration. */
  email?: string;
  /** Optional: The desired password for registration. */
  password?: string;
  /** Optional: The user's full name for registration. */
  name?: string;
  /** Optional: URL to the user's profile picture for registration. */
  picture?: string;
}

/**
 * Data required for user login.
 */
export interface IAuthLoginData {
  /** Optional: The username for login. */
  username?: string;
  /** Optional: The password for login. */
  password?: string;
}

/**
 * The main application state interface.
 * Contains all data managed by the state management system.
 */
export interface IState {
  /** The current code snippet being displayed or edited. */
  code: string;
  /** A general message displayed to the user (e.g., status, errors). */
  message: string;
  /** Array of chat messages in the current conversation. */
  conversation: ChatMessage[];
  /** The title of the current conversation. */
  conversationTitle: string;
  /** Indicates if a general loading operation is in progress. */
  loading: boolean;
  /** Indicates if the AI is currently thinking/generating a response. */
  thinking: boolean;
  /** A counter for how many AI thoughts are pending or in progress. */
  thinkingCount: number;
  /** Indicates if a new conversation is being started. */
  startingConversation: boolean;
  /** Array of all saved conversations. */
  savedConversations: SavedConversation[];
  /** The ID of the currently active conversation. */
  currentConversationId: string;
  /** Optional: Reference to the HTML element marking the end of messages for scrolling. */
  messagesEndRef?: HTMLDivElement;
  /** The programming language context for the code. */
  language: string;
  /** Indicates if a file is currently being uploaded. */
  fileUploading: boolean;
  /** Indicates if the sidebar navigation is currently shown. */
  showSidebar: boolean;
  /** The URL for the Storybook instance, if integrated. */
  storybookUrl: string;
  /** Array of files that have been uploaded in the current context. */
  uploadedFiles: UploadedFile[];
  /** The token limit for AI model interactions. */
  tokenLimit: number;
  /** Optional: The number of tokens used in the current interaction. */
  tokensUsed?: number;
  /** Optional: A progress indicator for AI thinking, from 0 to 100. */
  thinkingProgress?: number;
  /** Any error message to be displayed. */
  errorMsg: string;
  /** The type of chat session currently active (e.g., 'code-generation', 'qa'). */
  chatType: string;
  /** Array of feature flags to control UI/feature visibility. */
  flags: FeatureFlags[];
  /** Optional: A chat parameter, potentially from a URL query. */
  chatParam?: string;
  /** Optional: A code parameter, potentially from a URL query. */
  codeParam?: string;
  /** Optional: An initial message to pre-populate the chat input. */
  initialMessage?: string;
  /** Optional: A general title for the application context. */
  title?: string;
  /** Optional: URL of a fetched file. */
  fetchedFileUrl?: string;
  /** Optional: Indicates if a fetched file URL was invalid. */
  fetchedFileInvalid?: boolean;
  /** Optional: Array of URLs for fetched files. */
  fetchedFileUrls?: string[];
  /** Optional: A welcome message to display. */
  welcomeMessage?: string;
  /** Optional: Indicates if the user is currently authenticated. */
  isAuthenticated?: boolean;
  /** Optional: The currently authenticated user's data, or null if not logged in. */
  user?: IAuthUser | null;
  /** Optional: The current view being displayed (e.g., "chat", "signin", "register"). */
  view?: string; //"chat" | "signin" | "register";
  /** Optional: The username field, possibly for display or form input. */
  username?: string | null;
  /** Optional: Data for the registration form. */
  registrationProps?: IAuthRegistrationData;
  /** Optional: Data for the authentication/login form. */
  authProps?: IAuthLoginData;
  /** Optional: The confirmation code entered by the user during signup verification. */
  confirmationCode?: string;
  openDates?: Record<string, boolean>;
  sidebarScrollTop?: number;
}

/**
 * Represents a saved conversation, including its history and metadata.
 */
export interface SavedConversation {
  /** Unique identifier for the conversation. */
  id: string;
  /** User-friendly title of the conversation. */
  title: string;
  /** The code snippet associated with the conversation (if any). */
  code: string;
  /** The programming language context of the conversation. */
  language: string;
  /** Array of messages in this conversation. */
  messages: ChatMessage[];
  /** Timestamp when the conversation was created. */
  createdAt: number;
  /** Timestamp when the conversation was last updated. */
  lastUpdated: number;
  /** Optional: Files associated with this saved conversation. */
  files?: UploadedFile[];
}

/**
 * Represents a single message within a chat conversation.
 */
export interface ChatMessage {
  /** The role of the message sender (e.g., "user", "assistant", "system"). */
  role: string;
  /** The actual content of the message. */
  content: string;
  /** Timestamp when the message was sent or received. */
  timestamp: number;
  /** Optional: Indicates if this message is fully complete (especially for streaming responses). */
  isComplete?: boolean;
  /** Optional: A unique identifier for the message. */
  messageId?: string;
  /** Optional: The type of chat this message belongs to. */
  chatType?: string;
}

/**
 * Defines the structure for the request payload sent to the welcome API.
 */
export interface WelcomeRequest {
  /**
   * The type of chat, e.g., "general", "support".
   */
  chatType: string;
  /**
   * Optional name for the chat, if applicable.
   */
  chatName?: string;
  /**
   * Optional icon for the chat, if applicable.
   */
  chatIcon?: string;
}
/**
 * Represents a response from an AI or backend service.
 */
export interface IResponse {
  /** The main content of the message from the response. */
  messageContent: string;
  /** Optional: The conversation ID associated with this response. */
  conversationId?: string;
  /** The reason the AI generation finished (e.g., "stop", "length"). */
  finish_reason: string;
  /** Indicates if the response is complete. */
  isComplete: boolean;
}

/**
 * Type alias for a record where keys are filenames and values are file contents.
 */
export type Files = Record<string, string>;

/**
 * Represents a request to start or continue a conversation with an AI.
 */
export interface ConversationRequest {
  /** Optional: The code snippet relevant to the conversation. */
  code?: string;
  /** Optional: The programming language context. */
  language?: string;
  /** The user's message to the AI. */
  message: string;
  /** The history of previous messages in the conversation. */
  conversationHistory: ChatMessage[];
  /** Optional: Files attached to the conversation request. */
  files?: Files;
  /** Optional: The specific chat type for this request. */
  chatType?: string;
  /** Optional: A callback function to handle streaming updates of the AI response. */
  streamingCallback?: (message: string) => void;
}

/**
 * Represents a request to generate a title for a conversation.
 */
export interface TitleRequest {
  /** Optional: The code snippet relevant to title generation. */
  code?: string;
  /** Optional: The programming language context. */
  language?: string;
  /** Optional: Files attached for context in title generation. */
  files?: Files;
  /** Optional: The specific chat type for this title request. */
  chatType?: string;
}
