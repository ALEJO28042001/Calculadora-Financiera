import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

import { HttpClient } from '@angular/common/http';

@Injectable({providedIn: 'root'})

export class DataService {
  constructor(private apiService: ApiService, private http: HttpClient) {}  
  productList: Array<{ [key: string]: string }> = [];
  nombreCliente:string='';
  apalancamiento=0;
  documento='';
  nombreFuncionario="";
  access=true;

  getNombreCliente(){return this.nombreCliente;}
  getAccess(){return this.access;}  
  getNombreFuncionario(){
    return this.nombreCliente;
  }
  getApalancamiento(){
    return this.apalancamiento;
  }
  getLogin(documento:string,clave:string){
    const validacionFuncionario = this.apiService.getLoginInfo(documento,clave);
    if(validacionFuncionario){
      this.nombreFuncionario=validacionFuncionario["NOMBRES"]+" "+validacionFuncionario["APELLIDOS"];
      this.access=true;
    }
    else
      console.log("Información invalida");
  }
  setData(data:Array<{ [key: string]: string }>){
    this.productList=data;
    }
  getData() {
    return this.productList;
    }
  addProduct(product: {[key: string]:string}){
    this.productList.push(product);
    }
  updateProduct(product :{[key: string]:string},index:number){
    this.productList[index]=product;
  }
  deleteProduct(index:number){
    this.productList.slice(index,1);
  }
  pullData(documento:string){
    //Se consulta la info del asociado
    const basicClientInfo=this.apiService.getBeneficiarInfo(documento);
    this.nombreCliente=basicClientInfo.Nombre;
    var cifinProducts=this.apiService.getCifinProducts(documento);

    cifinProducts=cifinProducts.filter((item: any) => 
      item["CALIDAD"] === 'PRIN'
    && item["NOMBREENTIDAD"] != 'BENEFICIAR- COOP. DE AHORRO Y');

    const beneficiarProducts=this.apiService.getBeneficiarProducts(basicClientInfo.CodAsociado);

    this.apalancamiento=(Number(basicClientInfo.Registros[0].VALORCONSOLIDADO)+
            Number(basicClientInfo.Registros[1].VALORCONSOLIDADO));  

    this.setData(this.convertData(cifinProducts,cifinKeys));
    beneficiarProducts.map((item: any) => this.addProduct(this.renameKeys(item, beneficiarKeys)));  
    }
  convertData(registros:any ,newKeysMapping:any){
    return registros.map((item: any) => this.renameKeys(item, newKeysMapping));
    }
  renameKeys(obj: any, keyMap: { [oldKey: string]: string }) {
      const renamedObj: any = {};
      for (const key in keyMap) {      
        if (key === "Nombre Producto") {
          renamedObj[key] = (obj["TIPOENTIDAD"] || "Beneficiar" )+ 
          " "+obj[keyMap[key]] + " " + (obj["NUMEROOBLIGACION"]||obj["PAGARE"]);
        } 
        else if (key === "Plazo Actual") {
          renamedObj[key] = String(obj[keyMap[key]] - (obj["CUOTASCANCELADAS"] || obj["ALTURA"]));
        }
        else if (obj[keyMap[key]] === "VALORCUOTA" || keyMap[key] === "SALDOOBLIGACION") {
          renamedObj[key] = obj[keyMap[key]] * 1000;
        } 
        else if (key === "Tarjeta")
          renamedObj[key] = String(obj[keyMap[key]] === 'ROTA' ||
        obj[keyMap[key]] === 'TCR' || obj[keyMap[key]] === 'ROTATIVO');        
        // Default case for all other keys
        else {
        renamedObj[key]=obj[keyMap[key]];
        }
      } 
      renamedObj["Refinanciamiento"]= "true";
      renamedObj["Tasa Entidad"]= "";
      renamedObj["Tasa Beneficiar"]= "";
      renamedObj["Tasa Real"]= "";
      renamedObj["Diferencia Tasas"]= "";
      renamedObj["Interes Actual"]= "";
      renamedObj["Interes Beneficiar"]= "";
      renamedObj["Diferencia Interes"]= "";
      return renamedObj;
    }    
}

const cifinKeys=
{
  "Tarjeta": "LINEACREDITO",
  "Nombre Producto": "NOMBREENTIDAD",
  "Pago Mensual": "VALORCUOTA",
  "Plazo Actual": "NUMEROCUOTASPACTADAS",
  "Deuda Actual": "SALDOOBLIGACION"  
}
const beneficiarKeys=
{
  "Tarjeta": "LINEA",
  "Nombre Producto": "LINEA",
  "Pago Mensual": "VRCUOTA",
  "Plazo Actual": "PLAZO",
  "Deuda Actual": "SALDO"
}
 