import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThbDashboardLayoutComponent } from './thb-dashboard-layout.component';

describe('ThbDashboardLayoutComponent', () => {
  let component: ThbDashboardLayoutComponent;
  let fixture: ComponentFixture<ThbDashboardLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThbDashboardLayoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThbDashboardLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
