import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeChequierFormulaireComponent } from './demande-chequier-formulaire.component';

describe('DemandeChequierFormulaireComponent', () => {
  let component: DemandeChequierFormulaireComponent;
  let fixture: ComponentFixture<DemandeChequierFormulaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandeChequierFormulaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemandeChequierFormulaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
