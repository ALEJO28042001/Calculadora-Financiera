import { Component } from '@angular/core';
import { ApiService } from '../Services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { delay } from 'rxjs';


@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.css'
})

export class PageNotFoundComponent {  
  constructor(private apiService: ApiService) {}
  productos:any;
  cc="";  
  async tes(){
    // this.apiService.getBeneficiarInfo('3167398');
    console.log("en tes: ",await this.apiService.getBeneficiarInfo('3167398'));
    
  }
  async tes2(){
    console.log("asdasdas");
    console.log("en tes: ",await this.apiService.getCifinProducts('3167398'));
  }
}
