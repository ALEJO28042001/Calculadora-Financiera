import { CalculosService } from './../Services/calculos.service';
import { Component, OnInit } from '@angular/core';
import { GenerateChartComponent } from '../generate-chart/generate-chart.component';
import { ViewChild } from '@angular/core';
import { DataService } from '../Services/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [GenerateChartComponent, CommonModule,FormsModule],
  templateUrl: './resumen.component.html',
  styleUrl: './resumen.component.css'
})
export class ResumenComponent implements OnInit {


  info: Info = {
    'todosLosProductosList': [],
    'productosRefinanciamientoList': [],
    'tasaUsura': 28.8,
    'cuotaAportes': '0',
    'saldoAportes': '',
    'nombre': '',
    'ingresos':'0',
    'isApalancamiento':false,
    'valorApalancamiento':'',
    'infoJson':false,
    'fraccionApalancamiento':5
  }

  infoCliente: Info ={}
  datosProductoValidos: boolean = true;
  primerCampoErroneo: string = '';
  i:number=0;


  seleccionarProducto(event: any) {
    this.situacionFutura['productoOfrecido'] = event.target.checked ? 'Rotativo' : 'Consumo';
    this.situacionFutura['tasa+Costos'] = event.target.checked ? 20 : 13 ;
    this.calcularSituacionFutura();
  }

  calcularAportes(){this.info['cuotaAportes']=this.CalculosService.formatear('numero',Number(this.info['ingresos'].replace(/[^0-9]/g, '')||0)*0.06);
    this.situacionFutura['aportes']=this.info['cuotaAportes'];
    this.calcularSituacionFutura();
  }
  calcularApalancamiento(){
    if(this.info['isApalancamiento']){
    this.info['valorApalancamiento']=this.CalculosService.formatearNumero(
      Number(this.situacionFutura['deudaTotal']?.replace(/[^0-9]/g, '')??0)
      /this.info['fraccionApalancamiento']
      -Number(this.info['saldoAportes']?.replace(/[^0-9]/g, '')??0));
      console.log(this.info['valorApalancamiento']);
    }
    else {this.info['valorApalancamiento']='';}
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
    'tasa+Costos': 13,
    'costoFinanciero': '',
    'aportes':'',
    'plazo': 0,
    'valorRequerido':'',
    'productoOfrecido' : 'Consumo'
  }
  diferenciasSituaciones: Info= {
    'deudaTotal': '',
    'pagoMensual': '',
    'tasa+Costos': 0,
    'costoFinanciero': '',
    'aportes':''
  }

   dataComparacion = {
    'labels': ['Deuda Total', 'Pago Mensual', 'Tasa + Costos', 'Costo Financiero', 'Aportes'],
   }

  @ViewChild('resumenInteres') resumenInteres!: GenerateChartComponent;
  @ViewChild('resumenFlujoCaja') resumenFlujoCaja!: GenerateChartComponent;

  constructor(private DataService: DataService, private CalculosService:CalculosService) {}

  getKeysObject(o:Object){return Object.keys(o)}

  ngOnInit() {
      this.info["saldoAportes"] = this.CalculosService.formatear('numero',this.DataService.getSaldoAportes() || 0);
      this.info["nombre"] = this.DataService.getNombreCliente();
      this.info['cuotaAportes'] = this.DataService.getAportes();
      this.situacionFutura['aportes']=this.info['cuotaAportes'];
      this.situacionActual['aportes']=this.info['cuotaAportes']|| '';

      this.info['ingresos'] = this.CalculosService.formatear('numero',Number(this.DataService.getSalario()|| 0) );
      this.info['productosRefinanciamientoList'] = this.DataService.getData().filter(
        (item) =>item['Recoger'] === 'true');
      this.calcularSituacionActual();
      this.infoCliente=this.DataService.getInfoCliente();
  }
  calcularSituacionActual(){
    let pagoActual = 0;
    let tasaPonderadaActual = 0;
    let costoFinancieroActual = 0;
    let deudaActual = 0;

        for (let i = 0; i < this.info["productosRefinanciamientoList"].length; i++) {
          pagoActual += Number(
            this.info["productosRefinanciamientoList"][i]["Pago Mensual"].replace(/[^0-9]/g, ''));
          tasaPonderadaActual += Number(
            this.info["productosRefinanciamientoList"][i]["Tasa Real"]);
          costoFinancieroActual += Number(
            this.info["productosRefinanciamientoList"][i]["Interes Actual"].replace(/[^0-9]/g, ''));
          deudaActual += Number(
            this.info["productosRefinanciamientoList"][i]["Deuda Actual"].replace(/[^0-9]/g, ''));
        }

    this.situacionActual['costoFinanciero']=this.CalculosService.formatear('numero',costoFinancieroActual);
    this.situacionActual['pagoMensual']=this.CalculosService.formatear('numero',pagoActual);
    this.situacionActual['deudaTotal']=this.CalculosService.formatear('numero',deudaActual);
    this.situacionActual["tasa+Costos"] = (tasaPonderadaActual/this.info['productosRefinanciamientoList'].length||0).toFixed(2);
  }

