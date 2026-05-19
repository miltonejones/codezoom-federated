import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { EMPTY, Observable, Subject, throwError } from 'rxjs';
import { catchError, map, expand, reduce, tap } from 'rxjs/operators';
import type {
  ConversationRequest,
  WelcomeRequest,
  IResponse,
  TitleRequest,
} from '../shared/interfaces/interfaces';

export interface ThinkingCallback {
  message?: string;
  isStreaming?: boolean;
  progress?: number;
}
@Injectable({
  providedIn: 'root',
})
export class SendMessageService {
  private readonly API_ENDPOINT = 'https://b8j6vj57oe.execute-api.us-east-1.amazonaws.com';
  private readonly CHAT_ENDPOINT = `${this.API_ENDPOINT}/chat`;
  private readonly TITLE_ENDPOINT = `${this.API_ENDPOINT}/title`;
  private readonly WELCOME_ENDPOINT = `${this.API_ENDPOINT}/welcome`;
  private readonly CONTINUATION_PROMPT = 'Please continue from where you left off.';

  messageStreaming = new Subject<ThinkingCallback>();

  constructor(private http: HttpClient) {}

  getChatTitle(request: TitleRequest): Observable<IResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post<IResponse>(this.TITLE_ENDPOINT, request, { headers })
      .pipe(catchError(this.handleError));
  }

  getChatWelcome(request: WelcomeRequest): Observable<IResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post<IResponse>(this.WELCOME_ENDPOINT, request, { headers })
      .pipe(catchError(this.handleError));
  }

  thinkingCallback(message?: string, isStreaming?: boolean, progress?: number) {
    this.messageStreaming.next({
      message: this.convertCodeBlocksToHtml(message || ''),
      isStreaming,
      progress,
    });
  }

  /**
   * Sends a conversation request to the API and returns the response.
   * @param request The conversation request payload.
   * @returns An Observable that emits the API response.
   * @throws An error if the API returns a non-200 status code.
   */
  // sendMessage(request: ConversationRequest): Observable<IResponse> {
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //   });

  //   return this.http
  //     .post<IResponse>(this.CHAT_ENDPOINT, request, { headers })
  //     .pipe(catchError(this.handleError));
  // }

  sendMessagex(request: ConversationRequest): Observable<IResponse> {
    debugger;
    return this.sendMessageWithContinuation(request);
  }

  sendMessage(request: ConversationRequest): Observable<IResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<IResponse>(this.CHAT_ENDPOINT, request, { headers }).pipe(
      catchError((error) => {
        // Transform HTTP errors into a consistent error format
        const errorMessage = error.status
          ? `API returned ${error.status}: ${JSON.stringify(error.error)}`
          : 'Network or unknown error occurred';

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Recursively sends conversation requests until the finish_reason is "stop"
   * Uses the expand operator to handle recursive API calls
   * @param initialRequest The initial conversation request payload
   * @returns An Observable that emits all responses and then the final combined response
   */
  sendMessageWithContinuation(initialRequest: ConversationRequest): Observable<IResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<IResponse>(this.CHAT_ENDPOINT, initialRequest, { headers }).pipe(
      catchError(this.handleError),
      expand((response: IResponse) => {
        if (response.finish_reason && response.finish_reason !== 'stop') {
          const continueRequest: ConversationRequest = {
            ...initialRequest,
            message: `${response.messageContent || ''}\n\n${this.CONTINUATION_PROMPT}`,
          };

          return this.http
            .post<IResponse>(this.CHAT_ENDPOINT, continueRequest, { headers })
            .pipe(catchError(this.handleError));
        }

        // Signal completion by returning EMPTY (not an error)
        return EMPTY; // Import from 'rxjs'
      }),
      // No need for the extra catchError or reduce - just collect the final result
      reduce((acc: IResponse, current: IResponse) => {
        const combinedMessage = (acc.messageContent || '') + (current.messageContent || '');
        const response: IResponse = {
          ...current,
          messageContent: combinedMessage,
          finish_reason: current.finish_reason,
          conversationId: current.conversationId || acc.conversationId,
        };
        return this.formatResponseMessage(response);
      })
    );
  }
  /**
   * Formats a response message by converting markdown code blocks to HTML
   * @param response The API response to format
   * @returns The formatted response with HTML code blocks
   */
  private formatResponseMessage(response: IResponse): IResponse {
    if (!response.messageContent) {
      return response;
    }

    const formattedMessage = this.convertCodeBlocksToHtml(response.messageContent);

    console.log({ formattedMessage });

    return {
      ...response,
      messageContent: formattedMessage,
    };
  }

  /**
   * Converts markdown code blocks to HTML with syntax highlighting support
   * Supports both ```language and ~~~language syntax
   * @param text The text containing markdown code blocks
   * @returns The text with code blocks converted to HTML
   */
  private convertCodeBlocksToHtml(text: string): string {
    // Match code blocks with optional language specifier
    // Pattern: ```language\n code \n``` or ~~~language\n code \n~~~
    const codeBlockRegex = /(?:```|~~~)(\w*)\n([\s\S]*?)\n(?:```|~~~)/g;

    return text.replace(codeBlockRegex, (match, language, code) => {
      const lang = language || 'plaintext';
      const escapedCode = this.escapeHtml(code.trim());
      const languageClass = lang !== 'plaintext' ? `language-${lang}` : '';

      return `<pre><code class="hljs ${languageClass}">${escapedCode}</code></pre>`;
    });
  }

  /**
   * Escapes HTML special characters to prevent XSS attacks
   * @param text The text to escape
   * @returns The escaped text
   */
  private escapeHtml(text: string): string {
    const htmlEscapes: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
  }

  /**
   * Alternative method that returns formatted HTML with inline code support as well
   * @param text The text containing markdown code
   * @returns The text with all code blocks and inline code converted to HTML
   */
  private convertAllCodeToHtml(text: string): string {
    // First convert code blocks
    let formatted = this.convertCodeBlocksToHtml(text);

    // Then convert inline code `code`
    // This regex avoids matching content inside existing HTML tags
    const inlineCodeRegex = /`([^`]+)`/g;
    formatted = formatted.replace(inlineCodeRegex, (match, code) => {
      const escapedCode = this.escapeHtml(code);
      return `<code class="inline-code">${escapedCode}</code>`;
    });

    return formatted;
  }

  /**
   * Sends a conversation request with custom HTTP options (e.g., AbortSignal equivalent)
   * @param request The conversation request payload
   * @param options Optional HTTP request options including AbortSignal
   * @returns An Observable that emits the API response
   */
  sendMessageWithOptions(
    request: ConversationRequest,
    options?: { signal?: AbortSignal }
  ): Observable<IResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const httpOptions = {
      headers,
      signal: options?.signal,
    };

    return this.http
      .post<IResponse>(this.CHAT_ENDPOINT, request, httpOptions)
      .pipe(catchError(this.handleError));
  }

  /**
   * Sends a conversation request with streaming support (using fetch API for streaming)
   * @param request The conversation request payload
   * @param signal An AbortSignal to cancel the request
   * @returns A Promise that resolves to the API response
   */
  async sendMessageWithStreaming(
    request: ConversationRequest,
    signal?: AbortSignal
  ): Promise<IResponse> {
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    };

    if (signal) {
      fetchOptions.signal = signal;
    }

    try {
      const response = await fetch(this.CHAT_ENDPOINT, fetchOptions);

      if (response.status !== 200) {
        throw new Error(
          `API returned ${response.status}: ${JSON.stringify(await response.text())}`
        );
      }

      return await response.json();
    } catch (error) {
      throw this.handleFetchError(error);
    }
  }

  /**
   * Handles HTTP errors from HttpClient
   * @param error The HttpErrorResponse
   * @returns An Observable that throws an error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status !== 200) {
        errorMessage = `API returned ${error.status}: ${JSON.stringify(error.error)}`;
      } else {
        errorMessage = `Server Error: ${error.status} - ${error.message}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Handles errors from fetch API (for streaming requests)
   * @param error The error from fetch
   * @returns An Error object
   */
  private handleFetchError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unknown error occurred during fetch request');
  }

  async sendStreamingMessageWithContinuation(
    request: ConversationRequest,
    maxContinuations: number = 10,
    // thinkingCallback: (message?: string, isStreaming?: boolean, progress?: number) => void,
    signal?: AbortSignal
  ): Promise<IResponse> {
    let fullContent = '';
    let currentRequest = { ...request };
    let continuations = 0;
    let finishReason = 'length';
    let isFirstResponse = true;

    while (finishReason === 'length' && continuations < maxContinuations) {
      let response: IResponse | undefined;
      try {
        response = await this.sendMessage(currentRequest).toPromise();
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          console.warn('Message generation aborted by user.');
          this.thinkingCallback(fullContent, false, 0);
          return {
            messageContent: fullContent,
            finish_reason: 'aborted',
            isComplete: false,
          };
        }
        throw error;
      }

      if (!response || !response.messageContent) {
        throw new Error('Invalid API response: missing messageContent');
      }

      // debugger;

      let content = response.messageContent;
      finishReason = response.finish_reason;

      console.log({ finishReason, response });

      if (!isFirstResponse) {
        // 1. Handle Text Overlap (Deduplication)
        const maxOverlapCheckLength = 100;
        const overlapLength = findOverlapWithRollingHash(
          fullContent,
          content,
          maxOverlapCheckLength
        );

        if (overlapLength > 0) {
          content = content.substring(overlapLength);
        }

        // 2. SMART STITCHING: Handle broken code blocks
        // Check if fullContent currently has an odd number of code fences (meaning we are inside a block)
        const markers = fullContent.match(/```/g) || [];
        const isInsideCodeBlock = markers.length % 2 !== 0;

        if (isInsideCodeBlock) {
          // If we are waiting for code, but the model gave us a new markdown fence to start
          // (e.g. ```javascript), we must strip it to prevent breaking the renderer.
          // This regex looks for a starting fence, optional language, and a newline
          const fenceRegex = /^\s*```[\w]*\n?/;

          if (fenceRegex.test(content)) {
            content = content.replace(fenceRegex, '');
          }
        }
      }

      // Calculate progress
      const overallProgress = ((continuations + 1) / maxContinuations) * 100;
      // debugger;
      // Simulate streaming
      await this.streamContent(
        content,
        fullContent, // Pass the previous content for
        overallProgress,
        signal
      );

      fullContent += content;
      isFirstResponse = false;

      if (finishReason === 'length') {
        continuations++;
        currentRequest = {
          ...currentRequest,
          message: 'Continue', // The system prompt handles the instruction now
          conversationHistory: [
            ...currentRequest.conversationHistory,
            {
              role: 'user' as const,
              content: currentRequest.message,
              timestamp: Date.now(),
            },
            {
              role: 'assistant' as const,
              content: response.messageContent, // Keep original raw response for history context
              timestamp: Date.now(),
            },
          ],
        };
      }
    }

    // debugger;

    // Final cleanup
    this.thinkingCallback(fullContent, false);

    // Ensure final closure if absolutely necessary, but formatMessage usually handles this better
    if (fullContent.includes('```') && (fullContent.match(/```/g) || []).length % 2 !== 0) {
      fullContent += '\n```';
    }

    return {
      messageContent: fullContent,
      finish_reason: finishReason,
      isComplete: finishReason === 'stop',
    };
  }

  async streamContent(
    newContent: string,
    previousContent: string,
    baseProgress: number,
    signal?: AbortSignal // <--- NEW PARAMETER
  ): Promise<void> {
    // Calculate chunk size based on content length
    // Aim for 30-50 updates over the 10-12 second period
    const totalChunks = Math.min(Math.max(30, Math.floor(newContent.length / 20)), 50);
    const chunkSize = Math.ceil(newContent.length / totalChunks);
    const delayMs = 10000 / totalChunks; // Spread over ~10 seconds

    // const totalChunks = Math.min(
    //   Math.max(30, Math.floor(newContent.length / 20)),
    //   50
    // );
    // const chunkSize = Math.ceil(newContent.length / totalChunks);

    // // Replace the problematic line with:
    // const charactersPerSecond = 50;
    // const minDuration = 500; // Never faster than 500ms total
    // const calculatedDuration = (newContent.length / charactersPerSecond) * 1000;
    // const totalDuration = Math.max(minDuration, calculatedDuration);
    // const delayMs = totalDuration / totalChunks;

    let revealed = '';

    for (let i = 0; i < newContent.length; i += chunkSize) {
      if (signal?.aborted) {
        // <--- CHECK FOR ABORTION
        console.log('Streaming aborted during chunking.');
        return; // Stop streaming immediately
      }
      const chunk = newContent.slice(i, i + chunkSize);
      revealed += chunk;

      // Calculate progress within this streaming chunk (0-100% of current chunk)
      // const chunkProgress = (revealed.length / newContent.length) * 100;

      // Combine base progress with chunk progress for smooth progress bar
      // This creates a progress that advances smoothly within each continuation
      const totalProgress = Math.min(baseProgress, 100);

      // Call the callback with accumulated content, streaming flag, and progress
      this.thinkingCallback(previousContent + revealed, true, totalProgress);

      // Wait before revealing next chunk
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export function findOverlapWithRollingHash(
  text1: string,
  text2: string,
  maxLength: number = 100
): number {
  const base = 256; // ASCII base
  const modulus = 1000000007; // Large prime to avoid collisions

  let overlapLength = 0;
  let hash1 = 0;
  let hash2 = 0;
  let power = 1;

  const checkLength = Math.min(maxLength, text1.length, text2.length);

  for (let i = 0; i < checkLength; i++) {
    // Calculate hash for suffix of text1
    hash1 = (hash1 * base + text1.charCodeAt(text1.length - checkLength + i)) % modulus;

    // Calculate hash for prefix of text2
    hash2 = (hash2 * base + text2.charCodeAt(i)) % modulus;

    // Store power for rolling hash
    if (i > 0) {
      power = (power * base) % modulus;
    }

    // Compare hashes and verify actual content
    if (hash1 === hash2) {
      const suffix = text1.substring(
        text1.length - checkLength + i - overlapLength,
        text1.length - checkLength + i + 1
      );
      const prefix = text2.substring(0, i + 1);

      if (suffix === prefix) {
        overlapLength = i + 1;
      }
    }
  }

  return overlapLength;
}
