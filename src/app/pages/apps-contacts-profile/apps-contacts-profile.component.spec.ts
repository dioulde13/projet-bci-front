import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppsContactsProfileComponent } from './apps-contacts-profile.component';

describe('AppsContactsProfileComponent', () => {
  let component: AppsContactsProfileComponent;
  let fixture: ComponentFixture<AppsContactsProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppsContactsProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppsContactsProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
