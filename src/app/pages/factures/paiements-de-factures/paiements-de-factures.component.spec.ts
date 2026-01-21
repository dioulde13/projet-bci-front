import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaiementsDeFacturesComponent } from './paiements-de-factures.component';

describe('PaiementsDeFacturesComponent', () => {
  let component: PaiementsDeFacturesComponent;
  let fixture: ComponentFixture<PaiementsDeFacturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaiementsDeFacturesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaiementsDeFacturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
