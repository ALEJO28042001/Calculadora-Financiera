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
      this.pagosActuales();
      
    }
  }
  pagosActuales(){
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
          Number(this.info["pagoCreditoBeneficiar"].replace(/[^0-9]/g, '')) * this.info["plazoCredito"] -
            (Number(this.info["totalCreditos"].replace(/[^0-9]/g, '')) +
              Number(this.info["liquidez"].replace(/[^0-9]/g, '')))
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

      this.info["interesRotativoBeneficiar"] = this.formatNumber(
        Number(this.info["pagoRotativoBeneficiar"].replace(/[^0-9]/g, '')) * this.info["plazoRotativo"] -
        Number(this.info["totalTarjetas"].replace(/[^0-9]/g, '')));

      this.info["interesTarjetaActual"] = 
        this.formatNumber(Number(this.calculateMonthlyPayment(
          this.info["plazoRotativo"],
          this.info["tasaUsura"],
          Number(this.info["totalTarjetas"].replace(/[^0-9]/g, '')))
          ) * this.info["plazoRotativo"] -
          Number(this.info["totalTarjetas"].replace(/[^0-9]/g, '')));

      
    }
    else{
      this.info["interesRotativoBeneficiar"]= '';
      this.info["pagoRotativoBeneficiar"] = '';
      this.info["interesTarjetaActual"]='';
    }   

    
    // this.generateResume();
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
    this.resumenInteres.chartData.datasets[0].data = [
      this.info["totalCreditos"].replace(/[^0-9]/g, ''),
      this.info["totalTarjetas"].replace(/[^0-9]/g, ''),
    ];
    this.resumenInteres.chartData.datasets[1].data = [
      this.info["interesCreditoActual"].replace(/[^0-9]/g, ''),
      this.info["interesTarjetaActual"].replace(/[^0-9]/g, ''),
    ];
    this.resumenInteres.chartData.datasets[2].data = [      
      this.info["totalCreditos"].replace(/[^0-9]/g, ''),
      this.info["totalTarjetas"].replace(/[^0-9]/g, ''),
    ];
    
    this.resumenInteres.chartData.datasets[3].data = [
      this.info["interesCreditoBeneficiar"].replace(/[^0-9]/g, ''),
      this.info["interesRotativoBeneficiar"].replace(/[^0-9]/g, ''),
    ];


    this.resumenInteres.chartData.datasets.push({
      label: 'Liquidez',
      data: [
        this.info["liquidez"].replace(/[^0-9]/g, ''),
      ],
      backgroundColor: 'rgba(0  , 109, 27, 0.6)',
      borderColor: 'rgba(235, 109, 27, 0.6)',
      borderWidth: 1,
      stack: 'Stack 1',
    })
    this.resumenInteres.chart.update();
  }

  paymentChart() {
    

    this.resumenFlujoCaja.chartData.labels = ['Creditos', 'Rotativo'];
    this.resumenFlujoCaja.chartData.datasets = [
      {
        label: 'Pago Beneficiar',
        data: [
          this.info["pagoCreditoBeneficiar"].replace(/[^0-9]/g, ''),
          this.info["pagoRotativoBeneficiar"].replace(/[^0-9]/g, ''),
        ],
        backgroundColor: 'rgba(235, 109, 27, 0.6)',
        borderColor: 'rgba(235, 109, 27, 0.6)',
        borderWidth: 1,
        stack: 'Stack 0',
      },
      {
        label: 'Aportes',
        data: [
          this.info["aportes"].replace(/[^0-9]/g, ''),
        ],
        backgroundColor: 'rgba(0, 255, 0, 0.6)',
        borderColor: 'rgba(235, 109, 27, 0.6)',
        borderWidth: 1,
        stack: 'Stack 0',
      },
      {
        label: 'Pago Actual',
        data: [this.info['pagoActualCreditos'], this.info['pagoActualTarjetas']],
        backgroundColor: 'rgba(75, 192, 192, 1)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        stack: 'Stack 1',
      },
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
  
    // Update "todosLosProductosList" with all items
    this.info["todosLosProductosList"] = data;
  
    // Update charts or related components if necessary
    // this.todosLosProductos.chartData = { labels: [], datasets: [] };
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


