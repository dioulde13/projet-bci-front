import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierBeneficiaireComponent } from './modifier-beneficiaire.component';

describe('ModifierBeneficiaireComponent', () => {
  let component: ModifierBeneficiaireComponent;
  let fixture: ComponentFixture<ModifierBeneficiaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifierBeneficiaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifierBeneficiaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
