import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReunitialiserPasseWordComponent } from './reunitialiser-passe-word.component';

describe('ReunitialiserPasseWordComponent', () => {
  let component: ReunitialiserPasseWordComponent;
  let fixture: ComponentFixture<ReunitialiserPasseWordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReunitialiserPasseWordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReunitialiserPasseWordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
