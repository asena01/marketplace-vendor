import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginOverlayComponent } from './components/auth-overlay/login-overlay.component';
import { SignupOverlayComponent } from './components/auth-overlay/signup-overlay.component';
import { AuthModalService } from './services/auth-modal.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    LoginOverlayComponent,
    SignupOverlayComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(public authModal: AuthModalService) {}
}
