import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculPaieComponent } from './calcul-paie.component';

describe('CalculPaieComponent', () => {
  let component: CalculPaieComponent;
  let fixture: ComponentFixture<CalculPaieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculPaieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculPaieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
