import { Routes } from '@angular/router';
import { Login } from './login/login';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { isAuthenticatedGuard, isLoggedOutGuard } from './user-auth-guard';
import { ProjectsManager } from './projects-manager/projects-manager';
import { PersonalInfo } from './persnoal-info/personal-info';
import { ExperienceManager } from './experience-manager/experience-manager';
import { ContactInfo } from './contact-info/contact-info';
import { UpdatesManager } from './updates-manager/updates-manager';
import { Overview } from './overview/overview';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    canActivate: [isLoggedOutGuard],
  },
  {
    path: '',
    component: AdminDashboard,
    canActivate: [isAuthenticatedGuard],
    children: [
      { path: 'overview', component: Overview },
      { path: 'projects', component: ProjectsManager },
      { path: 'personal', component: PersonalInfo },
      { path: 'experience', component: ExperienceManager },
      { path: 'contact', component: ContactInfo },
      { path: 'updates', component: UpdatesManager },
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'overview' },
];
