import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriqueTransactionComponent } from './historique-transaction.component';

describe('HistoriqueTransactionComponent', () => {
  let component: HistoriqueTransactionComponent;
  let fixture: ComponentFixture<HistoriqueTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoriqueTransactionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoriqueTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
