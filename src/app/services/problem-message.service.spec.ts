import { TestBed } from '@angular/core/testing';
import { ProblemMessageService } from './problem-message.service';

describe('ProblemMessageService', () => {
  let service: ProblemMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProblemMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
