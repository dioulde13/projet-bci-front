import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreparationPaieComponent } from './preparation-paie.component';

describe('PreparationPaieComponent', () => {
  let component: PreparationPaieComponent;
  let fixture: ComponentFixture<PreparationPaieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreparationPaieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreparationPaieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
