import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThmcoinsManagementComponent } from './thmcoins-management.component';

describe('ThmcoinsManagementComponent', () => {
  let component: ThmcoinsManagementComponent;
  let fixture: ComponentFixture<ThmcoinsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThmcoinsManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThmcoinsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
