import { TestBed } from '@angular/core/testing';

import { ConversationManagerService } from './conversation-manager.service';

describe('ConversationManagerService', () => {
  let service: ConversationManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConversationManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
