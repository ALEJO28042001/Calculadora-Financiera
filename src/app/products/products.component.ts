import { Component, numberAttribute, OnInit } from '@angular/core';
import { GenerateChartComponent } from '../generate-chart/generate-chart.component';
import { ViewChild } from '@angular/core';
import { DataService } from '../Services/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [GenerateChartComponent, CommonModule,FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})

export class ProductsComponent implements OnInit{
  ngOnInit() {     
    if(this.DataService.getData().length>0)
      this.divisionProductos(this.DataService.getData());    
      this.apalancamiento = this.formatNumber(this.DataService.getApalancamiento());
  }
  constructor(private DataService: DataService) { }

    // Todos los Productos
    @ViewChild('todosLosProductos') todosLosProductos!: GenerateChartComponent;
    todosLosProductosList = Array<{ [key: string]: string }>;
    // Productos a Refinanciar
    // @ViewChild('productosRefinanciamiento') productosRefinanciamiento!: GenerateChartComponent;
    // productosRefinanciamientoList = Array<{ [key: string]: string }>;
    @ViewChild('tarjetasRefinanciamiento') tarjetasRefinanciamiento!: GenerateChartComponent;
    tarjetasRefinanciamientoList: any;
    @ViewChild('creditosRefinanciamiento') creditosRefinanciamiento!: GenerateChartComponent; // Corrected variable name
    creditosRefinanciamientoList : any;
  
    // Productos con Beneficiar
    // @ViewChild('productosBeneficiar') productosBeneficiar!: GenerateChartComponent;
    // productosBeneficiarList = Array<{ [key: string]: string }>;
  
    // Propuestas
    // @ViewChild('creditosBeneficiar') creditosBeneficiar!: GenerateChartComponent;
    // creditosBeneficiarList = Array<{ [key: string]: string }>;
    // @ViewChild('tarjetasBeneficiar') tarjetasBeneficiar!: GenerateChartComponent;
    // tarjetasBeneficiarList = Array<{ [key: string]: string }>;
  
    @ViewChild('resumenInteres') resumenInteres!:GenerateChartComponent;
    @ViewChild('resumenFlujoCaja') resumenFlujoCaja!:GenerateChartComponent;

  showCharts=false;
  tasaUsura = 28.8;
  tasaCreditoBeneficiar=13;
  tasaRotativoBeneficiar=20;
  totalCreditos='';
  totalTarjetas='';
  liquidez = '';
  ingresos = '';
  plazoCredito = 0;
  plazoRotativo = 0;
  pagoCredito = '';
  pagoRotativo = '';
  interesCreditoActual = ''; 
  interesTarjetaActual = ''; 
  interesCreditoBeneficiar = ''; 
  interesRotativoBeneficiar = '';
  apalancamiento=''; 

  calculate(){
    // Liquidación pagos, nuevos productos beneficiar
    this.pagoCredito=this.formatNumber(this.calculateMonthlyPayment(this.plazoCredito, 
      this.tasaCreditoBeneficiar,
      Number(this.totalCreditos.replace(/[^0-9]/g, ''))+Number(this.liquidez.replace(/[^0-9]/g, ''))));

    this.pagoRotativo=this.formatNumber(this.calculateMonthlyPayment(this.plazoRotativo,
      this.tasaRotativoBeneficiar,Number(this.totalTarjetas.replace(/[^0-9]/g, ''))));

    // Calculo de los intereses
    this.interesCreditoBeneficiar=this.formatNumber(
      (Number(this.pagoCredito.replace(/[^0-9]/g, ''))*this.plazoCredito)
      -(Number(this.totalCreditos.replace(/[^0-9]/g, ''))+
      Number(this.liquidez.replace(/[^0-9]/g, '')))); 

    this.interesRotativoBeneficiar=this.formatNumber(
      (Number(this.pagoRotativo.replace(/[^0-9]/g, ''))*this.plazoRotativo)
      -(Number(this.totalTarjetas.replace(/[^0-9]/g, ''))));  
      
    this.interesTarjetaActual=this.formatNumber(
        (Number(this.calculateMonthlyPayment(
        this.plazoRotativo,this.tasaUsura,
        (Number(this.totalTarjetas.replace(/[^0-9]/g, ''))))
      ))
        *this.plazoRotativo);
        -Number(this.totalTarjetas.replace(/[^0-9]/g, ''));
        console.log(this.interesTarjetaActual);
    
        this.generateResume();
  }




// Function to filter products based on multiple key-value conditions
filterProducts = (filters: Array<{ key: string, value: string }>, productList: Array<{ [key: string]: string }>) => {
  return productList.filter(product =>
      filters.every(filter => product[filter.key] === filter.value)
  );
};

divisionProductos(productList: Array<{ [key: string]: string }>) {
  console.log("Todos los Productos:",productList);

  // this.updateChartWithProducts(this.todosLosProductos, productList);
  // this.updateChartWithProducts(this.productosRefinanciamiento,
  //     this.filterProducts([{ key: 'Refinanciamiento', value: 'true' }], productList));
  // this.updateChartWithProducts(this.productosBeneficiar,
  //     this.filterProducts([{ key: 'Coop', value: 'true' }], productList));
  
  this.tarjetasRefinanciamientoList=
  this.filterProducts([
        { key: 'Refinanciamiento', value: 'true' },
        { key: 'Tarjeta', value: 'true' }]
        , productList);
  // this.updateChartWithProducts(this.tarjetasRefinanciamiento,
  //   this.tarjetasRefinanciamientoList);

  this.creditosRefinanciamientoList=
  this.filterProducts([
          { key: 'Refinanciamiento', value: 'true' },
          { key: 'Tarjeta', value: 'false' }
      ], productList);

  // this.updateChartWithProducts(this.creditosRefinanciamiento,
  //   this.creditosRefinanciamientoList);

  this.calcularTotalesRef();
}

