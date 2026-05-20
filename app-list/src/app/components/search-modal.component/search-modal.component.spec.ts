import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchModalComponent } from './search-modal.component';

describe('SearchModalComponent', () => {
  let component: SearchModalComponent;
  let fixture: ComponentFixture<SearchModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
