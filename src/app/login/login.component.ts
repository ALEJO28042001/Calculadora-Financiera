import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  
  cedula: string = '';
  password: string = '';

  onSubmit() {
    if (this.cedula && this.password) {
      console.log('Login Details:', { email: this.cedula, password: this.password });
      // Handle login logic here (e.g., call a service to authenticate)
    }
  }
}
