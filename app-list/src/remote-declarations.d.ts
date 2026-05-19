// Declare types so TypeScript is happy

import { ConversationManager } from '@code-zoom/shared-types';

declare module 'app-host/Services' {
  export const ConversationManagerService: ConversationManager;
}
