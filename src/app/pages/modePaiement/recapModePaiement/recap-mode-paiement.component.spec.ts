import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecapModePaiementComponent } from './recap-mode-paiement.component';

describe('RecapModePaiementComponent', () => {
  let component: RecapModePaiementComponent;
  let fixture: ComponentFixture<RecapModePaiementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecapModePaiementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecapModePaiementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
