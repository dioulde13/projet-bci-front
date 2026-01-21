import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompteCourantEpargneComponent } from './compte-courant-epargne.component';

describe('CompteCourantEpargneComponent', () => {
  let component: CompteCourantEpargneComponent;
  let fixture: ComponentFixture<CompteCourantEpargneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompteCourantEpargneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompteCourantEpargneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
