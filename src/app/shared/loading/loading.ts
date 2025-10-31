import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.html',
  styleUrl: './loading.css'
})
export class LoadingComponent {
  @Input() loading$: Observable<boolean> | undefined;
  @Input() type: 'spinner' | 'dots' | 'pulse' | 'skeleton' = 'spinner';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() overlay: boolean = false;
  @Input() message: string = '';

  constructor(private loadingService: LoadingService) {
    this.loading$ = this.loadingService.loading$;
  }

  getSizeClass(): string {
    return `loading-${this.size}`;
  }

  getTypeClass(): string {
    return `loading-${this.type}`;
  }
}