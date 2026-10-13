import { TestBed } from '@angular/core/testing';

import { PersonalShopperService } from './personal-shopper.service';

describe('PersonalShopperService', () => {
  let service: PersonalShopperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonalShopperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
