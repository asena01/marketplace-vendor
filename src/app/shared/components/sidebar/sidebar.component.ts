import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  menuItems = [
    { icon: '📊', label: 'Dashboard', route: '/dashboard' },
    { icon: '📦', label: 'Products', route: '/products' },
    { icon: '📋', label: 'Orders', route: '/orders' },
    { icon: '🤝', label: 'Affiliates', route: '/affiliates' },
    { icon: '📈', label: 'Analytics', route: '/analytics' },
    { icon: '⚙️', label: 'Settings', route: '/settings' }
  ];

  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}
