import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-thb-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './thb-dashboard-layout.component.html',
  styleUrl: './thb-dashboard-layout.component.css'
})
export class ThbDashboardLayoutComponent {

}
