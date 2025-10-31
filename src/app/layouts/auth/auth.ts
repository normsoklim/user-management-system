import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet
  ],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class AuthLayoutComponent {
  currentYear: number = new Date().getFullYear();
}