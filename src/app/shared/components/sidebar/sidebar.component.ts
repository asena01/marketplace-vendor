import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: '<aside>Sidebar Placeholder</aside>',
  styles: ['aside { background: #1a1a1a; color: white; width: 250px; padding: 1rem; }']
})
export class SidebarComponent {}