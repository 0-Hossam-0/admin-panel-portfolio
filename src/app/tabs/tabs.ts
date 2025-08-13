import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import {
  Activity,
  Bell,
  Briefcase,
  FolderOpen,
  LucideAngularModule,
  Mail,
  User,
} from 'lucide-angular';

@Component({
  selector: 'app-tabs',
  imports: [LucideAngularModule, CommonModule],
  templateUrl: './tabs.html',
  styleUrl: './tabs.css',
})
export class Tabs {
  constructor(private router: Router) {}
  @Input({ required: true }) activeTab!: string;
  @Output() activeTabChange = new EventEmitter<string>();
  tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'updates', label: 'Updates', icon: Bell },
  ];

  onTab(tabID: string) {
    this.activeTabChange.emit(tabID);
    this.router.navigate([tabID]);
  }

  getTabClass(tabId: string): string {
    const baseClass =
      'flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300';

    if (this.activeTab === tabId) {
      return `${baseClass} bg-white shadow-md text-gray-900 transform scale-105`;
    }

    return `${baseClass} text-gray-600 hover:text-gray-900 hover:bg-white/50`;
  }
}
