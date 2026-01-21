import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypePaiementComponent } from './type-paiement.component';

describe('TypePaiementComponent', () => {
  let component: TypePaiementComponent;
  let fixture: ComponentFixture<TypePaiementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypePaiementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypePaiementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
