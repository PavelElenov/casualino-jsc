import { TestBed } from '@angular/core/testing';

import { StorageTokenService } from './storage-token.service';

describe('StorageTokenService', () => {
  let service: StorageTokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageTokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
