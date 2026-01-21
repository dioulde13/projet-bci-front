import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargementDeFichierComponent } from './chargement-de-fichier.component';

describe('ChargementDeFichierComponent', () => {
  let component: ChargementDeFichierComponent;
  let fixture: ComponentFixture<ChargementDeFichierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChargementDeFichierComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChargementDeFichierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
