import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeineWettenComponent } from './meine-wetten.component';

describe('MeineWettenComponent', () => {
  let component: MeineWettenComponent;
  let fixture: ComponentFixture<MeineWettenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeineWettenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MeineWettenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
