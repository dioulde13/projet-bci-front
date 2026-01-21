import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifieOtpAfterVerifiTokenComponent } from './verifie-otp-after-verifi-token.component';

describe('VerifieOtpAfterVerifiTokenComponent', () => {
  let component: VerifieOtpAfterVerifiTokenComponent;
  let fixture: ComponentFixture<VerifieOtpAfterVerifiTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifieOtpAfterVerifiTokenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifieOtpAfterVerifiTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
