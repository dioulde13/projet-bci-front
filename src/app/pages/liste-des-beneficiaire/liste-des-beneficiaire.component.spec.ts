import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeDesBeneficiaireComponent } from './liste-des-beneficiaire.component';

describe('ListeDesBeneficiaireComponent', () => {
  let component: ListeDesBeneficiaireComponent;
  let fixture: ComponentFixture<ListeDesBeneficiaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeDesBeneficiaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeDesBeneficiaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
