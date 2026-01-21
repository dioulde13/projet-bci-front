import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoumissionPourPaiementComponent } from './soumission-pour-paiement.component';

describe('SoumissionPourPaiementComponent', () => {
  let component: SoumissionPourPaiementComponent;
  let fixture: ComponentFixture<SoumissionPourPaiementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoumissionPourPaiementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoumissionPourPaiementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
