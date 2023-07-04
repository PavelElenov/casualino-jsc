import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentChatComponent } from './current-chat.component';

describe('CurrentChatComponent', () => {
  let component: CurrentChatComponent;
  let fixture: ComponentFixture<CurrentChatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CurrentChatComponent]
    });
    fixture = TestBed.createComponent(CurrentChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
