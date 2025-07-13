import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KwaDashboardComponent } from './kwa-dashboard.component';

describe('KwaDashboardComponent', () => {
  let component: KwaDashboardComponent;
  let fixture: ComponentFixture<KwaDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KwaDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KwaDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
