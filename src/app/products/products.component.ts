import { RouterOutlet } from '@angular/router';
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
export class ProductsComponent implements OnInit {

  
  info: Info = {
    'todosLosProductosList': [],
    'tarjetasRefinanciamientoList': [],
    'creditosRefinanciamientoList': [],
    'productosRefinanciamientoList': [],
    'productosNoRefinanciamientoList': [],
    'tasaUsura': 28.8,
    'tasaCreditoBeneficiar': 13,
    'tasaRotativoBeneficiar': 20,
    'totalCreditos': '',
    'totalTarjetas': '',
    'valorRequerido': '',
    'cuotaAportes': '',
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
    'saldoAportes': '',
    'nombre': '',
    'totalPagoBeneficiar':0,
    'totalPagoActual':0,
    'diferenciaPagos':0,
    'ingresos':'',
    'isApalancamiento':false,
    'valorApalancamiento':'',
  }

  

  infoCliente: Info ={

  }
  
  getEsAsociado(){return this.DataService.getEsAsociado()}
  getCompraCartera(){return this.DataService.getCompraCartera()}
  calcularAportes(){this.info['cuotaAportes']=this.formatNumber(Number(this.info['ingresos'].replace(/[^0-9]/g, ''))*0.06);
    this.situacionFutura['aportes']=this.info['cuotaAportes'];

  }

  situacionActual: Info= {
    'deudaTotal': '',
    'pagoMensual': '',
    'tasa+Costos': 0,
    'costoFinanciero': '',
    'aportes':''
  }
  situacionFutura: Info= {
    'deudaTotal': '',
    'pagoMensual': '',
    'tasa+Costos': 0,
    'costoFinanciero': '',
    'aportes':''
  }
  diferenciasSituaciones: Info= {
    'deudaTotal': '',
    'pagoMensual': '',
    'tasa+Costos': 0,
    'costoFinanciero': '',
    'aportes':''
  }
  diferenciasSituaciones2: Info= {
    'valorRequerido':'',
    'diferenciaPago':'',
    'diferenciaTasa':'',
    'diferenciaCosto':'',
    'diferenciaAportes':''
  }

   dataComparacion = {
    'labels': ['Deuda Total', 'Pago Mensual', 'Tasa + Costos', 'Costo Financiero', 'Aportes'],
   }



  @ViewChild('todosLosProductos') todosLosProductos!: GenerateChartComponent;
  @ViewChild('tarjetasRefinanciamiento') tarjetasRefinanciamiento!: GenerateChartComponent;
  @ViewChild('creditosRefinanciamiento') creditosRefinanciamiento!: GenerateChartComponent;
  @ViewChild('resumenInteres') resumenInteres!: GenerateChartComponent;
  @ViewChild('resumenFlujoCaja') resumenFlujoCaja!: GenerateChartComponent;
  @ViewChild('comparacionSituaciones') comparacionSituaciones!: GenerateChartComponent;

  constructor(private DataService: DataService) {}

  calcularAhorro(salario:number){return this.formatNumber(salario*0.06)}
  getKeysObject(o:Object){return Object.keys(o)}

  getSaldoAportes(){return this.DataService.getSaldoAportes()}

  ngOnInit() {
      this.info["saldoAportes"] = this.formatNumber(this.DataService.getSaldoAportes() || 0);
      this.info["nombre"] = this.DataService.getNombreCliente();
      this.info['cuotaAportes'] = this.DataService.getAportes();
      this.situacionFutura['aportes']=this.info['cuotaAportes'];
      this.situacionActual['aportes']=this.info['cuotaAportes']|| '';

      this.info['ingresos'] = this.formatNumber(Number(this.DataService.getSalario()) || 0);
      this.divisionProductos(this.DataService.getData());
      this.getPagosActuales();    
      this.infoCliente=this.DataService.getInfoCliente();  
      this.calcularTotalesRef();
      // this.DataService.productosDataCredito();
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

    this.situacionActual['pagoMensual']=this.formatNumber(
      Number(this.info["pagoCreditoActual"].replace(/[^0-9]/g, ''))+
      Number(this.info["pagoRotativoActual"].replace(/[^0-9]/g, '')));
    
    this.situacionActual['deudaTotal']=this.formatNumber(
      Number(this.info["totalCreditos"].replace(/[^0-9]/g, ''))+
      Number(this.info["totalTarjetas"].replace(/[^0-9]/g, '')));
      // Number(this.info["cuotaAportes"].replace(/[^0-9]/g, '')));

    let tasaPonderadaActual = 0;    
    for (let i = 0; i < this.info["productosRefinanciamientoList"].length; i++) {
      tasaPonderadaActual += Number(
        this.info["productosRefinanciamientoList"][i]["Tasa Real"]);
    }
    this.situacionActual["tasa+Costos"] = (tasaPonderadaActual/this.info['productosRefinanciamientoList'].length||0).toFixed(2);      
  }

