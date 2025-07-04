import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunitiesManagementComponent } from './communities-management.component';

describe('CommunitiesManagementComponent', () => {
  let component: CommunitiesManagementComponent;
  let fixture: ComponentFixture<CommunitiesManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunitiesManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CommunitiesManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
