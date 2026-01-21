import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsBeneficiaireComponent } from './details-beneficiaire.component';

describe('DetailsBeneficiaireComponent', () => {
  let component: DetailsBeneficiaireComponent;
  let fixture: ComponentFixture<DetailsBeneficiaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsBeneficiaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsBeneficiaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
