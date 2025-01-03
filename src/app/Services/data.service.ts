import { CalculosService } from './calculos.service';
import { ProductosComponent } from '../productos/productos.component';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

import { HttpClient } from '@angular/common/http';

@Injectable({providedIn: 'root'})

export class DataService {
  constructor(private apiService: ApiService, private http: HttpClient,private CalculosService:CalculosService
  ) {}  
  private productList: Array<{ [key: string]: string }> = [];
  private nombreFuncionario="";
  private infoCliente:any={'documento':'',
    'nombre':'',
    'calificacion':'NC',
    'rating':0
  };
  private interestRange=[];
  private access=true;
  private esAsociado=false;
  private compraCartera=false;
  private autoriza=false;
  private documentoAutorizado = '';
  private creditoOfrecidoEsRotativo = false;

  getCreditoOfrecidoEsRotativo(){return this.creditoOfrecidoEsRotativo}
  setCreditoOfrecidoEsRotativo(esRotativo:boolean){this.creditoOfrecidoEsRotativo = esRotativo}

  getDocumentoAutorizado(){return this.documentoAutorizado}
  setDocumentoAutorizado(documento:string){this.documentoAutorizado = documento}

  getEsAsociado(){return this.esAsociado}
  setEsAsociado(eleccion:boolean){this.esAsociado=eleccion}

  getAutoriza(){return this.autoriza}
  setAutoriza(eleccion:boolean){this.autoriza=eleccion}

  getProductList(){return this.productList}

  getSalario(){return this.infoCliente['ingresos']}
  setSalario(ingresos:string){this.infoCliente['ingresos']=ingresos}


