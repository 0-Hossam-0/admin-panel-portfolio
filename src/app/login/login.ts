import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LucideAngularModule, User, Lock, Sparkles } from 'lucide-angular';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  providers: [AuthService],
})
export class Login {

  loginForm: FormGroup;
  error = '';
  isLoading = false;

  lockIcon = Lock;
  userIcon = User;
  sparklesIcon = Sparkles;

  constructor(
    private fb: FormBuilder,
    private http: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.error = '';

    const { username, password } = this.loginForm.value;

    this.http.login(username, password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/overview'])
      },
      error: () => {
        this.isLoading = false;
        this.error = 'Invalid username or password';
      },
    });
  }
}
