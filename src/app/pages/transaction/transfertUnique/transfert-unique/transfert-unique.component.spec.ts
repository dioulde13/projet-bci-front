import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransfertUniqueComponent } from './transfert-unique.component';

describe('TransfertUniqueComponent', () => {
  let component: TransfertUniqueComponent;
  let fixture: ComponentFixture<TransfertUniqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransfertUniqueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransfertUniqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
