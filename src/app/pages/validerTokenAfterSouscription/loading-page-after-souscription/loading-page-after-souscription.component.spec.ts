import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingPageAfterSouscriptionComponent } from './loading-page-after-souscription.component';

describe('LoadingPageAfterSouscriptionComponent', () => {
  let component: LoadingPageAfterSouscriptionComponent;
  let fixture: ComponentFixture<LoadingPageAfterSouscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingPageAfterSouscriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingPageAfterSouscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
