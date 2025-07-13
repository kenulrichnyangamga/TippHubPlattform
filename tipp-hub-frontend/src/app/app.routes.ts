import { Routes } from '@angular/router';
import { StartseiteComponent } from './startseite/startseite.component';
import { LoginComponentComponent } from './login-component/login-component.component';
import { RegisterComponentComponent } from './register-component/register-component.component';
import { ThmcoinsManagementComponent } from './thb-dashboard/thmcoins-management/thmcoins-management.component';
import { CommunitiesManagementComponent } from './thb-dashboard/communities-management/communities-management.component';
import { PeerUsersManagementComponent } from './thb-dashboard/peer-users-management/peer-users-management.component';
import { SettingsComponent } from './thb-dashboard/settings/settings.component';
import { DashboardOverviewComponent } from './thb-dashboard/dashboard-overview/dashboard-overview.component';
import { ThbDashboardLayoutComponent } from './thb-dashboard/thb-dashboard-layout/thb-dashboard-layout.component';
import { DashboardPusComponent } from './dashboard-pus/dashboard-pus.component';
import { MeineWettenComponent } from './meine-wetten/meine-wetten.component';
import { LcbDashboardComponent } from './lcb-dashboard/lcb-dashboard.component';

export const routes: Routes = [
    { path: '', redirectTo: 'startseite', pathMatch: 'full' },
    {path : "startseite", component : StartseiteComponent},
    {path: "login-component", component : LoginComponentComponent},
    { path: 'register-component', component: RegisterComponentComponent },
    {
    path: 'thb-dashboard',
    component: ThbDashboardLayoutComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: DashboardOverviewComponent },
      { path: 'thmcoins', component: ThmcoinsManagementComponent },
      { path: 'peer-users', component: PeerUsersManagementComponent },
      { path: 'communities', component: CommunitiesManagementComponent },
      { path: 'settings', component: SettingsComponent }
       ]
    },
    {path: 'dashboard-pus', component: DashboardPusComponent},
     { path: 'meine-wetten', component: MeineWettenComponent },
     {path: 'lcb-dashboard', component: LcbDashboardComponent}
  
];

