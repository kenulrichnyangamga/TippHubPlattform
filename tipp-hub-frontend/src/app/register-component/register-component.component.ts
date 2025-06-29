import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './register-component.component.html',
  styleUrl: './register-component.component.css'
})
export class RegisterComponentComponent {
    status: string = '';

  onStatusChange(value: string) {
    this.status = value;
  }
}
