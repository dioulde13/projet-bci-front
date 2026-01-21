import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyemailAfterchangePageComponent } from './verifyemail-afterchange-page.component';

describe('VerifyemailAfterchangePageComponent', () => {
  let component: VerifyemailAfterchangePageComponent;
  let fixture: ComponentFixture<VerifyemailAfterchangePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyemailAfterchangePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyemailAfterchangePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
