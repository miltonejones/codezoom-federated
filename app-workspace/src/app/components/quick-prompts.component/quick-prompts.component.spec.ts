import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickPromptsComponent } from './quick-prompts.component';

describe('QuickPromptsComponent', () => {
  let component: QuickPromptsComponent;
  let fixture: ComponentFixture<QuickPromptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickPromptsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickPromptsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
