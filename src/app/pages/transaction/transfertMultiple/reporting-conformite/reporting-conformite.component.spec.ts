import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingConformiteComponent } from './reporting-conformite.component';

describe('ReportingConformiteComponent', () => {
  let component: ReportingConformiteComponent;
  let fixture: ComponentFixture<ReportingConformiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportingConformiteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportingConformiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
