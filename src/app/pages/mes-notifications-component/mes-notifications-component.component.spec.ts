import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesNotificationsComponentComponent } from './mes-notifications-component.component';

describe('MesNotificationsComponentComponent', () => {
  let component: MesNotificationsComponentComponent;
  let fixture: ComponentFixture<MesNotificationsComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesNotificationsComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesNotificationsComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
