import { CalculosService } from './calculos.service';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

import { HttpClient } from '@angular/common/http';

@Injectable({providedIn: 'root'})

export class DataService {
  constructor(private apiService: ApiService, private http: HttpClient,private CalculosService:CalculosService) {}
  private jsonFile='';
  private productList: Array<{ [key: string]: string }> = [];
  private nombreFuncionario="";
  private documentoFuncionario="";
  private infoCliente:any={'documento':'',
    'nombre':'',
    'calificacion':'NC',
    'rating':0
  };
  private access=false; // #####################################################
  private esAsociado=false;
  private autoriza=false;
  private documentoAutorizado = '';
  private creditoOfrecidoEsRotativo = false;
  private contenidoPopUp = '';
  private estadoCargando = false;
  private productosRecoger : Array<{ [key: string]: string }> = [];
  private totalRecoger = 0;
  private situacionActual: Info= {
    'deudaTotal': '',
    'pagoMensual': '',
    'tasa+Costos': 0,
    'costoFinanciero': '',
    'aportes':''
  };
  private estadoConsulta=false;

  private tiposGarantias: any;
  private tiposProductos:any;
  private plazoCreditos = [];

  getEstadoConsulta(){return this.estadoConsulta}
  setEstadoConsulta(estado:boolean){this.estadoConsulta = estado}

  getEstadoCargando(){return this.estadoCargando}
  setEstadoCargando(mensaje:boolean){this.estadoCargando = mensaje}


  getContenidoPopUp(){return this.contenidoPopUp}
  setContenidoPopUp(mensaje:string){this.contenidoPopUp = mensaje}

  setAccess(access:boolean){this.access=access}

  getJsonFile(): string {
    return this.jsonFile;
  }

  setJsonFile(jsonData: any) {
    this.jsonFile = JSON.stringify(cleanNumbers(jsonData), null, 2);
  }

  async guardarAsesoria(json:any){
    let a =await  this.apiService.guardarAsesoria(json);
    console.log(json);
  }

  getDocumentoFuncionario(){return this.documentoFuncionario}
  setDocumentoFuncionario(documento:string){this.documentoFuncionario=documento}

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

  getTotalRecoger(){return this.totalRecoger}
  getSituacionActual(){return this.situacionActual}

  getProductosRecoger(){return this.productosRecoger}


  async askLogin(documentoFuncionario:string,clave:string){
    var validacionFuncionario = await
    this.apiService.getLoginInfo(documentoFuncionario,clave);
    validacionFuncionario = validacionFuncionario.result[0];
    if(validacionFuncionario['CodError']===-1){
      this.nombreFuncionario=validacionFuncionario["NOMBRES"]+" "+validacionFuncionario["APELLIDOS"];
      this.access=true;
      this.documentoFuncionario = documentoFuncionario;
      this.tiposGarantias = await this.apiService.getTabla('TIPO_GARANTIA');
      this.tiposProductos= await this.apiService.getTabla('LINEA_CREDITO');

      // this.plazoCreditos= await this.apiService.getTabla('TIPO_GARANTIA');
    }
    return this.access;
  }

  getGarantia(index:number){return this.tiposGarantias[index]}
  getProducto(index:number){return this.tiposProductos[index]}

