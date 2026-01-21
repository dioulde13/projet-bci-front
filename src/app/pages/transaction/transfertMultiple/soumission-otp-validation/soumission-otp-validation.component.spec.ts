import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoumissionOtpValidationComponent } from './soumission-otp-validation.component';

describe('SoumissionOtpValidationComponent', () => {
  let component: SoumissionOtpValidationComponent;
  let fixture: ComponentFixture<SoumissionOtpValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoumissionOtpValidationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoumissionOtpValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
