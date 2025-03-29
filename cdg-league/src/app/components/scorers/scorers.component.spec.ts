import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorersComponent } from './scorers.component';

describe('ScorersComponent', () => {
  let component: ScorersComponent;
  let fixture: ComponentFixture<ScorersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