  formatNumber(n:number) {
    return Number(n).
      toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });    
  }

  allowNumbers(event:any,tasa:number) {
    const charCode = event.charCode || event.keyCode;
    // Allow numbers (0-9), and control keys like backspace
    if ((charCode >= 48 && charCode <= 57) || charCode === 8 || charCode === 46) {
        if(tasa){
          return this.validateRange(tasa+event.key);
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

  calcularTotalesRef(){
    let totalCreditos=0;
    let interesCreditos=0;    
    let totalTarjetas=0;

    for(const index in this.creditosRefinanciamientoList){
      totalCreditos+=Number(this.creditosRefinanciamientoList[index]
        ['Deuda Actual'].replace(/[^0-9]/g, ''));
      interesCreditos+=Number(this.creditosRefinanciamientoList[index]
        ['Interes Actual'].replace(/[^0-9]/g, ''));
    }

    for(const index in this.tarjetasRefinanciamientoList){
      totalTarjetas+=Number(this.tarjetasRefinanciamientoList[index]
        ['Deuda Actual'].replace(/[^0-9]/g, ''));
    }

    this.totalCreditos=this.formatNumber(totalCreditos);
    this.totalTarjetas=this.formatNumber(totalTarjetas);
    
    this.interesCreditoActual=this.formatNumber(interesCreditos);
    
  }
  
  calculateMonthlyPayment(months: number, annualInterestRate: number, loanAmount: number): number {
    if(months>0 && annualInterestRate>0 && loanAmount>0){
      // Convert annual interest rate to a monthly rate (decimal form)
      const monthlyInterestRate = annualInterestRate / 100 / 12;
    
      // Calculate the monthly payment using the amortization formula
      const monthlyPayment = (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, months)) /
                            (Math.pow(1 + monthlyInterestRate, months) - 1);
      return monthlyPayment;
    }
    return 0;
  }

  generateResume(){
    this.interestChart();
    this.paymentChart();
  }

  interestChart(){
    this.resumenInteres.chartData.labels = ['Creditos','Tarjetas'];
    this.resumenInteres.chartData.datasets[0].data = [this.totalCreditos,this.totalTarjetas];
    this.resumenInteres.chartData.datasets[1].data = [this.interesCreditoActual,this.interesTarjetaActual];
    this.resumenInteres.chartData.datasets[2].data = [this.totalCreditos,this.totalTarjetas]; 
    this.resumenInteres.chartData.datasets[3].data = [this.interesCreditoBeneficiar,this.interesRotativoBeneficiar];
    this.resumenInteres.chart.update();
  }

  paymentChart(){
    let pagoActualCreditos = 0;
    for(let i=0;i<this.creditosRefinanciamientoList.length;i++)
    {
      pagoActualCreditos+=Number(this.creditosRefinanciamientoList[i]['Pago Mensual'].replace(/[^0-9]/g, ''));
    }
    let pagoActualTarjetas = 0;
    for(let i=0;i<this.tarjetasRefinanciamientoList.length;i++)
    {
      pagoActualTarjetas+=Number(this.tarjetasRefinanciamientoList[i]['Pago Mensual'].replace(/[^0-9]/g, ''));
    }

    this.resumenFlujoCaja.chartData.labels = ['Creditos','Tarjetas'];
    this.resumenFlujoCaja.chartData.datasets = [{
      label: 'Pago Beneficiar',
      data: [this.pagoCredito,this.pagoRotativo],
      backgroundColor: 'rgba(235, 109, 27, 0.6)',
      borderColor: 'rgba(235, 109, 27, 0.6)',
      borderWidth: 1,
      stack: 'Stack 0'
      },
      {
      label: 'Ahorro Beneficiar',
      data: [this.ingresos],
      backgroundColor: 'rgba(0, 255, 0, 0.6)',
      borderColor: 'rgba(0, 255, 0, 0.6)',
      borderWidth: 1,
      stack: 'Stack 0'
      },
      {
        label: 'Pago Actual',
        data: [pagoActualCreditos,pagoActualTarjetas],
        backgroundColor: 'rgba(75, 192, 192, 1)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        stack: 'Stack 1'
      },
    ];
    
    this.resumenFlujoCaja.chart.update();
  }

  updateChartWithProducts(chart:GenerateChartComponent,productList: Array<{ [key: string]: string }>) {

    const interesActual = productList.map(product => 
      Number(product["Interes Actual"]|| 0));
    const interesBeneficiar = productList.map(product => 
      Number(product["Interes Beneficiar"].replace || 0));
    const deudaActual = productList.map(product => Number(product["Deuda Actual"] || 0));

    const totalActual = interesActual.reduce((sum, currentValue) => sum + currentValue, 0);
    const totalBeneficiar = interesBeneficiar.reduce((sum, currentValue) => sum + currentValue, 0);
    const diferenciaTotal = totalActual - totalBeneficiar;

    chart.chartData.labels = productList.map(product => product["Nombre Producto"] || '');
    
    chart.chartData.datasets[0].data = deudaActual;
    chart.chartData.datasets[1].data = interesActual;
    chart.chartData.datasets[2].data = deudaActual; 
    chart.chartData.datasets[3].data = interesBeneficiar;

    chart.chartData.labels.push('Total');
    chart.chartData.datasets[0].data.push(deudaActual.reduce((sum, current) => sum + current, 0)); 
    chart.chartData.datasets[2].data.push(totalBeneficiar); 
    chart.chartData.datasets[1].data.push(totalActual); 
    chart.chartData.datasets[3].data.push(totalBeneficiar); 

    chart.chartData.datasets[4].data.push(diferenciaTotal);

    chart.chart.update();
  }
}