  calcularSituacionFutura() {

    if(this.situacionFutura['plazo']>0 && this.situacionFutura["tasa+Costos"]>0 &&
      (this.situacionActual['deudaTotal']!=='' || this.situacionFutura["valorRequerido"]!=='')){
        let deudaFutura=
          Number(this.situacionActual['deudaTotal'].replace(/[^0-9]/g, '')) +
          Number(this.situacionFutura["valorRequerido"].replace(/[^0-9]/g, ''))
        this.situacionFutura['deudaTotal'] = this.CalculosService.formatear('numero',deudaFutura);

        this.situacionFutura['pagoMensual'] = this.CalculosService.formatear('numero',
          this.CalculosService.calculateMonthlyPayment(
            this.situacionFutura["plazo"],
            this.situacionFutura["tasa+Costos"],
            deudaFutura
          )
        );

        this.situacionFutura["costoFinanciero"] = this.CalculosService.formatear('numero',
          Number((this.situacionFutura['tasa+Costos']*deudaFutura/1200).toFixed(0)));
        if(deudaFutura>0){
          this.info['infoJson']=true;
        }
        else{
          this.info['infoJson']=false;
        }
    }
    else{
      this.situacionFutura['pagoMensual']= '';
      this.situacionFutura['costoFinanciero']= '';
      this.info['infoJson']=false;

    }

    this.diferenciasSituaciones['tasa+Costos']=(this.situacionActual['tasa+Costos']-
      this.situacionFutura['tasa+Costos']).toFixed(2);


    ['deudaTotal', 'pagoMensual', 'costoFinanciero', 'aportes'].forEach(element => {
      this.diferenciasSituaciones[element]=this.CalculosService.formatear('numero',
      Number((this.situacionActual[element]||'').replace(/[^0-9.]/g, ''))-
      Number((this.situacionFutura[element]||'').replace(/[^0-9.]/g, ''))||0)
    });

    if(this.info['infoJson']){
      this.paymentChart();
      this.interestChart();
    }
    this.calcularApalancamiento();
  }

  interestChart() {
    // Labels for each bar
    this.resumenInteres.chartData.labels = [
      'Actual: $' + (this.situacionActual?.['costoFinanciero'] ?? '0'),
      'Futuro: $' + (this.situacionFutura?.['costoFinanciero'] ?? '0')
    ];

    // Stacked datasets for each bar
    this.resumenInteres.chartData.datasets = [
      {
        label: 'Costo Actual',
        data: [
          this.situacionActual?.['costoFinanciero']
            ? Number(this.situacionActual['costoFinanciero'].replace(/[^0-9]/g, ''))
            : 0,
          0 // No value for Futuro in this stack
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.6)', // Stack 1 color
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        stack: 'combined', // Combine stacks into one bar
      },
      {
        label: 'Costo Futuro',
        data: [
          0, // No value for Actual in this stack
          this.situacionFutura?.['costoFinanciero']
            ? Number(this.situacionFutura['costoFinanciero'].replace(/[^0-9]/g, ''))
            : 0
        ],
        backgroundColor: 'rgba(235, 109, 27, 0.6)', // Stack 2 color
        borderColor: 'rgba(235, 109, 27, 1)',
        borderWidth: 1,
        stack: 'combined', // Combine stacks into one bar
      }
    ];


    // Chart options
    this.resumenInteres.chart.options = {
      responsive: true,
      plugins: {
        legend: {
          display: true, // Show legend for stack identification
        },
      },
      scales: {
        x: {
          stacked: true, // Enable stacking on X-axis
          grid: {
            display: false, // Hide grid lines on the X-axis
          },
        },
        y: {
          beginAtZero: true, // Ensure Y-axis starts at 0
          stacked: true, // Enable stacking on Y-axis
        },
      },
      layout: {
        padding: 0, // Remove extra padding
      },
      // barPercentage: 0.8, // Adjust bar width
      // categoryPercentage: 0.5, // Reduce spacing between bars
    };

    this.resumenInteres.chart.update();
  }


