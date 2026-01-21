import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpAfterChangeInfoComponent } from './otp-after-change-info.component';

describe('OtpAfterChangeInfoComponent', () => {
  let component: OtpAfterChangeInfoComponent;
  let fixture: ComponentFixture<OtpAfterChangeInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtpAfterChangeInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtpAfterChangeInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
