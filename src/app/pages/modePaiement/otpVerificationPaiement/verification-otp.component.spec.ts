import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificationOtpComponent } from './verification-otp.component';

describe('VerificationOtpComponent', () => {
  let component: VerificationOtpComponent;
  let fixture: ComponentFixture<VerificationOtpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificationOtpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerificationOtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
