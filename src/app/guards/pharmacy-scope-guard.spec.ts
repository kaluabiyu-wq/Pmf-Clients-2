import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { pharmacyScopeGuard } from './pharmacy-scope-guard';

describe('pharmacyScopeGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => pharmacyScopeGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
