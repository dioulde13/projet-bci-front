import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificationDetailsBeneficiaireComponent } from './modification-details-beneficiaire.component';

describe('ModificationDetailsBeneficiaireComponent', () => {
  let component: ModificationDetailsBeneficiaireComponent;
  let fixture: ComponentFixture<ModificationDetailsBeneficiaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificationDetailsBeneficiaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModificationDetailsBeneficiaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
