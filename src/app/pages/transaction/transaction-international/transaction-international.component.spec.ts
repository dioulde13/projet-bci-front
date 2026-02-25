import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionInternationalComponent } from './transaction-international.component';

describe('TransactionInternationalComponent', () => {
  let component: TransactionInternationalComponent;
  let fixture: ComponentFixture<TransactionInternationalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionInternationalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionInternationalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
