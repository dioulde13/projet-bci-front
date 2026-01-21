import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsDuCompteComponent } from './details-du-compte.component';

describe('DetailsDuCompteComponent', () => {
  let component: DetailsDuCompteComponent;
  let fixture: ComponentFixture<DetailsDuCompteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsDuCompteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsDuCompteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
