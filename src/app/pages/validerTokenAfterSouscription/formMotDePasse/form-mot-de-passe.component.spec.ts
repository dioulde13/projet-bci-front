import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormMotDePasseComponent } from './form-mot-de-passe.component';

describe('FormMotDePasseComponent', () => {
  let component: FormMotDePasseComponent;
  let fixture: ComponentFixture<FormMotDePasseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormMotDePasseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormMotDePasseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
