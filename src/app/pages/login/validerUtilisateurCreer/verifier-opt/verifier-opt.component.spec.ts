import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifierOptComponent } from './verifier-opt.component';

describe('VerifierOptComponent', () => {
  let component: VerifierOptComponent;
  let fixture: ComponentFixture<VerifierOptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifierOptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifierOptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
