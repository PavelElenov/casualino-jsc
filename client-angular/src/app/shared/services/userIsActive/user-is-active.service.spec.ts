import { TestBed } from '@angular/core/testing';

import { UserIsActiveService } from './user-is-active.service';

describe('UserIsActiveService', () => {
  let service: UserIsActiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserIsActiveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
