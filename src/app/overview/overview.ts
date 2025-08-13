import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import {
  Activity,
  Bell,
  Briefcase,
  FileText,
  FolderOpen,
  LucideAngularModule,
  Mail,
  TrendingUp,
  User,
  Users,
} from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { DataService } from '../service/data.service';

@Component({
  selector: 'app-overview',
  imports: [LucideAngularModule, CommonModule],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview {
  userIcon = User;
  briefcaseIcon = Briefcase;
  mailIcon = Mail;
  fileTextIcon = FileText;
  bellIcon = Bell;
  folderOpenIcon = FolderOpen;
  trendingUpIcon = TrendingUp;
  usersIcon = Users;
  activityIcon = Activity;
  isLoading = false;

  constructor(private router: Router, private dataService: DataService) {}

  @Input({ required: true }) activeTab!: string;
  @Input({ required: true }) dataLengths!: {
    projectsLength: number | undefined;
    updatesLength: number | undefined;
    experienceLength: number | undefined;
  };

  @Output() activeTabChange = new EventEmitter<string>();

  onTab(tabID: string) {
    this.activeTabChange.emit(tabID);
    this.router.navigate([tabID]);
  }

  // Method to handle opening projects tab with add project intent
  onAddNewProject() {
    this.onTab('projects');
    // Trigger the project modal after navigation
    setTimeout(() => {
      try {
        this.dataService.triggerProjectModal();
      } catch (error) {
        console.error('Error triggering project modal:', error);
      }
    }, 200); // Increased timeout for better reliability
  }

  // Method to handle opening experience tab with add experience intent
  onUpdateExperience() {
    this.onTab('experience');
    // Trigger the experience modal after navigation
    setTimeout(() => {
      try {
        this.dataService.triggerExperienceModal();
      } catch (error) {
        console.error('Error triggering experience modal:', error);
      }
    }, 200); // Increased timeout for better reliability
  }

  // Method to handle opening updates tab with add update intent
  onPostUpdate() {
    this.onTab('updates');
    // Trigger the update modal after navigation
    setTimeout(() => {
      try {
        this.dataService.triggerUpdateModal();
      } catch (error) {
        console.error('Error triggering update modal:', error);
      }
    }, 200); // Increased timeout for better reliability
  }
}
