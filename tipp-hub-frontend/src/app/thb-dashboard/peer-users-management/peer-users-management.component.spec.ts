import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeerUsersManagementComponent } from './peer-users-management.component';

describe('PeerUsersManagementComponent', () => {
  let component: PeerUsersManagementComponent;
  let fixture: ComponentFixture<PeerUsersManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeerUsersManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PeerUsersManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
