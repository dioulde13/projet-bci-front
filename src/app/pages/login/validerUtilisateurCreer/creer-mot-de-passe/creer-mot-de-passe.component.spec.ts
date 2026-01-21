import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreerMotDePasseComponent } from './creer-mot-de-passe.component';

describe('CreerMotDePasseComponent', () => {
  let component: CreerMotDePasseComponent;
  let fixture: ComponentFixture<CreerMotDePasseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreerMotDePasseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreerMotDePasseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
