import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiaireEnAttenteComponent } from './beneficiaire-en-attente.component';

describe('BeneficiaireEnAttenteComponent', () => {
  let component: BeneficiaireEnAttenteComponent;
  let fixture: ComponentFixture<BeneficiaireEnAttenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeneficiaireEnAttenteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeneficiaireEnAttenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
