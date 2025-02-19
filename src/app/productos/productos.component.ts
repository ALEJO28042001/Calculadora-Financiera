import { DataService } from './../Services/data.service';
import { CalculosService } from '../Services/calculos.service';
import { Component, Input, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterOutlet],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit{
  constructor(private DataService: DataService, private CalculosService: CalculosService) { }
  protected infoCliente:{ [key: string]: string } = {
  }
  error=false;
  autorizar=false;
  isRef: boolean = false;
  isTarjeta: boolean = false;
  consultaExitosa: boolean = false;
  productList: Array<{ [key: string]: string }> = [];
  selectedProductIndex: number | null = null; // For editing/deleting selected product
  access=false;
  datosProductoValidos: boolean = true;
  primerCampoErroneo: string = '';
  i: number = 0;
  moneyKeys=[
    "Deuda Actual", "Pago Mensual","Interes Actual", "Interes Beneficiar",
    "Diferencia Interes"
  ]
  primerApellido='';

  ngOnInit() {
    this.productList = this.DataService.getData();
    this.infoCliente = this.DataService.getInfoCliente();
    this.infoCliente['documento'] = this.CalculosService.formatearDocumento(this.infoCliente['documento']);
    this.access = this.DataService.getAccess();
  }
  getNombreFuncionario(){return this.DataService.getNombreFuncionario();}
  product: { [key: string]: string } = {
    "Nombre Producto": "",
    "Tarjeta":"false",
    "Recoger": "true",
    "Deuda Actual": "",
    "Plazo Actual": "",
    "Pago Mensual": "",
    "Tasa Entidad": "",
    "Tasa Real": "",
    "Diferencia Tasas": "",
    "Interes Actual": "",
    "Interes Beneficiar": "",
    "Diferencia Interes": "",
    "Tasa Beneficiar":"",
  };

  keys = ["Nombre Producto",
    "Tarjeta",
    "Recoger",
    "Deuda Actual",
    "Plazo Actual",
    "Pago Mensual",
    "Tasa Entidad",
    "Tasa Real",
    "Tasa Beneficiar",
    "Diferencia Tasas",
    "Interes Actual",
    "Interes Beneficiar",
    "Diferencia Interes",
];

gAccess(){return this.DataService.getAccess()}

  addProduct(product?: any | null) {
    if(product){
      this.product=product;
    }
    this.i = 0;
    this.datosProductoValidos = true;
    this.primerCampoErroneo='';
    do{
      if(this.product[camposVerificarProducto[this.i]]==='')
      {
        this.datosProductoValidos = false;
        this.primerCampoErroneo = camposVerificarProducto[this.i];
        this.DataService.setContenidoPopUp('Producto no agregado, revisar: '+this.primerCampoErroneo);
      }
      this.i+=1;
    }
    while(this.datosProductoValidos && this.i<5)
    if(this.datosProductoValidos)
    {
      this.DataService.setContenidoPopUp('Producto: '+this.product['Nombre Producto']+', agregado o actualizado correctamente');
    for(let field of this.moneyKeys){
      this.product[field]=String(this.product[field]).replace(/[^0-9]/g, '');
    }

    if (this.product['Pago Mensual']==='')
      this.product['Pago Mensual']=
        this.CalculosService.calculateMonthlyPayment(
          Number(this.product['Plazo Actual']),
          Number(this.product['Tasa Real']),
          Number(this.product['Deuda Actual'])).toFixed(0);
    this.calculateRealRate();
    if (this.selectedProductIndex === null) {
      // Add a new product
      this.productList.push({ ...this.product });
      // this.resetForm();
    } else {
      // Update existing product
      this.productList[this.selectedProductIndex] = { ...this.product };
    }
    this.DataService.setData(this.productList);
    for(let field of this.moneyKeys){
      this.product[field]=this.product[field].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    }
  }



  // Function to select a product to edit
  chooseProduct(index: number) {
    this.resetForm();
    this.selectedProductIndex = index;
    this.product = { ...this.productList[index] };
    this.isTarjeta=this.product['Tarjeta']==='true';
    this.isRef=this.product['Recoger']==='true';

    for(let field of this.moneyKeys){
      this.product[field]=this.CalculosService.formatearNumero(Number(this.product[field].replace(/[^0-9]/g, '')));
    }
  }

  deleteProduct(index: number) {
    this.DataService.setContenidoPopUp('Producto: '+this.product['Nombre Producto']+' ,eliminado correctamente');
    this.productList.splice(index, 1);
    this.resetForm();
  }

  resetForm() {
    // this.keys.forEach(element => {
    //   this.product[element]='';
    // });
    this.product = {
      "Nombre Producto": "",
      "Tarjeta": "false",
      "Recoger": "true",
      "Deuda Actual": "",
      "Plazo Actual": "",
      "Pago Mensual": "",
      "Tasa Entidad": "",
      "Tasa Beneficiar":"",
      "Tasa Real": "",
      "Diferencia Tasas": "",
      "Interes Actual": "",
      "Interes Beneficiar": "",
      "Diferencia Interes": "",
    };
    this.selectedProductIndex=null;
    this.isTarjeta = false;
    this.isRef = false;
  }

  tipoDeProducto(e:any){
  this.isTarjeta = (e.target as HTMLInputElement).checked;
  this.product['Tarjeta']=String(this.isTarjeta);
  }

  eleccionRecoger(e:any){
    this.isRef = (e.target as HTMLInputElement).checked;
    this.product['Recoger']=String(this.isRef);
  }

  calculateRealRate(){
      let amount = Number(this.product['Deuda Actual'].replace(/[^0-9]/g, ''));
      let months = Number(this.product['Plazo Actual']);
      let pago = Number(this.product['Pago Mensual'].replace(/[^0-9]/g, ''));
      if(this.product['Nombre Producto'].substring(0,10)!=='BENEFICIAR' && pago<amount)
          this.product['Tasa Real']=((this.CalculosService.findInterestRate(pago,amount, months)*1200)).toFixed(2);
      else this.product['Tasa Real'] = "0";
      if(Number(this.product['Tasa Real'])>0 && amount>0)
          this.product['Interes Actual'] = this.CalculosService.formatear('numero',(Number(this.product['Tasa Real'])*amount/1200));
      else this.product['Interes Actual'] = "0";
      this.actualizarDiferencias();
  }

  actualizarDiferencias(){
    this.product['Interes Beneficiar'] = this.CalculosService.formatearNumero(Number((Number(this.product['Tasa Beneficiar'])*
        Number(this.product['Deuda Actual'].replace(/[^0-9]/g, ''))/1200).toFixed(0)));
    this.product['Diferencia Interes'] = this.CalculosService.formatearNumero(Number((Number(this.product['Interes Actual'].replace(/[^0-9]/g, ''))-
        Number(this.product['Interes Beneficiar'].replace(/[^0-9]/g, ''))).toFixed(0)));
    this.product['Diferencia Tasas'] = (Number(this.product['Tasa Beneficiar'])-Number(this.product['Tasa Real'])).toFixed(2);
  }
  getNombreCliente(){return this.DataService.getNombreCliente()}


  procesoAutorizacion(documento:string){
    // agregar logica de validacion

    console.log('Autorizacion completa para el documento: ',documento.replace(/[^0-9]/g, ''));
    this.autorizar = this.primerApellido!=='';
    this.error = false;

    this.DataService.setDocumentoAutorizado(documento.replace(/[^0-9]/g, ''));
    return true;
  }

  getDoc(){
    return this.infoCliente['documento'].replace(/[^0-9]/g, '');
  }

  getDocumentoAutorizado(){
    return this.DataService.getDocumentoAutorizado();
  }

  getEsAsociado(){
    return this.DataService.getEsAsociado();
  }

  async searchData(){
    // console.log(this.getDocumentoAutorizado(),' ',);
    this.DataService.setEstadoCargando(true);
    this.productList=[];
    this.consultaExitosa=false;

    this.resetForm();
    const consulta =
    await this.DataService.pullData(this.getDoc(),this.infoCliente['primerApellido']);
    // console.log('COnsulta:',consulta);
      if(consulta){
        this.DataService.getProductList().map(p=>this.addProduct(p));
        this.resetForm();
        this.error=false;
        this.infoCliente['nombre']=this.DataService.getNombreCliente();
        this.consultaExitosa=true;
        this.DataService.setContenidoPopUp('Consulta Exitosa');
      }
      else{
          this.error=true;
          this.autorizar=false;
          this.infoCliente['nombre']='';
          this.DataService.setContenidoPopUp('Error en la Consulta, verifique datos');
      }

    this.DataService.setEstadoCargando(false);
    this.infoCliente['documento'] = this.CalculosService.formatearDocumento(this.infoCliente['documento']);
    this.resetForm();
  }


  calcularInteresBeneficiar(){
    this.product['Interes Beneficiar'] =
    this.CalculosService.calcularInteres(
      Number(this.product['Deuda Actual'].replace(/[^0-9]/g, '')),
      Number(this.product['Tasa Beneficiar'].replace(/[^0-9.]/g, '')));
    this.actualizarDiferencias();
  }

  fNumber(key:string) {
    let p=this.product[key].replace(/[^0-9.]/g, '');
    this.product[key] = p.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  tasaPermitida(tasa:string){
    let p=tasa.replace(/[^0-9.]/g, '');
    this.product['Tasa Beneficiar'] = p.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  }

  formatear(funcion:string,value:any) {
    this.infoCliente['documento'] = this.CalculosService.formatear(funcion,value);
  }

  getEstadoCargando(){return this.DataService.getEstadoCargando()}

}

const camposVerificarProducto=['Nombre Producto','Deuda Actual','Plazo Actual','Pago Mensual','Tasa Beneficiar'];
