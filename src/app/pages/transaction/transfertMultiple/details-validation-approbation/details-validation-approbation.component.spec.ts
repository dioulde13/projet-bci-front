import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsValidationApprobationComponent } from './details-validation-approbation.component';

describe('DetailsValidationApprobationComponent', () => {
  let component: DetailsValidationApprobationComponent;
  let fixture: ComponentFixture<DetailsValidationApprobationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsValidationApprobationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsValidationApprobationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
