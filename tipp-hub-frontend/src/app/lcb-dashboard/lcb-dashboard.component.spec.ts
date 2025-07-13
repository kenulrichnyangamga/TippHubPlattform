import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LcbDashboardComponent } from './lcb-dashboard.component';

describe('LcbDashboardComponent', () => {
  let component: LcbDashboardComponent;
  let fixture: ComponentFixture<LcbDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LcbDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LcbDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
