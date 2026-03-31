import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeChequierListeComponent } from './demande-chequier-liste.component';

describe('DemandeChequierListeComponent', () => {
  let component: DemandeChequierListeComponent;
  let fixture: ComponentFixture<DemandeChequierListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandeChequierListeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemandeChequierListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
