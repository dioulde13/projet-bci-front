import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualiserUnReleveCompteCourantEpargneComponent } from './visualiser-un-releve-compte-courant-epargne.component';

describe('VisualiserUnReleveCompteCourantEpargneComponent', () => {
  let component: VisualiserUnReleveCompteCourantEpargneComponent;
  let fixture: ComponentFixture<VisualiserUnReleveCompteCourantEpargneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualiserUnReleveCompteCourantEpargneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualiserUnReleveCompteCourantEpargneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
