import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailBeneficiaireComponent } from './detail-beneficiaire.component';

describe('DetailBeneficiaireComponent', () => {
  let component: DetailBeneficiaireComponent;
  let fixture: ComponentFixture<DetailBeneficiaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailBeneficiaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailBeneficiaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
