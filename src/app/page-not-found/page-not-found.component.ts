import { CalculosService } from './../Services/calculos.service';
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
  constructor(private apiService: ApiService, private calculosService: CalculosService) {}
  productos:any;
  cc="";


  async tes(){
      this.calculosService.generatePDF(jsonData);
  }
  async tes2(){
    let a =await  this.apiService.guardarAsesoria(jsonData2);
    console.log(a);
  }

  showAlertDialog() {
    alert("This is an alert dialog box!");
  }

  showConfirmDialog() {
    const result = confirm("Are you sure you want to proceed?");
    if (result) {
      // User clicked "OK"
      console.log("User confirmed.");
      // Perform action here...
    } else {
      // User clicked "Cancel"
      console.log("User cancelled.");
    }
  }

  showPromptDialog() {

  }


}



const jsonData={ "Datos del funcionario": [ { "Documento": "1.030.686.968", "Nombre": "PRUEBAS PRUEBAS PRUEBAS PRUEBAS" } ], "DatosAsociado": [ { "TipoDoc": "C", "Documento": "3.167.398", "Calificacion": "A", "SaldoAportes": "61,368,343", "AutorizacionConsulta": { "autorizacion": "any" } } ], "Datos de la solicitud": [ { "Linea": "CONSUMO", "CodLin": "15", "Monto": "379,709,037", "ValorRequerido": "300,000,000", "Plazo": 60, "Tasa": 13, "ValorCuota": "8,639,547", "Aportes": "581,280", "Ingresos": "9,688,000", "Apalancamiento": "14,573,464", "CodGarantia": "PS" } ], "Productos a recoger": [ { "Nombre": "BENEFICIAR CREDITO ROTATIVO 16406 SALDO:$8,900,076", "Tipo": "Consumo", "SaldoActual": "8,900,076", "Plazo": "36", "PagoMensual": "335,311", "Tasa": "21.00" }, { "Nombre": "BENEFICIAR INMOBILIARIO 810249 SALDO:$68,278,349", "Tipo": "Consumo", "SaldoActual": "68,278,349", "Plazo": "67", "PagoMensual": "1,431,395", "Tasa": "12.00" }, { "Nombre": "BENEFICIAR CONSUMO 864878 SALDO:$2,088,259", "Tipo": "Consumo", "SaldoActual": "2,088,259", "Plazo": "3", "PagoMensual": "711,219", "Tasa": "13.00" }, { "Nombre": "BENEFICIAR SERVICIOS 873170 SALDO:$399,353", "Tipo": "Consumo", "SaldoActual": "399,353", "Plazo": "4", "PagoMensual": "103,399", "Tasa": "17.00" }, { "Nombre": "CLARO SERV MOV CONSUMO .60001042 SALDO $:43,000", "Tipo": "Consumo", "SaldoActual": "43,000", "Plazo": "0", "PagoMensual": "0", "Tasa": "0.00" } ] };
const jsonData2={
  "DatosFuncionario":[
     {
        "Documento":"1030686968",
        "Nombre":"PRUEBAS PRUEBAS PRUEBAS PRUEBAS"
     }
  ],
  "DatosAsociado":[
     {
        "TipoDoc":"C",
        "Documento":"79749433",
        "Calificacion":"A",
        "SaldoAportes":"50,193,029",
        "AutorizacionConsulta":{
           "autorizacion":"any",
           "Fecha":"17/2/2025",
           "Hora":"15:38:50"
        }
     }
  ],
  "DatosSolicitud":[
     {
        "Linea":"Consumo",
        "Monto":0,
        "ValorRequerido":0,
        "Plazo":0,
        "Tasa":13,
        "ValorCuota":0,
        "ValorCuotaAportes":"369,540",
        "Ingresos":"6,159,000"
     }
  ],
  "ProductosRecoger":[
     {
        "Nombre":"BENEFICIAR CREDITO ROTATIVO 14393 SALDO:$0",
        "Tipo":"Consumo",
        "SaldoActual":"0",
        "Plazo":"36",
        "PagoMensual":"0",
        "Tasa":"21"
     }
  ]
};
