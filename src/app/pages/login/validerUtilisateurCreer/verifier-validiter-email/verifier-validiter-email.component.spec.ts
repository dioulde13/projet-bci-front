import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifierValiditerEmailComponent } from './verifier-validiter-email.component';

describe('VerifierValiditerEmailComponent', () => {
  let component: VerifierValiditerEmailComponent;
  let fixture: ComponentFixture<VerifierValiditerEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifierValiditerEmailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifierValiditerEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
