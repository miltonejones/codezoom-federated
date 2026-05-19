import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LangtypeComponent } from './langtype.component';

describe('LangtypeComponent', () => {
  let component: LangtypeComponent;
  let fixture: ComponentFixture<LangtypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LangtypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LangtypeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
