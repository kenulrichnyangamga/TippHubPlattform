import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPusComponent } from './dashboard-pus.component';

describe('DashboardPusComponent', () => {
  let component: DashboardPusComponent;
  let fixture: ComponentFixture<DashboardPusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPusComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardPusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
