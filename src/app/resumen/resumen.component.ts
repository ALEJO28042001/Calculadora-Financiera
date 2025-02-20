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
  @ViewChild('resumenInteres') resumenInteres!: GenerateChartComponent;
  @ViewChild('resumenFlujoCaja') resumenFlujoCaja!: GenerateChartComponent;



  seleccionarProducto(event: any) {
    this.situacionFutura['productoOfrecido'] = event.target.checked ? 'Rotativo' : 'Consumo';
    this.situacionFutura['tasa+Costos'] = event.target.checked ? '20' : '13' ;
    this.calcularSituacionFutura();
  }

  calcularAportes(){
    this.info['cuotaAportes']=this.CalculosService.formatear('numero',Number(this.info['ingresos'].replace(/[^0-9]/g, '')||0)*0.06);
    this.situacionFutura['aportes']=this.info['cuotaAportes'];
    this.calcularSituacionFutura();
  }

  calcularApalancamiento(){
    if(this.info['isApalancamiento'] && this.situacionFutura['deudaTotal']!+''){
    this.info['valorApalancamiento']=this.CalculosService.formatearNumero(
      Math.max(0, 
        Number(this.situacionFutura['deudaTotal']?.replace(/[^0-9]/g, '')??0) / this.info['fraccionApalancamiento'] - 
        Number(this.info['saldoAportes']?.replace(/[^0-9]/g, '')??0)));
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
    'deudaTotal': '0',
    'pagoMensual': '',
    'tasa+Costos': '13',
    'costoFinanciero': '',
    'aportes':'',
    'plazo': '0',
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

  
  constructor(private DataService: DataService, private CalculosService:CalculosService) {}

  getKeysObject(o:Object){return Object.keys(o)}

  ngOnInit() {
      this.info["saldoAportes"] = this.CalculosService.formatear('numero',this.DataService.getSaldoAportes() || 0);
      this.info["nombre"] = this.DataService.getNombreCliente();
      this.info['cuotaAportes'] = this.DataService.getAportes();
      this.situacionFutura['aportes']=this.info['cuotaAportes'];
      this.DataService.calcularSituacionActual();
      this.situacionActual = this.DataService.getSituacionActual();

      this.info['ingresos'] = this.CalculosService.formatear('numero',Number(this.DataService.getSalario()|| 0) );
      
      this.infoCliente=this.DataService.getInfoCliente();
  }

  calcularSituacionFutura() {
    if(Number(this.situacionFutura['plazo'])>0 && this.situacionFutura["tasa+Costos"]>0 &&
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
          Number(( Number(this.situacionFutura['tasa+Costos'])*deudaFutura/1200).toFixed(0)));
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
    n= n.replace(/([A-Z])/g, ' $1');
    return n;
  }

  validacionInformacion(){
    this.i = 0;
    this.datosProductoValidos = true;
    this.primerCampoErroneo='';
    do{
      if(Number(this.situacionFutura[camposVerificarProducto[this.i]])<=0)
      {
        this.datosProductoValidos = false;
        this.primerCampoErroneo = camposVerificarProducto[this.i];
        this.DataService.setContenidoPopUp('Reporte no generado, revisar: '+this.primerCampoErroneo+' futuro');
      }
      this.i+=1;
    }
    while(this.datosProductoValidos && this.i<camposVerificarProducto.length)

    if(this.datosProductoValidos)
      this.generateJsonData();
  }
  getEstadoConsulta(){return this.DataService.getEstadoConsulta()}

  generateJsonData() {
    // console.log(this.info['productosRefinanciamientoList']);
    // console.log((this.info?['productosRefinanciamientoList'] : []));

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
        Plazo: Number(this.situacionFutura['plazo']) || 0,
        Tasa: Number(this.situacionFutura['tasa+Costos']) || 0,
        ValorCuota: this.situacionFutura['pagoMensual'] || 0,
        ValorCuotaAportes: this.situacionFutura['aportes'] || 0,
        Ingresos: this.info['ingresos'] || 0,
        Apalancamiento: this.info['valorApalancamiento'] || 0,
      }],
      ProductosRecoger: (this.DataService.getProductosRecoger() || []).map((product: any) => ({
        Nombre: product['Nombre Producto'] || 'N/A',
        Tipo: product['Tarjeta'] === 'true' ? 'Rotativo' : 'Consumo',
        SaldoActual: product['Deuda Actual'] || 0,
        Plazo: product['Plazo Actual'] || '0',
        PagoMensual: product['Pago Mensual'] || 0,
        Tasa: product['Tasa Real'] || '0',
      }
      ))
    };

  this.DataService.setJsonFile(JSON.stringify(jsonData, null, 2)); // You can replace this with a service call to save or send the data
  this.CalculosService.generatePDF(jsonData);
  this.DataService.setContenidoPopUp('Reporte Generado Correctamente');
  }

  getEsAsociado(){return this.DataService.getEsAsociado()}

}



interface Info {
  [key: string]:any;
}

const camposVerificarProducto=['plazo','deudaTotal','tasa+Costos','aportes'];
