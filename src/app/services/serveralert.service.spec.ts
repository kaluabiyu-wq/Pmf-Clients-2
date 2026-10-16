import { TestBed } from '@angular/core/testing';
import { ServeralertService } from './serveralert.service';

describe('ServeralertService', () => {
  let service: ServeralertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServeralertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
