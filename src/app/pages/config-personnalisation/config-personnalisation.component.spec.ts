import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigPersonnalisationComponent } from './config-personnalisation.component';

describe('ConfigPersonnalisationComponent', () => {
  let component: ConfigPersonnalisationComponent;
  let fixture: ComponentFixture<ConfigPersonnalisationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigPersonnalisationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigPersonnalisationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
