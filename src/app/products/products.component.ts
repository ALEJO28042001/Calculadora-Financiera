import { RouterOutlet } from '@angular/router';
import { Component, numberAttribute, OnInit } from '@angular/core';
import { GenerateChartComponent } from '../generate-chart/generate-chart.component';
import { ViewChild } from '@angular/core';
import { DataService } from '../Services/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [GenerateChartComponent, CommonModule,FormsModule, RouterOutlet],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  info: Info = {
    'todosLosProductosList': [],
    'tarjetasRefinanciamientoList': [],
    'creditosRefinanciamientoList': [],
    'tasaUsura': 28.8,
    'tasaCreditoBeneficiar': 13,
    'tasaRotativoBeneficiar': 20,
    'totalCreditos': '',
    'totalTarjetas': '',
    'liquidez': '',
    'aportes': '',
    'plazoCredito': '',
    'plazoRotativo': '',
    'pagoCreditoBeneficiar': '',
    'pagoRotativoBeneficiar': '',
    'pagoCreditoActual': '',
    'pagoRotativoActual': '',
    'interesCreditoActual': '',
    'interesTarjetaActual': '',
    'interesCreditoBeneficiar': '',
    'interesRotativoBeneficiar': '',
    'apalancamiento': '',
    'nombreAsociado': '',
    'totalPagoBeneficiar':0,
    'totalPagoActual':0,
    'diferenciaPagos':0
  };

  @ViewChild('todosLosProductos') todosLosProductos!: GenerateChartComponent;
  @ViewChild('tarjetasRefinanciamiento') tarjetasRefinanciamiento!: GenerateChartComponent;
  @ViewChild('creditosRefinanciamiento') creditosRefinanciamiento!: GenerateChartComponent;
  @ViewChild('resumenInteres') resumenInteres!: GenerateChartComponent;
  @ViewChild('resumenFlujoCaja') resumenFlujoCaja!: GenerateChartComponent;

  constructor(private DataService: DataService) {}

  calcularAhorro(salario:number){return this.formatNumber(salario*0.06)}
  ngOnInit() {
    if (this.DataService.getData().length > 0) {
      this.info["apalancamiento"] = this.formatNumber(this.DataService.getApalancamiento());
      this.info["nombreAsociado"] = this.DataService.getNombreCliente();
      this.divisionProductos(this.DataService.getData());
      this.info['aportes'] = this.calcularAhorro(this.DataService.getInfoCliente()['Salario']);
      this.getPagosActuales();      
    }
  }
  getPagosActuales(){
    let pagoActualTarjetas = 0;
    if(this.info['totalTarjetas']!==''){
        for (let i = 0; i < this.info["tarjetasRefinanciamientoList"].length; i++) {
          pagoActualTarjetas += Number(
            this.info["tarjetasRefinanciamientoList"][i]["Pago Mensual"].replace(/[^0-9]/g, '')
          );
        }  
      this.info["pagoRotativoActual"] = this.formatNumber(pagoActualTarjetas);
    }
    if(this.info['totalCreditos']!==''){
      let pagoActualCreditos = 0;    
      for (let i = 0; i < this.info["creditosRefinanciamientoList"].length; i++) {
        pagoActualCreditos += Number(
          this.info["creditosRefinanciamientoList"][i]["Pago Mensual"].replace(/[^0-9]/g, ''));
      }
      this.info["pagoCreditoActual"] = this.formatNumber(pagoActualCreditos);
    }
  }
  getKeys(){return  Object.keys(this.info);}

  calculate() {
    if(Number(this.info['plazoCredito'])>0 && this.info["tasaCreditoBeneficiar"]!=='' && 
      (this.info["totalCreditos"]!=='' || this.info["liquidez"]!=='')){
        this.info["pagoCreditoBeneficiar"] = this.formatNumber(
          this.calculateMonthlyPayment(
            this.info["plazoCredito"],
            this.info["tasaCreditoBeneficiar"],
            Number(this.info["totalCreditos"].replace(/[^0-9]/g, '')) +
              Number(this.info["liquidez"].replace(/[^0-9]/g, ''))
          )
        );   
        this.info["interesCreditoBeneficiar"] = this.formatNumber(
          Number((Number(this.info['tasaCreditoBeneficiar'])*
          (Number(this.info["totalCreditos"].replace(/[^0-9]/g, '')) +
          Number(this.info["liquidez"].replace(/[^0-9]/g, '')))/1200).toFixed(0))
            
        );
      
    }
    else{
      this.info["interesCreditoBeneficiar"]= '';
      this.info["pagoCreditoBeneficiar"] = '';
    } 
  
    if(Number(this.info['plazoRotativo'])>0 && this.info["tasaRotativoBeneficiar"]!=='' && 
      this.info["totalTarjetas"]!==''){
      
      this.info["pagoRotativoBeneficiar"] = 
      this.formatNumber(this.calculateMonthlyPayment(
          this.info["plazoRotativo"],
          this.info["tasaRotativoBeneficiar"],
          Number(this.info["totalTarjetas"].replace(/[^0-9]/g, ''))));  

      this.info["interesRotativoBeneficiar"] = 
      this.formatNumber(
        Number((Number(this.info['tasaRotativoBeneficiar'])*
        (Number(this.info["totalTarjetas"].replace(/[^0-9]/g, '')))/1200).toFixed(0)));

      this.info["interesTarjetaActual"] = 
      this.formatNumber(
        Number((Number(this.info['tasaUsura'])*
        (Number(this.info["totalTarjetas"].replace(/[^0-9]/g, '')))/1200).toFixed(0)));      
    }
    else{
      this.info["interesRotativoBeneficiar"]= '';
      this.info["pagoRotativoBeneficiar"] = '';
      this.info["interesTarjetaActual"]='';
    }       
  }

  calcularTotalesRef() {
    let totalCreditos = 0;
    let interesCreditos = 0;
    let totalTarjetas = 0;

    for (const index in this.info["creditosRefinanciamientoList"]) {
      totalCreditos += Number(
        this.info["creditosRefinanciamientoList"][index]["Deuda Actual"].replace(/[^0-9]/g, '')
      );
      interesCreditos += Number(
        this.info["creditosRefinanciamientoList"][index]["Interes Actual"].replace(/[^0-9]/g, '')
      );
    }

    for (const index in this.info["tarjetasRefinanciamientoList"]) {
      totalTarjetas += Number(
        this.info["tarjetasRefinanciamientoList"][index]["Deuda Actual"].replace(/[^0-9]/g, '')
      );
    }
    this.info["totalCreditos"] = this.formatNumber(totalCreditos);
    this.info["totalTarjetas"] = this.formatNumber(totalTarjetas);
    this.info["interesCreditoActual"] = this.formatNumber(interesCreditos);
  }

  interestChart() {
    this.resumenInteres.chartData.labels = ['Creditos', 'Rotativo'];
    this.resumenInteres.chartData.datasets = [
  {
    label: 'Interes Actual Creditos',
    data: [
      this.info["interesCreditoActual"].replace(/[^0-9]/g, ''),
      this.info["interesTarjetaActual"].replace(/[^0-9]/g, ''),
    ],
    backgroundColor: 'rgba(75, 192, 192, 0.6)',
    borderColor: 'rgba(75, 192, 192, 1)',
    borderWidth: 1,
    stack: 'Actual',
  },
  {
    label: 'Interes Beneficiar Creditos',
    data: [
      Number(((this.info['tasaCreditoBeneficiar'] *
        Number(this.info["totalCreditos"].replace(/[^0-9]/g, ''))) /1200).toFixed(0)
      ),
      this.info["interesRotativoBeneficiar"].replace(/[^0-9]/g, ''),
    ],
    backgroundColor: 'rgba(235, 109, 27, 0.6)',
    borderColor: 'rgba(235, 109, 27, 0.6)',
    borderWidth: 1,
    stack: 'Beneficiar',
  },
  {
    label: 'Interes Liquidez',
    data: [
      Number(
        (
          (this.info['tasaCreditoBeneficiar'] *
            Number(this.info["liquidez"].replace(/[^0-9]/g, ''))) /
          1200
        ).toFixed(0)
      ),
      0,
    ],
    backgroundColor: 'rgba(0, 109, 27, 0.6)',
    borderColor: 'rgba(0, 109, 27, 1)',
    borderWidth: 1,
    stack: 'Beneficiar',
  },
];

console.log(
  "INTERES LIQUIDEZ:",
  Number(
    (
      (this.info['tasaCreditoBeneficiar'] *
        Number(this.info["liquidez"].replace(/[^0-9]/g, ''))) /
      1200
    ).toFixed(0)
  )
);

    this.resumenInteres.chart.update();
  }
  
  paymentChart() {

    this.info['totalPagoBeneficiar'] = Number(this.info['aportes'].replace(/[^0-9]/g, ''))
    +Number(this.info['pagoCreditoBeneficiar'].replace(/[^0-9]/g, ''))
    +Number(this.info['pagoRotativoBeneficiar'].replace(/[^0-9]/g, ''));

    this.info['totalPagoActual'] = Number(this.info['aportes'].replace(/[^0-9]/g, ''))
        +Number(this.info['pagoCreditoActual'].replace(/[^0-9]/g, ''))
        +Number(this.info['pagoRotativoActual'].replace(/[^0-9]/g, ''));

    this.info['diferenciaPagos'] = this.info['totalPagoActual']-this.info['totalPagoBeneficiar'];

    this.resumenFlujoCaja.chartData.labels = ['Pago Beneficiar','Pago Actual','Diferencia'];
    this.resumenFlujoCaja.chartData.datasets = [
      {
        label: 'Total Pago Beneficiar',
        data: [this.info['totalPagoBeneficiar']],
        backgroundColor: 'rgb(82, 204, 0)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Aportes',
        data: [this.info["aportes"].replace(/[^0-9]/g, '')],
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderColor: 'rgba(235, 109, 27, 0.6)',
        borderWidth: 1,
        stack: 'Beneficiar',
      },
      
      {
        label: 'Pago Beneficiar Liquidez',
        data: [this.calculateMonthlyPayment(
          this.info["plazoCredito"],
          this.info["tasaCreditoBeneficiar"],
          Number(this.info["liquidez"].replace(/[^0-9]/g, '')))
          , 0],
        backgroundColor: 'rgba(235, 0, 27, 0.6)',
        borderColor: 'rgba(235, 109, 27, 0.6)',
        borderWidth: 1,
        stack: 'Beneficiar',
      },
      {
        label: 'Pago Beneficiar Credito',
        data: [this.calculateMonthlyPayment(
          this.info["plazoCredito"],
          this.info["tasaCreditoBeneficiar"],
          Number(this.info["totalCreditos"].replace(/[^0-9]/g, '')))
          , 0],
        backgroundColor: 'rgba(235, 0, 27, 0.6)',
        borderColor: 'rgba(235, 109, 27, 0.6)',
        borderWidth: 1,
        stack: 'Beneficiar',
      },
      {
        label: 'Pago Beneficiar Rotativo',
        data: [this.info["pagoRotativoBeneficiar"].replace(/[^0-9]/g, ''), 0],
        backgroundColor: 'rgba(235, 109, 27, 0.6)',
        borderColor: 'rgba(235, 109, 27, 0.6)',
        borderWidth: 1,
        stack: 'Beneficiar',
      },
      {
        label: 'Aportes',
        data: [,this.info["aportes"].replace(/[^0-9]/g, '')],
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderColor: 'rgba(235, 109, 27, 0.6)',
        borderWidth: 1,
        stack: 'Actual',
      },      
      {
        label: 'Pago Actual Creditos',
        data: [,this.info['pagoCreditoActual'].replace(/[^0-9]/g, '')],
        backgroundColor: 'rgba(0, 192, 0, 1)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        stack: 'Actual',
      },
      {
        label: 'Pago Actual Tarjetas',
        data: [,this.info['pagoRotativoActual'].replace(/[^0-9]/g, '')],
        backgroundColor: 'rgba(75, 192, 192, 1)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        stack: 'Actual',
      },
      {
        label: 'Total Pago Actual',
        data: [,this.info['totalPagoActual']],
        backgroundColor: 'rgb(0, 9, 133)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },      
      {
        label: 'Diferencia',
        data: [,,this.info['diferenciaPagos']],
        backgroundColor: 'rgb(170, 0, 128)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }

    ];

    
    
    this.resumenFlujoCaja.chart.update();
  }

  formatNumber(value: number): string {
    return value.toLocaleString('en-US', {maximumFractionDigits:0});
  }
  fNumber(key:string) {
    let p=this.info[key].replace(/[^0-9]/g, '');
    this.info[key] = p.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }  
  calculateMonthlyPayment(plazo: number, tasa: number, monto: number): number {
    const monthlyRate = tasa / 100 / 12; // Convert annual rate to monthly rate
    if (plazo === 0 || monto === 0) {
      return 0;
    }
    return (monto * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -plazo));
  }
  divisionProductos(data: any[]): void {
    this.info["creditosRefinanciamientoList"] = data.filter(
      (item) => item['Tarjeta'] === 'false' && item['Refinanciamiento'] === 'true');
    this.info["tarjetasRefinanciamientoList" ] = data.filter(
      (item) => item['Tarjeta'] === 'true' && item['Refinanciamiento'] === 'true');
  
    this.info["todosLosProductosList"] = data;
      this.calcularTotalesRef();
  }
  generateResume(): void {
    this.paymentChart();
    this.interestChart();
  }     

  displayName(n:string):string{
    n= n
    // Insert a space before each uppercase letter
    .replace(/([A-Z])/g, ' $1')
    // Capitalize the first letter of each word
    return n;
  }

  getCategorizedKeys() {
    return {
      general: [
        'aportes', 
        'apalancamiento', 
        'nombreAsociado'
      ],
      credit: [
        // 'plazoCredito',
        'totalCreditos', 
        'pagoCreditoActual', 
        'pagoCreditoBeneficiar',
        'interesCreditoActual', 
        'interesCreditoBeneficiar', 
      ],
      rotativo: [
        // 'plazoRotativo', 
        'totalTarjetas', 
        'pagoRotativoActual', 
        'pagoRotativoBeneficiar',
        'interesTarjetaActual', 
        'interesRotativoBeneficiar', 
      ]
    };
  }  

  allowNumbers(event:any,key:string) {
    const charCode = event.charCode || event.keyCode;
    // Allow numbers (0-9), and control keys like backspace
    if ((charCode >= 48 && charCode <= 57) || charCode === 8 || charCode === 46) {
        if(this.info[key].length>0){
          return this.validateRange(this.info[key]+event.key);
        }
        else
        return true;
    }    
    return false; // Block other characters
}
allowNumbers2(event:any) {
  const charCode = event.charCode || event.keyCode;
  // Allow numbers (0-9), and control keys like backspace
  if (charCode >= 48 && charCode <= 57) {
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

    
interface Info {
  [key: string]:any;
}


