import { Component, OnInit } from '@angular/core';
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

export class ProductsComponent {
  constructor(private DataService: DataService) { }

  showCharts=false;

  tasaUsura = 28.8;

  interestRateCredit=13;
  interestRateRotatory=20;
  totalCreditos='';
  totalTarjetas='';
  liquidez = '';
  ingresos = '';
  plazoCredito = '';
  plazoRotativo = '';
  pagoCredito = '';
  pagoRotativo = '';
  interesCreditoActual = ''; 
  interesTarjetaActual = ''; 
  interesCreditoBeneficiar = ''; 
  interesRotativoBeneficiar = ''; 

  calculate(){
    this.interesTarjetaActual=((Number(this.calculateMonthlyPayment
      (Number(this.plazoRotativo),this.tasaUsura,Number(this.totalTarjetas)))*Number(this.plazoRotativo))
      -Number(this.totalTarjetas)).toFixed(0);

    this.pagoCredito=this.calculateMonthlyPayment(Number(this.plazoCredito), 
                  this.interestRateCredit,Number(this.totalCreditos)+Number(this.liquidez));
    this.interesCreditoBeneficiar=((Number(this.pagoCredito)*Number(this.plazoCredito))
      -(Number(this.totalCreditos)+Number(this.liquidez))).toFixed(0);
             
    this.pagoRotativo=this.calculateMonthlyPayment(Number(this.plazoRotativo),
                  this.interestRateRotatory,Number(this.totalTarjetas));
    this.interesRotativoBeneficiar=((Number(this.pagoRotativo)*Number(this.plazoRotativo))
      -(Number(this.totalTarjetas))).toFixed(0);
    this.generateResume();
  }

  getData(){
    if(this.DataService.getData().length>0)
      this.divisionProductos(this.DataService.getData());    
  }

  // Todos los Productos
  @ViewChild('todosLosProductos') todosLosProductos!: GenerateChartComponent;
  todosLosProductosList = Array<{ [key: string]: string }>;
  // Productos a Refinanciar
  @ViewChild('productosRefinanciamiento') productosRefinanciamiento!: GenerateChartComponent;
  productosRefinanciamientoList = Array<{ [key: string]: string }>;
  @ViewChild('tarjetasRefinanciamiento') tarjetasRefinanciamiento!: GenerateChartComponent;
  tarjetasRefinanciamientoList: any;
  @ViewChild('creditosRefinanciamiento') creditosRefinanciamiento!: GenerateChartComponent; // Corrected variable name
  creditosRefinanciamientoList : any;

  // Productos con Beneficiar
  @ViewChild('productosBeneficiar') productosBeneficiar!: GenerateChartComponent;
  productosBeneficiarList = Array<{ [key: string]: string }>;

  // Propuestas
  @ViewChild('creditosBeneficiar') creditosBeneficiar!: GenerateChartComponent;
  creditosBeneficiarList = Array<{ [key: string]: string }>;
  @ViewChild('tarjetasBeneficiar') tarjetasBeneficiar!: GenerateChartComponent;
  tarjetasBeneficiarList = Array<{ [key: string]: string }>;

  @ViewChild('resumenInteres') resumenInteres!:GenerateChartComponent;
  @ViewChild('resumenFlujoCaja') resumenFlujoCaja!:GenerateChartComponent;


// Function to filter products based on multiple key-value conditions
filterProducts = (filters: Array<{ key: string, value: string }>, productList: Array<{ [key: string]: string }>) => {
  return productList.filter(product =>
      filters.every(filter => product[filter.key] === filter.value)
  );
};

divisionProductos(productList: Array<{ [key: string]: string }>) {

  this.updateChartWithProducts(this.todosLosProductos, productList);

  this.updateChartWithProducts(this.productosRefinanciamiento,
      this.filterProducts([{ key: 'Refinanciamiento', value: 'true' }], productList));

  this.updateChartWithProducts(this.productosBeneficiar,
      this.filterProducts([{ key: 'Coop', value: 'true' }], productList));
  
  this.tarjetasRefinanciamientoList=
  this.filterProducts([
        { key: 'Refinanciamiento', value: 'true' },
        { key: 'Tarjeta', value: 'true' }]
        , productList);
  this.updateChartWithProducts(this.tarjetasRefinanciamiento,
    this.tarjetasRefinanciamientoList);

  this.creditosRefinanciamientoList=
  this.filterProducts([
          { key: 'Refinanciamiento', value: 'true' },
          { key: 'Tarjeta', value: 'false' }
      ], productList);
  this.updateChartWithProducts(this.creditosRefinanciamiento,
    this.creditosRefinanciamientoList);
  this.calcularTotalesRef();
}
  updateChartWithProducts(chart:GenerateChartComponent,productList: Array<{ [key: string]: string }>) {

    const interesActual = productList.map(product => Number(product["Interes Actual"] || 0));
    const interesBeneficiar = productList.map(product => Number(product["Interes Beneficiar"] || 0));
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
      pagoActualCreditos+=Number(this.creditosRefinanciamientoList[i]['Pago Mensual']);
    }
    let pagoActualTarjetas = 0;
    for(let i=0;i<this.tarjetasRefinanciamientoList.length;i++)
    {
      pagoActualTarjetas+=Number(this.tarjetasRefinanciamientoList[i]['Pago Mensual']);
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

  generateResume(){
    this.interestChart();
    this.paymentChart();
  }

  calcularTotalesRef(){
    
    this.totalCreditos=this.creditosRefinanciamiento.chartData.datasets[2]
      .data[this.creditosRefinanciamiento.chartData.datasets[2].data.length - 2];
    this.interesCreditoActual=this.creditosRefinanciamiento.chartData.datasets[1]
      .data[this.creditosRefinanciamiento.chartData.datasets[2].data.length - 2];

    this.totalTarjetas=this.tarjetasRefinanciamiento.chartData.datasets[2]
      .data[this.tarjetasRefinanciamiento.chartData.datasets[2].data.length - 2];
  }

  
  calculateMonthlyPayment(months: number, annualInterestRate: number, loanAmount: number): string {
    if(months>0 && annualInterestRate>0 && loanAmount>0){
      // Convert annual interest rate to a monthly rate (decimal form)
      const monthlyInterestRate = annualInterestRate / 100 / 12;
    
      // Calculate the monthly payment using the amortization formula
      const monthlyPayment = (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, months)) /
                            (Math.pow(1 + monthlyInterestRate, months) - 1);
      return monthlyPayment.toFixed(0);
    }
    return '';
  }
}


