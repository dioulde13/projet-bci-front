import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationApprobationComponent } from './validation-approbation.component';

describe('ValidationApprobationComponent', () => {
  let component: ValidationApprobationComponent;
  let fixture: ComponentFixture<ValidationApprobationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationApprobationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidationApprobationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
