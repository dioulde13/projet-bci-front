import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwiftDetailsModalComponent } from './swift-details-modal.component';

describe('SwiftDetailsModalComponent', () => {
  let component: SwiftDetailsModalComponent;
  let fixture: ComponentFixture<SwiftDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwiftDetailsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SwiftDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
