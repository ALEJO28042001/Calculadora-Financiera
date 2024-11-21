import { DataService } from './../Services/data.service';
import { Component, Input, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fields-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fields-manager.component.html',
  styleUrl: './fields-manager.component.css'
})
export class FieldsManagerComponent implements OnInit{
  constructor(private DataService: DataService) { }
  documento='';
  
  isRef: boolean = false;
  isTarjeta: boolean = false;
  productList: Array<{ [key: string]: string }> = [];
  selectedProductIndex: number | null = null; // For editing/deleting selected product
  showAllProducts = false; // To toggle product display

  ngOnInit() { 
    this.productList = this.DataService.getData();
    this.documento=this.DataService.documento;
  }
  
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

  addProduct() {   
    this.showInputValues();
    if (this.selectedProductIndex === null) {
      // Add a new product
      this.productList.push({ ...this.product });
    } else {
      // Update existing product
      this.productList[this.selectedProductIndex] = { ...this.product };
    }
    // this.resetForm();      
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
  }

  // Function to delete a product
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
  showInputValues() {  
      let amount = Number(this.product['Deuda Actual']);
      let months = Number(this.product['Plazo Actual']);
      let pago = Number(this.product['Pago Mensual']);
      
      if(amount>0 && months>0 && pago>0)
      {
         let tasaReal=((this.findInterestRate(pago,
          amount, months) 
          * 100 * 12));
        this.product['Tasa Real']=tasaReal.toFixed(2);
        this.product['Diferencia Tasas'] = (Number(this.product['Tasa Beneficiar'])-Number(this.product['Tasa Real'])).toFixed(2);
        this.product['Interes Actual'] = ((months*pago)-amount).toFixed(0);
      }      
    }   

  saveData() {
    this.DataService.setData(this.productList);
  }

  searchData(){
    this.resetForm();
    this.DataService.pullData(this.documento);
    this.productList = this.DataService.getData();
    this.DataService.documento=this.documento;
  }

  allowNumbers(event:any) {
    const charCode = event.charCode || event.keyCode;
    // Allow numbers (0-9), and control keys like backspace
    if ((charCode >= 48 && charCode <= 57) || charCode === 8 || charCode === 46) {
        if(this.product[this.keys[8]].length>0){
          return this.validateRange(this.product[this.keys[8]]+event.key);
        }
        else
        return true;
    }    
    return false; // Block other characters
}

  validateRange(input:string){
    const value=parseFloat(input);

    if (value >= 6 && value <=  30) {
      return true;
    }
    return false;
  }
}
