import { TestBed } from '@angular/core/testing';

import { ChatManager } from './chat-manager';

describe('ChatManager', () => {
  let service: ChatManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
