import { TestBed } from '@angular/core/testing';

import { ChatGrouperService } from './chat-grouper.service';

describe('ChatGrouperService', () => {
  let service: ChatGrouperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatGrouperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
