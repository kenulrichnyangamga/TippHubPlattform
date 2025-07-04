import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-overview.component.html',
  styleUrls: ['./dashboard-overview.component.css']
})
export class DashboardOverviewComponent {
  dashboardCards = [
    { title: 'Registrierte PUS', value: '1,250' },
    { title: 'Lokale Communities', value: '85' },
    { title: 'THMCoins im Umlauf', value: '378,400' },
    { title: 'Wettaktivitäten (24h)', value: '63' },
    { title: 'Wettaktivitäten (7 Tage)', value: '534' },
    { title: 'Umsatz (24h)', value: '1,200 €' },
    { title: 'Umsatz (7 Tage)', value: '9,850 €' }
  ];
}