  calculate() {
    if(Number(this.info['plazoCredito'])>0 && this.info["tasaCreditoBeneficiar"]!=='' && 
      (this.info["totalCreditos"]!=='' || this.info["valorRequerido"]!=='')){
        this.info["pagoCreditoBeneficiar"] = this.formatNumber(
          this.calculateMonthlyPayment(
            this.info["plazoCredito"],
            this.info["tasaCreditoBeneficiar"],
            Number(this.info["totalCreditos"].replace(/[^0-9]/g, '')) +
              Number(this.info["valorRequerido"].replace(/[^0-9]/g, ''))
          )
        );   
        this.info["interesCreditoBeneficiar"] = this.formatNumber(
          Number((Number(this.info['tasaCreditoBeneficiar'])*
          (Number(this.info["totalCreditos"].replace(/[^0-9]/g, '')) +
          Number(this.info["valorRequerido"].replace(/[^0-9]/g, '')))/1200).toFixed(0))
            
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
    this.situacionFutura['pagoMensual']=this.formatNumber(
      Number(this.info["pagoCreditoBeneficiar"].replace(/[^0-9]/g, ''))+
      Number(this.info["pagoRotativoBeneficiar"].replace(/[^0-9]/g, '')));


      if (this.info['interesCreditoBeneficiar'] && this.info['interesRotativoBeneficiar']) {
        this.situacionFutura['deudaTotal'] = this.formatNumber(
          Number(this.info["totalCreditos"].replace(/[^0-9]/g, ''))+
          Number(this.info["totalTarjetas"].replace(/[^0-9]/g, ''))+
          Number(this.info["valorRequerido"].replace(/[^0-9]/g, '')));
      } else if (this.info['interesCreditoBeneficiar']) {
          this.situacionFutura['deudaTotal'] = this.formatNumber(
            Number(this.info["totalCreditos"].replace(/[^0-9]/g, ''))+
            Number(this.info["valorRequerido"].replace(/[^0-9]/g, '')));
      } else if (this.info['interesRotativoBeneficiar']) {
          this.situacionFutura['deudaTotal'] = this.formatNumber(
            Number(this.info["totalTarjetas"].replace(/[^0-9]/g, '')));
      }  

      if (Number(this.info['interesCreditoBeneficiar'].replace(/[^0-9]/g, ''))>0 && Number(this.info['interesRotativoBeneficiar'].replace(/[^0-9]/g, ''))>0) {
        this.situacionFutura['tasa+Costos'] = 
            (this.info['tasaCreditoBeneficiar'] + this.info['tasaRotativoBeneficiar']) / 2;
            
      } else if (Number(this.info['interesCreditoBeneficiar'].replace(/[^0-9]/g, ''))>0) {
          this.situacionFutura['tasa+Costos'] = this.info['tasaCreditoBeneficiar'];
      } else if (Number(this.info['interesRotativoBeneficiar'].replace(/[^0-9]/g, ''))>0) {
          this.situacionFutura['tasa+Costos'] = this.info['tasaRotativoBeneficiar'];
      }      


    this.situacionActual['costoFinanciero']=this.formatNumber(
      Number(this.info["interesCreditoActual"].replace(/[^0-9]/g, ''))+
      Number(this.info["interesTarjetaActual"].replace(/[^0-9]/g, '')));

    this.situacionFutura['costoFinanciero']=this.formatNumber(
      Number(this.info["interesCreditoBeneficiar"].replace(/[^0-9]/g, ''))+
      Number(this.info["interesRotativoBeneficiar"].replace(/[^0-9]/g, '')));
    
    
      this.diferenciasSituaciones['tasa+Costos']=(this.situacionActual['tasa+Costos']-
        this.situacionFutura['tasa+Costos']).toFixed(2);


      ['deudaTotal', 'pagoMensual', 'costoFinanciero', 'aportes'].forEach(element => {
        this.diferenciasSituaciones[element]=this.formatNumber(
        Number((this.situacionActual[element]||'').replace(/[^0-9.]/g, ''))-
        Number((this.situacionFutura[element]||'').replace(/[^0-9.]/g, ''))||0)
    });


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

  comparacionChart(){
    this.comparacionSituaciones.chartData.labels=this.dataComparacion.labels;
    var datosSituacionActual: number[] = [];
    var datosSituacionFutura: number[] = [];
    var datosSituacionDiferencia: number[] = [];
        // Extract and process data
    Object.keys(this.situacionActual).forEach(key => {
      // Clean and parse values, falling back to 0 if the value is empty or invalid
      datosSituacionActual.push(
        Number((this.situacionActual[key]?.toString().replace(/[^0-9.]/g, '')) || 0)
      );
      datosSituacionFutura.push(
        Number((this.situacionFutura[key]?.toString().replace(/[^0-9.]/g, '')) || 0)
      );
      datosSituacionDiferencia.push(
        Number((this.diferenciasSituaciones[key]?.toString().replace(/[^0-9.]/g, '')) || 0)
      );
    });
    this.comparacionSituaciones.chartData.datasets=[
      {
        label: 'Situación Actual',
        data: datosSituacionActual,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Situación Futura',
        data: datosSituacionFutura,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Diferencias',
        data: datosSituacionDiferencia,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ];
    this.comparacionSituaciones.chart.update();
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
    label: 'Interes valorRequerido',
    data: [
      Number(
        (
          (this.info['tasaCreditoBeneficiar'] *
            Number(this.info["valorRequerido"].replace(/[^0-9]/g, ''))) /
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



    this.resumenInteres.chart.update();
  }
  
  paymentChart() {
    

    this.info['totalPagoBeneficiar'] = Number(this.info['cuotaAportes'].replace(/[^0-9]/g, ''))
    +Number(this.info['pagoCreditoBeneficiar'].replace(/[^0-9]/g, ''))
    +Number(this.info['pagoRotativoBeneficiar'].replace(/[^0-9]/g, ''));

    this.info['totalPagoActual'] = Number(this.info['cuotaAportes'].replace(/[^0-9]/g, ''))
        +Number(this.info['pagoCreditoActual'].replace(/[^0-9]/g, ''))
        +Number(this.info['pagoRotativoActual'].replace(/[^0-9]/g, ''));

    this.info['diferenciaPagos'] = this.info['totalPagoActual']-this.info['totalPagoBeneficiar'];

    this.resumenFlujoCaja.chartData.labels = ['Pago Beneficiar','Pago Actual','Diferencia'];
    this.resumenFlujoCaja.chartData.datasets = [
      {
        label: 'Total Pago Beneficiar',
        data: [this.info['totalPagoBeneficiar'],null,null],
        backgroundColor: 'rgb(82, 204, 0)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'cuotaAportes',
        data: [this.info["aportes"]?.toString().replace(/[^0-9]/g, ''),null,null],
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderColor: 'rgba(235, 109, 27, 0.6)',
        borderWidth: 1,
        stack: 'Beneficiar',
      },
      
      {
        label: 'Pago Beneficiar valorRequerido',
        data: [this.calculateMonthlyPayment(
          this.info["plazoCredito"],
          this.info["tasaCreditoBeneficiar"],
          Number(this.info["valorRequerido"]?.toString().replace(/[^0-9]/g, '')))
          , null,null],
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
          Number(this.info["totalCreditos"]?.toString().replace(/[^0-9]/g, '')))
          , null,null],
        backgroundColor: 'rgba(235, 0, 27, 0.6)',
        borderColor: 'rgba(235, 109, 27, 0.6)',
        borderWidth: 1,
        stack: 'Beneficiar',
      },
      {
        label: 'Pago Beneficiar Rotativo',
        data: [this.info["pagoRotativoBeneficiar"]?.toString().replace(/[^0-9]/g, ''), null,null],
        backgroundColor: 'rgba(235, 109, 27, 0.6)',
        borderColor: 'rgba(235, 109, 27, 0.6)',
        borderWidth: 1,
        stack: 'Beneficiar',
      },
      {
        label: 'cuotaAportes',
        data: [null,this.info["aportes"]?.toString().replace(/[^0-9]/g, ''),null],
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderColor: 'rgba(235, 109, 27, 0.6)',
        borderWidth: 1,
        stack: 'Actual',
      },      
      {
        label: 'Pago Actual Creditos',
        data: [null,this.info['pagoCreditoActual']?.toString().replace(/[^0-9]/g, ''),null],
        backgroundColor: 'rgba(0, 192, 0, 1)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        stack: 'Actual',
      },
      {
        label: 'Pago Actual Tarjetas',
        data: [null,this.info['pagoRotativoActual']?.toString().replace(/[^0-9]/g, ''),null],
        backgroundColor: 'rgba(75, 192, 192, 1)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        stack: 'Actual',
      },
      {
        label: 'Total Pago Actual',
        data: [null,this.info['totalPagoActual'],null],
        backgroundColor: 'rgb(0, 9, 133)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },      
      {
        label: 'Diferencia',
        data: [null,null,this.info['diferenciaPagos']],
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
    this.info['productosRefinanciamientoList'] = data.filter(
      (item) =>item['Recoger'] === 'true');
    this.info['productosNoRefinanciamientoList'] = data.filter(
      (item) =>item['Recoger'] === 'false');
    this.info["creditosRefinanciamientoList"] = data.filter(
      (item) => item['Tarjeta'] === 'false' && item['Recoger'] === 'true');
    this.info["tarjetasRefinanciamientoList" ] = data.filter(
      (item) => item['Tarjeta'] === 'true' && item['Recoger'] === 'true');


  
    this.info["todosLosProductosList"] = data;
      this.calcularTotalesRef();
  }
  generateCharts(): void {
    this.paymentChart();
    this.interestChart();
    this.comparacionChart();
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
        'cuotaAportes', 
        'saldoAportes',
        // 'ingresos'
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


const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    x: {
      stacked: true,
      categoryPercentage: 0.6, // Adjust this to control category width (lower value = narrower)
      barPercentage: 0.8, // Adjust this to control bar width (lower value = narrower)
    },
    y: {
      stacked: true,
      beginAtZero: true,
    },
  },
};