  getCompraCartera(){return this.compraCartera}
  setCompraCartera(eleccion:boolean){this.compraCartera=eleccion}
  getDocumento(){return this.infoCliente['documento']}
  getAportes(){return this.infoCliente['aportes']}
  setDocumento(documento:string){this.infoCliente['documento']=documento}
  setNombreFuncionario(nombre:string){this.nombreFuncionario=nombre}
  getInfoCliente(){return this.infoCliente}
  getNombreCliente(){return this.infoCliente['nombre'] || ''}
  setNombreCliente(nombre:string){this.infoCliente['nombre']=nombre}
  getAccess(){return this.access}  
  getNombreFuncionario(){return this.nombreFuncionario}
  getApalancamiento(){return this.infoCliente['apalancamiento']}
  getSaldoAportes(){return this.infoCliente['saldoAportes']}
  getCalificacion(){return this.infoCliente['calificacion']}



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
async pullData(documento: string) {
  this.productList = [];
  let basicClientInfo: any;
  this.infoCliente={'documento':documento}
  let validar = false;
  try {
    // Consulta Beneficiar
      basicClientInfo = await this.apiService.getBeneficiarInfo(documento);
      if (basicClientInfo.result[0]?.['CodError'] === 0) {
          basicClientInfo = basicClientInfo.result[0];
          this.infoCliente['nombre'] = basicClientInfo.Nombre;
          this.infoCliente['ingresos'] = basicClientInfo.Salario;

          // Get aportes and validate the response
          const aportesResponse = await this.apiService.getAhorroAportes(basicClientInfo.CodAsociado);
          const aportes = aportesResponse.result?.[0]?.['Registros'];
          if (aportes && aportes.length > 0) {
              const lastAporte = aportes[aportes.length - 1]?.['CUOTAMENSUALAPORTE'];
              this.infoCliente['aportes'] = formatNumber(Number(lastAporte) || 0);
          }

          // Calculate saldoAportes
          this.infoCliente['saldoAportes'] =
              Number(basicClientInfo.Registros?.[0]?.VALORCONSOLIDADO || 0) +
              Number(basicClientInfo.Registros?.[1]?.VALORCONSOLIDADO || 0);
          
          // Get beneficiarProducts
          const rotativosBeneficiarResponse = 
            await this.apiService.getRotativosBeneficiar(basicClientInfo.CodAsociado);
          this.convertData(rotativosBeneficiarResponse.result?.[0]?.Registros || [], beneficiarKeys);
          
          const creditosBeneficiarResponse = 
            await this.apiService.getCreditosBeneficiar(basicClientInfo.CodAsociado);
          this.convertData(creditosBeneficiarResponse.result?.[0]?.Registros || [], beneficiarKeys);

          this.esAsociado = true;
          validar=true;
 
      } else {
          this.esAsociado = false;
      }
  } catch (error) {
      console.error('Error in getting basic client info:', error);
  }
 // Consulta SIFIN
  if (this.esAsociado || (this.documentoAutorizado === documento)) {
      try {
          const cifinProductsResponse = await this.apiService.getCifinProducts(documento);

          if (cifinProductsResponse['CodError'] === '0') {
              // this.infoCliente['calificacion'] = cifinProductsResponse.CALIFICACION;

              // Filter valid cifin products
              let cifinProducts = cifinProductsResponse.JAObligaciones || [];
              cifinProducts = cifinProducts.filter(
                  (item: any) =>
                      item['CALIDAD'] === 'PRIN' &&
                      item['NOMBREENTIDAD'] !== 'BENEFICIAR- COOP. DE AHORRO Y'
              );
              this.convertData(cifinProducts, cifinKeys);
              validar=true;
          }
      } catch (error) {
          console.error('Error in getting CIFIN products:', error);
      }
  }
  // Consulta Data Credito
  if (this.esAsociado || (this.documentoAutorizado === documento)) {
    try {
      let dataCreditoResponse = await this.apiService.consultaDataCredito(Number(documento),'');
            if (dataCreditoResponse['CodError'] === 0) {
              const dataCreditoConsulta = JSON.parse(dataCreditoResponse.Consulta.replace('/','')).ReportHDCplus;
              if(this.getNombreCliente()===''){
                this.setNombreCliente(dataCreditoConsulta.basicInformation.fullName);
              }
              // Filter valid in debt products
              let dataCreditoProductos = dataCreditoConsulta.liabilities || [];
              dataCreditoProductos.forEach((element: any) => {
                if(element['account']['rating']>(this.infoCliente['rating']|0))
                {
                  this.infoCliente['rating']=
                    element['account']['rating'];
                  this.infoCliente['calificacion']=
                    element['account']['ratingDesc'];

                }
              });
              dataCreditoProductos = dataCreditoProductos.filter(
                  (item: any) =>
                    Number(item?.['values']?.[0]?.['debtBalance'] || 0) > 0
              );

        this.convertDataCreditoProducts(dataCreditoProductos);
        validar=true;
      }     
    } catch (error) {
        console.error('Error in getting DATA CREDITO products:', error);
    }
}
  return validar;
}
/// menor calificacion a,b,c, 
////////////////     VALIDAR CALIFICACION (CADA PRODUCTO TIENE UNA DIFERENTE)  //////////////

convertDataCreditoProducts(productos:any){  
  
  productos.map((producto:any) =>{
    var renamedObj: any = {};
    renamedObj['Deuda Actual'] = producto['values'][0]['debtBalance'];
    renamedObj['Plazo Actual'] = String(producto['values'][0]['totalNumberOfInstallments']);
    renamedObj['Pago Mensual'] = producto['values'][0]['valueMonthlyPayment'];
    renamedObj['Tarjeta'] = String(
      producto['featuresLiabilities']['typeOfCreditDesc'] === 'ROTA' ||
      producto['featuresLiabilities']['typeOfCreditDesc'] === 'TCR' || 
      producto['featuresLiabilities']['typeOfCreditDesc'] === 'ROTATIVO'); 
    renamedObj['Nombre Producto'] = 
      producto['account']['businessLineName'] + ' ' +
      producto['featuresLiabilities']['typeOfCreditDesc'] + ' ' +
      producto['account']['accountNumber'] + ' SALDO $:' +
      formatNumber(producto['values'][0]['debtBalance']);
    renamedObj["Recoger"]= "true";
    renamedObj["Diferencia Tasas"]= "";
    renamedObj["Interes Actual"]= "";
    renamedObj["Interes Beneficiar"]= "";
    renamedObj["Diferencia Interes"]= "";
    renamedObj["Tasa Beneficiar"]= "";
    renamedObj["Tasa Entidad"]= "";
    renamedObj["Tasa Real"]= "";

    this.addProduct(renamedObj);
  })  
}

  
convertData(registros:any ,newKeysMapping:any){
    registros.map((item: any) => this.renameKeys(item, newKeysMapping));
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
          " "+obj[keyMap[key]] + " " + (obj["NUMEROOBLIGACION"]||obj["PAGARE"]||obj["TARJETA"]) 
          +" SALDO:$" +formatNumber(obj["SALDOOBLIGACION"]*1000||Number(obj["SALDO"]));
        } 
        else if (key === "Plazo Actual") {
          renamedObj[key] = String(obj[keyMap[key]] - (obj["CUOTASCANCELADAS"] || obj["ALTURA"])||36);
        }
        else if (keyMap[key] === "VALORCUOTA" || keyMap[key] === "SALDOOBLIGACION") {
          renamedObj[key] = obj[keyMap[key]] * 1000;
        } 
        else if (key === "Tarjeta"){
          renamedObj[key] = String(obj[keyMap[key]] === 'ROTA' ||
        obj[keyMap[key]] === 'TCR' || obj[keyMap[key]] === 'ROTATIVO');  }      
        
        else {
          renamedObj[key]=obj[keyMap[key]];
        }
      } 
      renamedObj["Recoger"]= "true";
      renamedObj["Diferencia Tasas"]= "";
      renamedObj["Interes Actual"]= "";
      renamedObj["Interes Beneficiar"]= "";
      renamedObj["Diferencia Interes"]= "";
      this.addProduct(renamedObj);
  }    
}

const cifinKeys=
{
  "Tarjeta": "LINEACREDITO",
  "Nombre Producto": "NOMBREENTIDAD",
  "Pago Mensual": "VALORCUOTA",
  "Plazo Actual": "NUMEROCUOTASPACTADAS",
  "Deuda Actual": "SALDOOBLIGACION" ,
  "Tasa Real":"",
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
