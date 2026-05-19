import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, map, expand, reduce, tap } from 'rxjs/operators';
import type {
  ConversationRequest,
  WelcomeRequest,
  IResponse,
  TitleRequest,
} from '@code-zoom/shared-types';
@Injectable({
  providedIn: 'root',
})
export class SendMessageService {
  private readonly API_ENDPOINT = 'https://b8j6vj57oe.execute-api.us-east-1.amazonaws.com';
  private readonly CHAT_ENDPOINT = `${this.API_ENDPOINT}/chat`;
  private readonly TITLE_ENDPOINT = `${this.API_ENDPOINT}/title`;
  private readonly CONTINUATION_PROMPT = 'Please continue from where you left off.';

  constructor(private http: HttpClient) {}

  getWelcome(request: TitleRequest): Observable<IResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post<IResponse>(this.TITLE_ENDPOINT, request, { headers })
      .pipe(catchError(this.handleError));
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

  sendMessage(request: ConversationRequest): Observable<IResponse> {
    debugger;
    return this.sendMessageWithContinuation(request);
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
}
