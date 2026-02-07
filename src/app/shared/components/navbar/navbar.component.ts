import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: '<nav>Navbar Placeholder</nav>',
  styles: ['nav { background: white; padding: 1rem; border-bottom: 1px solid #ddd; }']
})
export class NavbarComponent {}