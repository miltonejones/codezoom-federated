import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChattypeComponent } from './chattype.component';

describe('ChattypeComponent', () => {
  let component: ChattypeComponent;
  let fixture: ComponentFixture<ChattypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChattypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChattypeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
