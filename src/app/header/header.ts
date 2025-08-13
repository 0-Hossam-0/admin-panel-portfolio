import { Component } from '@angular/core';
import { Activity, LogOut, LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [LucideAngularModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  logOutIcon = LogOut;
  activityIcon = Activity;
  constructor(private authService: AuthService, private router: Router) {}
  onLogout() {
    this.authService.logout().subscribe({
      next: (response) => {
        if (response) {
          this.router.navigate(['./login']);
        }
      },
    });
  }
}
