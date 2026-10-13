import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalShopperChatComponent } from './personal-shopper-chat.component';

describe('PersonalShopperChatComponent', () => {
  let component: PersonalShopperChatComponent;
  let fixture: ComponentFixture<PersonalShopperChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalShopperChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalShopperChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
