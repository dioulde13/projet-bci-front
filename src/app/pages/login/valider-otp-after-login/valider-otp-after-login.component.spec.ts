import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValiderOtpAfterLoginComponent } from './valider-otp-after-login.component';

describe('ValiderOtpAfterLoginComponent', () => {
  let component: ValiderOtpAfterLoginComponent;
  let fixture: ComponentFixture<ValiderOtpAfterLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValiderOtpAfterLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValiderOtpAfterLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
