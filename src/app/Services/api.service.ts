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
  private urlAportes = 'https://test.beneficiar.com.co/app/ServidorSistinfeRestWebIsapi.dll/datasnapbeneficiar/beneficiar/TServeMethEstadoDeCuenta/AhorroAportes';
  private urlPoblarDataCredito = 'https://test.beneficiar.com.co/testDataCredito/ServerBecDataCreditoIsapi.dll/api/v1.0/TServMethDataCredito/ConsultaDatacredito';
  private urlJsonDataCredito = 'https://test.beneficiar.com.co/testDataCredito/ServerBecDataCreditoIsapi.dll/api/v1.0/TServMethDataCredito/ConsultaExistente';
  private urlRotativo = 'https://test.beneficiar.com.co/app/ServidorSistinfeRestWebIsapi.dll/datasnapbeneficiar/beneficiar/TServeMethEstadoDeCuenta/Rotativo';
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

    private  usernameDataCredito = 'becUsWeb';
    private  passwordDataCredito = 'zkJlSPHA8m3GDTgza774G5X89ztJShR@9Sa3A$mrumhz@anb8uhkaDLzQDJY8Q3h';
    private  credentialsDataCredito = 
        btoa(`${this.usernameDataCredito}:${this.passwordDataCredito}`); // Encode credentials to base64
    private headersDataCredito = {
    'Authorization': `Basic ${this.credentialsDataCredito}`,
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'
    };
  
  constructor(private http: HttpClient) {}
     
  async consultarDB(body: any, url: string, headers: Record<string, string>): Promise<any> {
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
        return this.consultarDB({
            "FECHA":formattedDate,
            "DOC":documento,
            "TIPODOC":"C"            
        },this.urlEstadoCuenta,this.headersBeneficiar);
    }
  async  getCreditosBeneficiar(codAsociado:string){
    return this.consultarDB({
            "FECHA":formattedDate,
            "CODAFILIADO":codAsociado   
    },this.urlCartera,this.headersBeneficiar);        
  }  
  async  getRotativosBeneficiar(codAsociado:string){
    return this.consultarDB({
            "FECHA":formattedDate,
            "CODAFILIADO":codAsociado   
    },this.urlRotativo,this.headersBeneficiar);        
  } 

  async  getLoginInfo(documento:string,clave:string){
      return this.consultarDB({
          "IP":"1.1.1",
          "NAVEGADOR":"",
          "CEDULA":documento,
          "CLAVEENC":clave,
          "ORIGEN":"2",
          "MAQUINA":""
      },this.urlLogin,this.headersBeneficiar);
  }
  async  getAhorroAportes(codAsociado:string){
    return this.consultarDB({
        "FECHA":"09/30/2024",
        "CODAFILIADO":codAsociado
    },this.urlAportes,this.headersBeneficiar);
}


async  getCifinProducts(documento:string){
  return this.consultarDB({
      "Tipo": "1",
      "Numero": documento,
      "Motivo": "24",
      "Codigo": "154",
      "FECHACONSULTA": formattedDate,
      "IdCentralCred": "1"
      },this.urlCifin,this.headersCifin).then((result) => result.result);
}


async  consultaDataCredito(documento:number,apellido:string){
  const poblarDataCredito = await this.poblarDataCredito(documento,apellido);
  if(poblarDataCredito.CodError===0){
    const data = await this.getJsonDataCredito(documento)
    return data;
  }
  return poblarDataCredito;
}
async  poblarDataCredito(documento:number,apellido:string){
  return this.consultarDB({
    "User":"92",
    "Origen":"Sistinfe",
    "TipoDoc":"1",
    "Documento":documento,
    "LastName":apellido
    },this.urlPoblarDataCredito,this.headersDataCredito).then((result) => result);
}
async  getJsonDataCredito(documento:number){
  return this.consultarDB({
      "TipoDoc": "1",
      "Documento": documento
      },this.urlJsonDataCredito,this.headersDataCredito).then((result) => result);
}
  
  async getInterestRange(){return [6,30]}
}
const currentDate = new Date();
const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based, pad with zero if needed
const day = String(currentDate.getDate()).padStart(2, '0'); // Pad day with zero if needed
const year = currentDate.getFullYear();
const formattedDate = `${month}/${day}/${year}`;

