import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecapTransfertEntreCompteComponent } from './recap-transfert-entre-compte.component';

describe('RecapTransfertEntreCompteComponent', () => {
  let component: RecapTransfertEntreCompteComponent;
  let fixture: ComponentFixture<RecapTransfertEntreCompteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecapTransfertEntreCompteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecapTransfertEntreCompteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