  setData(data:Array<{ [key: string]: string }>){this.productList=data}
  getData() {return this.productList}

addProduct(product: {[key: string]:string}){
    this.productList.push(product);
}
updateProduct(product :{[key: string]:string},index:number){
    this.productList[index]=product;
}
getProduct(index:number){return this.productList[index]}
deleteProduct(index:number){
  this.productList.slice(index,1);
}
async pullData(documento: string,apellido:string) {
  this.resetValues();
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
              this.infoCliente['aportes'] = this.CalculosService.formatear('numero',Number(lastAporte) || 0);
              this.situacionActual['aportes']=Number(lastAporte) || 0;
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
//  Consulta SIFIN
/*    if (this.esAsociado || (this.documentoAutorizado === documento)) {
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
*/
  // Consulta Data Credito
  if (this.esAsociado || (this.documentoAutorizado === documento)) {
    try {
      let dataCreditoResponse = await this.apiService.consultaDataCredito(Number(documento),apellido);
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

calcularSituacionActual(){
  this.productosRecoger = this.productList.filter((item) =>item['Recoger'] === 'true');

    this.situacionActual = {};
    this.situacionActual = this.CalculosService.calcularSituacion(
                this.productosRecoger,this.infoCliente['aportes']);
}

getTiposGarantias(){return this.tiposGarantias}
getTiposProductos(){return this.tiposProductos}

// Metodo para extraer la data de los productos reportados por DataCredito a un formato compatible a
// la informacion deseada
convertDataCreditoProducts(productos:any){
  productos.map((producto:any) =>{
    var renamedObj: any = {};
    renamedObj['Deuda Actual'] = this.CalculosService.formatear('numero',producto['values'][0]['debtBalance']);
    renamedObj['Plazo Actual'] = this.CalculosService.formatear('numero',producto['values'][0]['totalNumberOfInstallments']-producto['values'][0]['paidInstallments']);
    renamedObj['Pago Mensual'] = this.CalculosService.formatear('numero',
                                  producto['values'][0]['valueMonthlyPayment'] || 0);
    renamedObj['Tarjeta'] = String(
        producto['featuresLiabilities']['typeOfCreditDesc'] === 'ROTA' ||
        producto['featuresLiabilities']['typeOfCreditDesc'] === 'TCR' ||
        producto['featuresLiabilities']['typeOfCreditDesc'] === 'ROTATIVO');
    renamedObj['Nombre Producto'] =
        producto['account']['businessLineName'] + ' ' +
        producto['featuresLiabilities']['typeOfCreditDesc'] + ' ' +
        producto['account']['accountNumber'] + ' SALDO $:' +
        this.CalculosService.formatear('numero',producto['values'][0]['debtBalance']);
    renamedObj["Recoger"]= "true";
    renamedObj["Diferencia Tasas"]= "";
    renamedObj["Interes Actual"]= "";
    renamedObj["Interes Beneficiar"]= "";
    renamedObj["Diferencia Interes"]= "";
    renamedObj["Tasa Beneficiar"]= "1";
    renamedObj["Tasa Entidad"]= "";



    renamedObj["Tasa Real"] = (this.CalculosService.findInterestRate(
                              producto['values'][0]['valueMonthlyPayment'] || 0,
                              producto['values'][0]['debtBalance'],
                              producto['values'][0]['totalNumberOfInstallments']-producto['values'][0]['paidInstallments']
                              )*1200).toFixed(2);

    if(Number(renamedObj['Tasa Real'])>0 && producto['values'][0]['debtBalance']>0)
      renamedObj['Interes Actual'] = this.CalculosService.formatear(
              'numero',(Number(renamedObj['Tasa Real'])*
              producto['values'][0]['debtBalance']/1200));
    else renamedObj['Interes Actual'] = "0";
    this.addProduct(renamedObj);
  })
}


convertData(registros:any ,newKeysMapping:any){
    registros.map((item: any) => this.renameKeys(item, newKeysMapping));
}

// Metodo para renombrar los keys de los productos
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
          +" SALDO:$" +this.CalculosService.formatear('numero',obj["SALDOOBLIGACION"]*1000||Number(obj["SALDO"]));
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

      if (renamedObj['Pago Mensual']==='' || !renamedObj['Pago Mensual'])
        renamedObj['Pago Mensual']=
          this.CalculosService.calculateMonthlyPayment(
            Number(renamedObj['Plazo Actual']),
              Number(renamedObj['Tasa Real']),
            Number(renamedObj['Deuda Actual'])).toFixed(0) || '';

      if(Number(renamedObj['Tasa Real'])>0 && renamedObj['Deuda Actual']>0)
        renamedObj['Interes Actual'] = this.CalculosService.formatear(
                'numero',(Number(renamedObj['Tasa Real'])*
                renamedObj['Deuda Actual']/1200));
      else renamedObj['Interes Actual'] = "0";
      this.addProduct(renamedObj);
  }

  resetValues() {
    this.jsonFile = '';
    this.productList = [];
    // this.nombreFuncionario = "";
    // this.documentoFuncionario = "";
    this.infoCliente = {'documento':'',
      'nombre':'',
      'calificacion':'NC',
      'rating':0
    };
    this.esAsociado = false;
    this.autoriza = false;
    this.documentoAutorizado = '';
    this.creditoOfrecidoEsRotativo = false;
    this.contenidoPopUp = '';
    this.productosRecoger = [];
    this.totalRecoger = 0;
    this.situacionActual = {
      'deudaTotal': '',
      'pagoMensual': '',
      'tasa+Costos': 0,
      'costoFinanciero': '',
      'aportes':''
    };
    this.estadoConsulta = false;
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


interface Info {
  [key: string]:any;
}
function cleanNumbers(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(cleanNumbers);
  } else if (typeof obj === "object" && obj !== null) {
    for (const key in obj) {
      if (key !== "Tasa") {
        obj[key] = cleanNumbers(obj[key]);
      }
    }
  } else if (typeof obj === "string" && /^[0-9,\.]+$/.test(obj)) {
    return obj.replace(/[.,]/g, "");
  }
  return obj;
}


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
