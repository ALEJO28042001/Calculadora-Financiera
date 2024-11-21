import { Component } from '@angular/core';
import { ApiService } from '../Services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  keys = [
    "CLASETARJETA",
    "CUOTASCANCELADAS",
    "ESTADOOBLIGACION",
    "LINEACREDITO",
    "MODALIDADCREDITO",
    "NOMBREENTIDAD",
    "NUMEROCUOTASPACTADAS",
    "PARTICIPACIONDEUDA",
    "PERIODICIDAD",
    "SALDOOBLIGACION",
    "TIPOCOMERCIALOBLIGACION",
    "TIPOMONEDA",
    "VALORCUOTA",
    "VALORINICIAL",
    "NUMEROOBLIGACION",
    "CALIDAD",
    "FECHATERMINACION"
  ];
  

  tes(){
    this.apiService.consultarBD().subscribe(
      {next:value=>console.log('ok'),
        error:err=>console.error(err),
    });
  }
  loadJson(){
    this.productos=this.apiService.getCifinProducts(this.cc);
  }
}
