import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private urlCifin = 'https://test.beneficiar.com.co/TestConsultaCifin/ConsultaCifinIsapi.dll/api/rest/TServerMethodCifin/ConsultarBD';
  private urlEstadoCuenta = 'https://test.beneficiar.com.co/app/ServidorSistinfeRestWebIsapi.dll/datasnapbeneficiar/beneficiar/TServeMethEstadoDeCuenta/ConsultaEstadoDeCuenta'
  private urlCartera = 'https://test.beneficiar.com.co/app/ServidorSistinfeRestWebIsapi.dll/datasnapbeneficiar/beneficiar/TServeMethEstadoDeCuenta/Cartera';
  private urlLogin = 'https://test.beneficiar.com.co/app/ServidorSistinfeRestWebIsapi.dll/datasnapbeneficiar/beneficiar/TServeMethIngresoAsociado/IngresoEstadoCuentaAfiliado';


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
     
    async consultarBD(body: any, url: string, headers: Record<string, string>): Promise<any> {
        try {
          const resp = await fetch(url, {
            method: "POST",
            body: JSON.stringify(body),
            headers: headers})
          .then((response) => response.json())
           ;      
          
          return resp;
        } catch (error) {
        }
    }     
    
  async getBeneficiarInfo(documento:string){
        return this.consultarBD({
            "FECHA":formattedDate,
            "DOC":documento,
            "TIPODOC":"C"            
        },this.urlEstadoCuenta,this.headersBeneficiar);
    }
  async  getBeneficiarProducts(codAsociado:string){
        return this.consultarBD({
                "FECHA":formattedDate,
                "CODAFILIADO":codAsociado   
        },this.urlCartera,this.headersBeneficiar);        
    }  
  async  getCifinProducts(documento:string){
        return this.consultarBD({
            "Tipo": "1",
            "Numero": documento,
            "Motivo": "24",
            "Codigo": "154",
            "FECHACONSULTA": formattedDate,
            "IdCentralCred": "1"
            },this.urlCifin,this.headersCifin).then((result) => result.result);
    }
  async  getLoginInfo(documento:string,clave:string){
        return this.consultarBD({
            "IP":"1.1.1",
            "NAVEGADOR":"",
            "CEDULA":documento,
            "CLAVEENC":clave,
            "ORIGEN":"2",
            "MAQUINA":""
        },this.urlLogin,this.headersBeneficiar);
    }
  async getInterestRange(){return [6,30]}
}
const currentDate = new Date();
const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based, pad with zero if needed
const day = String(currentDate.getDate()).padStart(2, '0'); // Pad day with zero if needed
const year = currentDate.getFullYear();
const formattedDate = `${month}/${day}/${year}`;