  paymentChart() {
    // Labels for each bar
    this.resumenFlujoCaja.chartData.labels = [
      'Actual: $' + this.CalculosService.formatear('numero',
          Number(this.situacionActual['pagoMensual']?.replace(/[^0-9]/g, '') ?? 0) +
          Number(this.situacionActual['aportes']?.replace(/[^0-9]/g, '') ?? 0)

      ),
      'Futuro: $' + this.CalculosService.formatear('numero',
          Number(this.situacionFutura['pagoMensual']?.replace(/[^0-9]/g, '') ?? 0) +
          Number(this.situacionFutura['aportes']?.replace(/[^0-9]/g, '') ?? 0)
      )
    ];


    // Stacked dataset for each bar
    this.resumenFlujoCaja.chartData.datasets = [
      {
        label: 'Pago Mensual',
        data: [
          Number(this.situacionActual['pagoMensual']?.replace(/[^0-9]/g, '')??0),
          Number(this.situacionFutura['pagoMensual']?.replace(/[^0-9]/g, '')??0)
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.6)', // Stack 1 color
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        stack: 'combined', // Use the same stack group for both datasets
      },
      {
        label: 'Aportes',
        data: [
          Number(this.situacionActual['aportes']?.replace(/[^0-9]/g, '')??0),
          Number(this.situacionFutura['aportes']?.replace(/[^0-9]/g, '')??0)
        ],
        backgroundColor: 'rgba(38, 214, 62, 0.6)', // Stack 2 color
        borderColor: 'rgba(38, 214, 62, 1)',
        borderWidth: 1,
        stack: 'combined', // Use the same stack group for both datasets
      }
    ];


    // Chart options
    this.resumenFlujoCaja.chart.options = {
      responsive: true,
      plugins: {
        legend: {
          display: true, // Show legend to identify stack segments
        },
      },
      scales: {
        x: {
          stacked: true, // Enable stacking for the X-axis
          grid: {
            display: false, // Hide grid lines on the X-axis
          },
        },
        y: {
          beginAtZero: true, // Ensure Y-axis starts at 0
          stacked: true, // Enable stacking for the Y-axis
        },
      },
      layout: {
        padding: 0, // Remove extra padding
      },
      // barPercentage: 0.8, // Adjust bar width
      // categoryPercentage: 0.5, // Reduce spacing between bars
    };

    this.resumenFlujoCaja.chart.update();
  }

  fNumber(key:string) {
    let p=this.info[key].replace(/[^0-9]/g, '');
    this.info[key] = p.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  fNumber2(key:string) {
    let p=this.situacionFutura[key].replace(/[^0-9]/g, '');
    this.situacionFutura[key] = p.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }


  getCreditoOfrecidoEsRotativo(){return this.DataService.getCreditoOfrecidoEsRotativo}

  displayName(n:string):string{
    n= n
    // Insert a space before each uppercase letter
    .replace(/([A-Z])/g, ' $1')
    // Capitalize the first letter of each word
    return n;
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
  generateJsonData() {
    this.i = 0;
        this.datosProductoValidos = true;
        this.primerCampoErroneo='';
        do{
          if(this.info[camposVerificarProducto[this.i]]==='')
          {
            this.datosProductoValidos = false;
            this.primerCampoErroneo = camposVerificarProducto[this.i];
            this.DataService.setContenidoPopUp('Producto no agregado, revisar: '+this.primerCampoErroneo);
          }
          this.i+=1;
        }
        while(this.datosProductoValidos && this.i<5)

    if(this.info['infoJson']){
    const jsonData:Info = {
      DatosFuncionario:[{
        Documento: this.DataService.getDocumentoFuncionario(),
        Nombre: this.DataService.getNombreFuncionario()
      }],
      DatosAsociado: [{
        TipoDoc: 'C',
        Documento: this.DataService.getDocumento() || 'N/A',
        Calificacion: this.DataService.getCalificacion() || 1,
        SaldoAportes: this.info['saldoAportes'] || '0',
        AutorizacionConsulta: {
          autorizacion: 'any',
        },
      }],
      DatosSolicitud: [{
        Linea: this.situacionFutura['productoOfrecido'] || 'Consumo',
        Monto: this.situacionFutura['deudaTotal'] || 0,
        ValorRequerido: this.situacionFutura['valorRequerido'] || 0,
        Plazo: this.situacionFutura['plazo'] || 0,
        Tasa: this.situacionFutura['tasa+Costos'] || 0,
        ValorCuota: this.situacionFutura['pagoMensual'] || 0,
        ValorCuotaAportes: this.situacionFutura['aportes'] || 0,
        Ingresos: this.info['ingresos'] || 0,
        Fecha: this.CalculosService.formatDate(),
        Hora: new Date().toLocaleTimeString(),
        Apalancamiento: this.info['valorApalancamiento'] || 0,
      }],
      ProductosRecoger: (this.info?['productosRefinanciamientoList'] : []).map((product: any) => ({
        Nombre: product['Nombre Producto'] || 'N/A',
        Tipo: product['Tarjeta'] === 'true' ? 'Rotativo' : 'Consumo',
        SaldoActual: this.CalculosService.formatear('numero',Number(product['Deuda Actual']) || 0),
        Plazo: product['Plazo Actual'] || '0',
        PagoMensual: this.CalculosService.formatear('numero',Number(product['Pago Mensual']) || 0),
        Tasa: product['Tasa Real'] || '0',
      }
    ))
    };

  this.DataService.setJsonFile(JSON.stringify(jsonData, null, 2)); // You can replace this with a service call to save or send the data
  this.CalculosService.generatePDF(jsonData);
  this.DataService.setContenidoPopUp('Reporte Generado Correctamente');
}
}


  getEsAsociado(){return this.DataService.getEsAsociado()}
  getCompraCartera(){return this.DataService.getCompraCartera()}

}



interface Info {
  [key: string]:any;
}

const camposVerificarProducto=['deudaTotal','plazo','tasa+Costos'];
