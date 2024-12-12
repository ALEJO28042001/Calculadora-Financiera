import { DataService } from './../Services/data.service';
import { Component, Input, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-fields-manager',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterOutlet],
  templateUrl: './fields-manager.component.html',
  styleUrl: './fields-manager.component.css'
})
export class FieldsManagerComponent implements OnInit{
  constructor(private DataService: DataService) { }
  error=false;
  isLoading=false;
  nombreAsociado='';
  documentoAsociado='';  
  isRef: boolean = false;
  isTarjeta: boolean = false;
  productList: Array<{ [key: string]: string }> = [];
  selectedProductIndex: number | null = null; // For editing/deleting selected product
  showAllProducts = false; // To toggle product display
  access=false;
  nombreFuncionario='';
  moneyKeys=[
    "Deuda Actual", "Pago Mensual","Interes Actual", "Interes Beneficiar",
    "Diferencia Interes"
  ]

  ngOnInit() { 
    this.productList = this.DataService.getData();
    this.documentoAsociado=this.DataService.getDocumentoAsociado();
    this.documentoNumber();
    this.access = this.DataService.getAccess();
    this.nombreFuncionario=this.DataService.getNombreFuncionario();
  }
  gNombreFuncionario(){return this.DataService.getNombreFuncionario();}
  @Input() product: { [key: string]: string } = {
    "Nombre Producto": "",
    "Tarjeta":"false",
    "Refinanciamiento": "true",
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
    "Refinanciamiento",
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
    console.log(this.product);
    for(let field of this.moneyKeys){
      this.product[field]=String(this.product[field]).replace(/[^0-9]/g, '');
    }
    this.calculateRealRate();
    if (this.selectedProductIndex === null) {
      // Add a new product
      this.productList.push({ ...this.product });
      this.resetForm();
    } else {
      // Update existing product
      this.productList[this.selectedProductIndex] = { ...this.product };
    }    
    this.DataService.setData(this.productList);
    for(let field of this.moneyKeys){
      this.product[field]=this.product[field].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  }

  
  // Function to show all products
  toggleProductList() {
    this.showAllProducts = !this.showAllProducts;
  }
  
  num(s:string){
    return Number(s) || 0;
  }

  // Function to select a product to edit
  chooseProduct(index: number) {
    this.resetForm();
    this.selectedProductIndex = index;
    this.product = { ...this.productList[index] }; 
    this.isTarjeta=this.product['Tarjeta']==='true';
    this.isRef=this.product['Refinanciamiento']==='true';
    
    for(let field of this.moneyKeys){
      this.product[field]=this.formatNumber(Number(this.product[field].replace(/[^0-9]/g, '')));
    }
  }

  deleteProduct(index: number) {
    this.productList.splice(index, 1);
    this.resetForm();
  }

  resetForm() {
    this.product = {
      "Nombre Producto": "",
      "Tarjeta": "false",
      "Refinanciamiento": "true",
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

  eleccionRef(e:any){
    this.isRef = (e.target as HTMLInputElement).checked;
    this.product['Refinanciamiento']=String(this.isRef);
  }

  calculateFunction(r: number, cuota: number, capital: number, plazo: number): number {
    return capital * r - cuota * (1 - Math.pow(1 + r, -plazo));
  }

  calculateDerivative(r: number, cuota: number, capital: number, plazo: number): number {
    return capital - cuota * (1 - plazo * Math.pow(1 + r, -plazo) / (1 + r));
  }  

  findInterestRate(cuota: number, capital: number, plazo: number, initialGuess: number = 0.05): number {
    const tolerance = 1e-6;
    let r = initialGuess;
    let diff = this.calculateFunction(r, cuota, capital, plazo);

    while (Math.abs(diff) > tolerance) {
      const derivative = this.calculateDerivative(r, cuota, capital, plazo);
      if (derivative === 0) {
        throw new Error('Derivative is zero; Newton-Raphson method fails.');
      }
      r = r - diff / derivative;
      diff = this.calculateFunction(r, cuota, capital, plazo);
    }
    return r;
  }
  calculateRealRate(){
    console.log(this.product['Tasa Real']);

      let amount = Number(this.product['Deuda Actual']);
      let months = Number(this.product['Plazo Actual']);
      let pago = Number(this.product['Pago Mensual']);
      if(amount>0 && months>0 && pago>0 && this.product['Nombre Producto'].substring(0,10)!=='BENEFICIAR')
      {
        this.product['Tasa Real']=((this.findInterestRate(pago,amount, months)*1200)).toFixed(2);  
      }    
      this.product['Interes Actual'] = (Number(this.product['Tasa Real'])*amount/1200).toFixed(0);  
      this.actualizarDiferencias();
  }   
  actualizarDiferencias(){
    this.product['Interes Beneficiar'] = this.formatNumber(Number((Number(this.product['Tasa Beneficiar'])*
        Number(this.product['Deuda Actual'].replace(/[^0-9]/g, ''))/1200).toFixed(0))); 
    this.product['Diferencia Interes'] = this.formatNumber(Number((Number(this.product['Interes Actual'].replace(/[^0-9]/g, ''))-
        Number(this.product['Interes Beneficiar'].replace(/[^0-9]/g, ''))).toFixed(0)));
    this.product['Diferencia Tasas'] = (Number(this.product['Tasa Beneficiar'])-Number(this.product['Tasa Real'])).toFixed(2);
  }

  async searchData(){
    this.isLoading=true;
    this.productList=[];
    this.resetForm();
    const listaProductos = await this.DataService.pullData(this.documentoAsociado.replace(/[^0-9]/g, ''));
    if(listaProductos.length>0){
      listaProductos.map(p=>this.addProduct(p));
      this.resetForm();
      this.error=false;
      this.nombreAsociado=this.DataService.getNombreCliente();
    }
    else{
        this.error=true;
        this.nombreAsociado='';
    }
    this.isLoading=false;
  }

  allowNumbers(event:any,key:string) {
    const charCode = event.charCode || event.keyCode;
    if ((charCode >= 48 && charCode <= 57) || charCode === 8 || charCode === 46) {
        if(this.product[key].length>0){
          return this.validateRange(this.product[key]+event.key);
        }
        else
        return true;
    }    
    return false;
}

  validateRange(input:string){
    const value=parseFloat(input);

    if (value >= 6 && value <=  30) {
      return true;
    }
    return false;
  }


  calcularInteresBeneficiar(){
    this.product['Interes Beneficiar']= this.formatNumber(
    Number(
      (Number(this.product['Deuda Actual'].replace(/[^0-9]/g, ''))*
      Number(this.product['Tasa Beneficiar'].replace(/[^0-9.]/g, ''))/
      1200).toFixed(0)));
    this.actualizarDiferencias();
  }

  fNumber(key:string) {
    let p=this.product[key].replace(/[^0-9.]/g, '');
    this.product[key] = p.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  documentoNumber() {
    let p=this.documentoAsociado.replace(/[^0-9]/g, '');
    this.documentoAsociado = p.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  formatNumber(value: number): string {
    return value.toLocaleString('en-US', {});
  }
}
