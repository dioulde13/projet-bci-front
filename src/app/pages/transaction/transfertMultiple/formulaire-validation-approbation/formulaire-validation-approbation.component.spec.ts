import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaireValidationApprobationComponent } from './formulaire-validation-approbation.component';

describe('FormulaireValidationApprobationComponent', () => {
  let component: FormulaireValidationApprobationComponent;
  let fixture: ComponentFixture<FormulaireValidationApprobationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormulaireValidationApprobationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormulaireValidationApprobationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
