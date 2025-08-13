import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PersonalInfo } from '../persnoal-info/personal-info';
import { ProjectsManager } from '../projects-manager/projects-manager';
import { ContactInfo } from '../contact-info/contact-info';
import { ExperienceManager } from '../experience-manager/experience-manager';
import { UpdatesManager } from '../updates-manager/updates-manager';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../service/auth.service';
import { Router, RouterLink } from '@angular/router';
import { Header } from '../header/header';
import { Tabs } from '../tabs/tabs';
import { Loading } from '../loading/loading';
import { DataService, IData } from '../service/data.service';
import { Overview } from '../overview/overview';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    LucideAngularModule,
    PersonalInfo,
    ProjectsManager,
    ContactInfo,
    ExperienceManager,
    UpdatesManager,
    Overview,
    Header,
    Tabs,
    Loading,
    RouterLink,
  ],
  providers: [AuthService],
  standalone: true,
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard implements OnInit {
  isLoading = true;
  activeTab = 'overview';

  data: IData | null = null;

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.dataService.getAllData().subscribe({
      next: (result) => {
        this.data = result;
        this.isLoading = false;
        console.log('result', result);
      },
      error: (error) => {
        console.error('Failed to load data:', error);
        this.isLoading = false;
      },
    });
  }

  onActiveTabChange(newTab: string) {
    this.activeTab = newTab;
  }
}
