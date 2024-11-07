import { Component, OnInit } from '@angular/core';
import { ApiService } from '../Services/api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-test-api',
  standalone: true,
  imports: [],
  templateUrl: './test-api.component.html',
  styleUrl: './test-api.component.css'
})
export class TestApiComponent{

  constructor(private apiService: ApiService) {}

  
  tes(){

   fetch('https://test.beneficiar.com.co/TestConsultaCifin/ConsultaCifinIsapi.dll/api/rest/TServerMethodCifin/ConsultarBD');
  }
}
