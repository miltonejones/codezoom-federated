import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupedListComponent } from './grouped-list.component';

describe('GroupedListComponent', () => {
  let component: GroupedListComponent;
  let fixture: ComponentFixture<GroupedListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupedListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupedListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
