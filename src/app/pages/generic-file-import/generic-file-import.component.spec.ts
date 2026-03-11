import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericFileImportComponent } from './generic-file-import.component';

describe('GenericFileImportComponent', () => {
  let component: GenericFileImportComponent;
  let fixture: ComponentFixture<GenericFileImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericFileImportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericFileImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
