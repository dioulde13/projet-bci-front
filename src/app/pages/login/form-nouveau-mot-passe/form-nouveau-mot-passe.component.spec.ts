import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormNouveauMotPasseComponent } from './form-nouveau-mot-passe.component';

describe('FormNouveauMotPasseComponent', () => {
  let component: FormNouveauMotPasseComponent;
  let fixture: ComponentFixture<FormNouveauMotPasseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormNouveauMotPasseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormNouveauMotPasseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
