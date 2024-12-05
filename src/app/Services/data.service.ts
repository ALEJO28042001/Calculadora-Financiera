import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

import { HttpClient } from '@angular/common/http';

@Injectable({providedIn: 'root'})

export class DataService {
  constructor(private apiService: ApiService, private http: HttpClient) {}  
  private productList: Array<{ [key: string]: string }> = [];
  private nombreCliente:string='';
  private apalancamiento=0;
  private documentoAsociado='';
  private nombreFuncionario="";
  private infoCliente:any='';
  private interestRange=[];
  private access=true;

  getDocumentoAsociado(){return this.documentoAsociado}
  setDocumentoAsociado(documento:string){this.documentoAsociado=documento}
  setNombreFuncionario(nombre:string){this.nombreFuncionario=nombre}
  getInfoCliente(){return this.infoCliente}
  getNombreCliente(){return this.nombreCliente;}
  getAccess(){return this.access;}  
  getNombreFuncionario(){return this.nombreFuncionario}
  getApalancamiento(){return this.apalancamiento}

  async askLogin(documentoFuncionario:string,clave:string){   
    var validacionFuncionario = await
    this.apiService.getLoginInfo(documentoFuncionario,clave);
    validacionFuncionario = validacionFuncionario.result[0];
    if(validacionFuncionario['CodError']===-1){
      this.nombreFuncionario=validacionFuncionario["NOMBRES"]+" "+validacionFuncionario["APELLIDOS"];
      this.access=true;
    }
    return this.access;    
  }

  logOut(){this.access=false}
  setData(data:Array<{ [key: string]: string }>){this.productList=data}
  getData() {return this.productList}
addProduct(product: {[key: string]:string}){
    this.productList.push(product);
}
updateProduct(product :{[key: string]:string},index:number){
    this.productList[index]=product;
}
deleteProduct(index:number){
  this.productList.slice(index,1);
}
async pullData(documento:string){
    this.productList=[];
    //Se consulta la info del asociado
      try{var cifinProducts= await this.apiService.getCifinProducts(documento);
      const basicClientInfo= await this.apiService.getBeneficiarInfo(documento);
      if(cifinProducts['CodError']==='0'){
        cifinProducts=cifinProducts.JAObligaciones;      
        cifinProducts=cifinProducts.filter((item: any) => 
          item["CALIDAD"] === 'PRIN'
        && item["NOMBREENTIDAD"] != 'BENEFICIAR- COOP. DE AHORRO Y');
        this.setData(this.convertData(cifinProducts,cifinKeys));
      }
      if(basicClientInfo.result[0]['CodError']===0){
        this.infoCliente=basicClientInfo.result[0];
        this.nombreCliente=this.infoCliente.Nombre;
        var beneficiarProducts= 
        await this.apiService.getBeneficiarProducts(this.infoCliente.CodAsociado);
        beneficiarProducts=beneficiarProducts.result[0].Registros;
        this.apalancamiento=(Number(this.infoCliente.Registros[0].VALORCONSOLIDADO)+
          Number(this.infoCliente.Registros[1].VALORCONSOLIDADO));  
        beneficiarProducts.map((item: any) => this.addProduct(this.renameKeys(item, beneficiarKeys)));  
        this.documentoAsociado = documento;
      }
    }   
    catch{}
    return this.productList;
  }
convertData(registros:any ,newKeysMapping:any){
    return registros.map((item: any) => this.renameKeys(item, newKeysMapping));
  }
renameKeys(obj: any, keyMap: { [oldKey: string]: string }) {
      const renamedObj: any = {};
      for (const key in keyMap) {      
        if ( key === 'Tasa Real' ){
          const tasa = obj[keyMap[key]] || "";
          renamedObj["Tasa Entidad"]= tasa;
          renamedObj["Tasa Beneficiar"]= tasa;
          renamedObj["Tasa Real"]= tasa;
        }
        else if (key === "Nombre Producto") {
          renamedObj[key] = (obj["TIPOENTIDAD"] || "BENEFICIAR" )+ 
          " "+obj[keyMap[key]] + " " + (obj["NUMEROOBLIGACION"]||obj["PAGARE"]) 
          +" SALDO:$" +formatNumber(obj["SALDOOBLIGACION"]*1000||Number(obj["SALDO"]));
        } 
        else if (key === "Plazo Actual") {
          renamedObj[key] = String(obj[keyMap[key]] - (obj["CUOTASCANCELADAS"] || obj["ALTURA"]));
        }
        else if (obj[keyMap[key]] === "VALORCUOTA" || keyMap[key] === "SALDOOBLIGACION") {
          renamedObj[key] = obj[keyMap[key]] * 1000;
        } 
        else if (key === "Tarjeta"){
          renamedObj[key] = String(obj[keyMap[key]] === 'ROTA' ||
        obj[keyMap[key]] === 'TCR' || obj[keyMap[key]] === 'ROTATIVO');  }      
        
        // Default case for all other keys
        else {
        renamedObj[key]=obj[keyMap[key]];
        }
      } 
      renamedObj["Refinanciamiento"]= "true";
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
  "Deuda Actual": "SALDO",
  "Tasa Real":"TASA",
}
 
function formatNumber(value: number): string {
  return value.toLocaleString('en-US', {maximumFractionDigits:0});
}