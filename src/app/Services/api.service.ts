import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { delay, Observable } from 'rxjs';
import { json } from 'express';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private urlCifin = 'https://test.beneficiar.com.co/TestConsultaCifin/ConsultaCifinIsapi.dll/api/rest/TServerMethodCifin/ConsultarBD';
  private urlEstadoCuenta = 'https://test.beneficiar.com.co/app/ServidorSistinfeRestWebIsapi.dll/datasnapbeneficiar/beneficiar/TServeMethEstadoDeCuenta/ConsultaEstadoDeCuenta'
  private urlCartera = 'https://test.beneficiar.com.co/app/ServidorSistinfeRestWebIsapi.dll/datasnapbeneficiar/beneficiar/TServeMethEstadoDeCuenta/Cartera';
  private urlLogin = 'https://test.beneficiar.com.co/app/ServidorSistinfeRestWebIsapi.dll/datasnapbeneficiar/beneficiar/TServeMethIngresoAsociado/IngresoEstadoCuentaAfiliado';
  private resultCifin:any;
  private resultBeneficiarInfo:any;
  private resultBeneficiarCartera:any;
  private resultBeneficiarLogin:any;

  // Basic auth username and password
  private  usernameCifin = 'ServerAdmin';
  private  passwordCifin = 'B3N3F1C14R_R3ST';
  private  credentialsCifin = btoa(`${this.usernameCifin}:${this.passwordCifin}`); // Encode credentials to base64
  private headersCifin = {
        'Authorization': `Basic ${this.credentialsCifin}`,
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'
  };

    private  usernameBeneficiar = 'BecRest001';
    private  passwordBeneficiar = '#BnF_x001';
    private  credentialsBeneficiar = 
        btoa(`${this.usernameBeneficiar}:${this.passwordBeneficiar}`); // Encode credentials to base64
    private headersBeneficiar = {
    'Authorization': `Basic ${this.credentialsBeneficiar}`,
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'
    };
  
  constructor(private http: HttpClient) {}

    getResultBeneficiarInfo(){return this.resultBeneficiarInfo}
     
    async consultarBD(body: any, url: string, headers: Record<string, string>): Promise<any> {
        try {
          const resp = await fetch(url, {
            method: "POST",
            body: JSON.stringify(body),
            headers: headers})
          .then((response) => response.json())
          .then((r)=>console.log(r))
           ;      
          
          console.log("try: ",resp);
          return resp;
        } catch (error) {
          console.error("Error in consultarBD:", error);
          throw error; // Re-throw the error to handle it elsewhere
        }
      }
      
      
    
    getBeneficiarInfo(documento:string){
        return this.consultarBD({
            "FECHA":formattedDate,
            "DOC":documento,
            "TIPODOC":"C"            
        },this.urlEstadoCuenta,this.headersBeneficiar).then((result) => result.result[0]);
    }
    getBeneficiarProducts(codAsociado:string){
        return this.consultarBD({
                "FECHA":formattedDate,
                "CODAFILIADO":codAsociado   
        },this.urlCartera,this.headersBeneficiar);        
    }  
    getCifinProducts(documento:string){
        return this.consultarBD({
            "Tipo": "1",
            "Numero": documento,
            "Motivo": "24",
            "Codigo": "154",
            "FECHACONSULTA": formattedDate,
            "IdCentralCred": "1"
            },this.urlCifin,this.headersCifin).then((result) => result.result);
    }
    getLoginInfo(documento:string,clave:string){
        return this.consultarBD({
            "IP":"1.1.1",
            "NAVEGADOR":"",
            "CEDULA":documento,
            "CLAVEENC":clave,
            "ORIGEN":"2",
            "MAQUINA":""
        },this.urlLogin,this.headersBeneficiar);
    }
}
const currentDate = new Date();
const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based, pad with zero if needed
const day = String(currentDate.getDate()).padStart(2, '0'); // Pad day with zero if needed
const year = currentDate.getFullYear();
const formattedDate = `${month}/${day}/${year}`;

