import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileLoadTypeComponent } from './file-load-type.component';

describe('FileLoadTypeComponent', () => {
  let component: FileLoadTypeComponent;
  let fixture: ComponentFixture<FileLoadTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileLoadTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileLoadTypeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
