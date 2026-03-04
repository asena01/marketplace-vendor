import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './placeholder.component.html',
  styleUrl: './placeholder.component.css'
})
export class PlaceholderComponent {
  @Input() title: string = 'Coming Soon';
  @Input() description: string = 'This page is under development';
  @Input() icon: string = '🚀';
}
