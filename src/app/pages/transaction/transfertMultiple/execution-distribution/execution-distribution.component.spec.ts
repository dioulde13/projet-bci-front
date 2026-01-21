import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutionDistributionComponent } from './execution-distribution.component';

describe('ExecutionDistributionComponent', () => {
  let component: ExecutionDistributionComponent;
  let fixture: ComponentFixture<ExecutionDistributionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExecutionDistributionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExecutionDistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
