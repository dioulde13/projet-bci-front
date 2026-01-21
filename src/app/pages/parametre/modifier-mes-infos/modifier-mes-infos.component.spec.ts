import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierMesInfosComponent } from './modifier-mes-infos.component';

describe('ModifierMesInfosComponent', () => {
  let component: ModifierMesInfosComponent;
  let fixture: ComponentFixture<ModifierMesInfosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifierMesInfosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifierMesInfosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
