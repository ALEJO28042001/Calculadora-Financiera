import { CalculosService } from './../Services/calculos.service';
import { routes } from '../app.routes';
import { Component, OnInit } from '@angular/core';
import { GenerateChartComponent } from '../generate-chart/generate-chart.component';
import { ViewChild } from '@angular/core';
import { DataService } from '../Services/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { json } from 'express';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


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
    'cuotaAportes': '',
    'saldoAportes': '',
    'nombre': '',
    'ingresos':'',
    'isApalancamiento':false,
    'valorApalancamiento':'',
  }

  
  seleccionarProducto(event: any) {
    this.situacionFutura['productoOfrecido'] = event.target.checked ? 'Rotativo' : 'Consumo';
    this.situacionFutura['tasa+Costos'] = event.target.checked ? 20 : 13 ;
    this.calcularSituacionFutura();
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
      this.info["saldoAportes"] = this.formatNumber(this.DataService.getSaldoAportes() || 0);
      this.info["nombre"] = this.DataService.getNombreCliente();
      this.info['cuotaAportes'] = this.DataService.getAportes();
      this.situacionFutura['aportes']=this.info['cuotaAportes'];
      this.situacionActual['aportes']=this.info['cuotaAportes']|| '';

      this.info['ingresos'] = this.formatNumber(Number(this.DataService.getSalario()) || 0);
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

    this.situacionActual['costoFinanciero']=this.formatNumber(costoFinancieroActual);
    this.situacionActual['pagoMensual']=this.formatNumber(pagoActual);
    this.situacionActual['deudaTotal']=this.formatNumber(deudaActual);
    this.situacionActual["tasa+Costos"] = (tasaPonderadaActual/this.info['productosRefinanciamientoList'].length||0).toFixed(2);  
  }

  calcularSituacionFutura() {

    if(this.situacionFutura['plazo']>0 && this.situacionFutura["tasa+Costos"]>0 && 
      (this.situacionActual['deudaTotal']!=='' || this.situacionFutura["valorRequerido"]!=='')){
        let deudaFutura=
          Number(this.situacionActual['deudaTotal'].replace(/[^0-9]/g, '')) +
          Number(this.situacionFutura["valorRequerido"].replace(/[^0-9]/g, ''))
        this.situacionFutura['deudaTotal'] = this.formatNumber(deudaFutura);

        this.situacionFutura['pagoMensual'] = this.formatNumber(
          this.CalculosService.calculateMonthlyPayment(
            this.situacionFutura["plazo"],
            this.situacionFutura["tasa+Costos"],
            deudaFutura
          )
        );   
        
        this.situacionFutura["costoFinanciero"] = this.formatNumber(
          Number((this.situacionFutura['tasa+Costos']*deudaFutura/1200).toFixed(0)));
        
    }
    else{
      this.situacionFutura['pagoMensual']= '';
      this.situacionFutura['costoFinanciero']= '';
    } 
  
    this.diferenciasSituaciones['tasa+Costos']=(this.situacionActual['tasa+Costos']-
      this.situacionFutura['tasa+Costos']).toFixed(2);


    ['deudaTotal', 'pagoMensual', 'costoFinanciero', 'aportes'].forEach(element => {
      this.diferenciasSituaciones[element]=this.formatNumber(
      Number((this.situacionActual[element]||'').replace(/[^0-9.]/g, ''))-
      Number((this.situacionFutura[element]||'').replace(/[^0-9.]/g, ''))||0)
    });


  }


  // comparacionChart(){
  //   this.comparacionSituaciones.chartData.labels=this.dataComparacion.labels;
  //   var datosSituacionActual: number[] = [];
  //   var datosSituacionFutura: number[] = [];
  //   var datosSituacionDiferencia: number[] = [];
  //       // Extract and process data
  //   Object.keys(this.situacionActual).forEach(key => {
  //     // Clean and parse values, falling back to 0 if the value is empty or invalid
  //     datosSituacionActual.push(
  //       Number((this.situacionActual[key]?.toString().replace(/[^0-9.]/g, '')) || 0)
  //     );
  //     datosSituacionFutura.push(
  //       Number((this.situacionFutura[key]?.toString().replace(/[^0-9.]/g, '')) || 0)
  //     );
  //     datosSituacionDiferencia.push(
  //       Number((this.diferenciasSituaciones[key]?.toString().replace(/[^0-9.]/g, '')) || 0)
  //     );
  //   });
  //   this.comparacionSituaciones.chartData.datasets=[
  //     {
  //       label: 'Situación Actual',
  //       data: datosSituacionActual,
  //       backgroundColor: 'rgba(54, 162, 235, 0.5)',
  //       borderColor: 'rgba(54, 162, 235, 1)',
  //       borderWidth: 1,
  //     },
  //     {
  //       label: 'Situación Futura',
  //       data: datosSituacionFutura,
  //       backgroundColor: 'rgba(75, 192, 192, 0.5)',
  //       borderColor: 'rgba(75, 192, 192, 1)',
  //       borderWidth: 1,
  //     },
  //     {
  //       label: 'Diferencias',
  //       data: datosSituacionDiferencia,
  //       backgroundColor: 'rgba(255, 99, 132, 0.5)',
  //       borderColor: 'rgba(255, 99, 132, 1)',
  //       borderWidth: 1,
  //     },
  //   ];
  //   this.comparacionSituaciones.chart.update();
  // }

  interestChart() {
    // Labels for each bar
    this.resumenInteres.chartData.labels = [
      'Actual: $' + this.situacionActual['costoFinanciero'], 
      'Futuro: $' + this.situacionFutura['costoFinanciero']
    ];
  
    // Stacked datasets for each bar
    this.resumenInteres.chartData.datasets = [
      {
        label: 'Costo Actual',
        data: [
          Number(this.situacionActual['costoFinanciero'].replace(/[^0-9]/g, '')),
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
          Number(this.situacionFutura['costoFinanciero'].replace(/[^0-9]/g, ''))
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
      'Actual: $' + this.formatNumber(
        Number(this.situacionActual['pagoMensual'].replace(/[^0-9]/g, '')) +
        Number(this.situacionActual['aportes'].replace(/[^0-9]/g, ''))
      ),
      'Futuro: $' + this.formatNumber(
        Number(this.situacionFutura['pagoMensual'].replace(/[^0-9]/g, '')) +
        Number(this.situacionFutura['aportes'].replace(/[^0-9]/g, ''))
      )
    ];
  
    // Stacked dataset for each bar
    this.resumenFlujoCaja.chartData.datasets = [
      {
        label: 'Pago Mensual',
        data: [
          Number(this.situacionActual['pagoMensual'].replace(/[^0-9]/g, '')),
          Number(this.situacionFutura['pagoMensual'].replace(/[^0-9]/g, ''))
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.6)', // Stack 1 color
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        stack: 'combined', // Use the same stack group for both datasets
      },
      {
        label: 'Aportes',
        data: [
          Number(this.situacionActual['aportes'].replace(/[^0-9]/g, '')),
          Number(this.situacionFutura['aportes'].replace(/[^0-9]/g, ''))
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
  
  formatNumber(value: number): string {
    return value.toLocaleString('en-US', {maximumFractionDigits:0});
  }
  fNumber(key:string) {
    let p=this.info[key].replace(/[^0-9]/g, '');
    this.info[key] = p.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }  
  fNumber2(key:string) {
    let p=this.situacionFutura[key].replace(/[^0-9]/g, '');
    this.situacionFutura[key] = p.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }  

  generateCharts(): void {
    this.paymentChart();
    this.interestChart();
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
          Fecha: new Date().toLocaleDateString(),
          Hora: new Date().toLocaleTimeString(),
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
        // Apalancamiento: this.info['valorApalancamiento'] || 0,
      }],
      ProductosRecoger: (this.info['productosRefinanciamientoList'] || []).map((product: any) => ({
        Nombre: product['Nombre Producto'] || 'N/A',
        Tipo: product['Tarjeta'] === 'true' ? 'Rotativo' : 'Consumo',
        SaldoActual: this.formatNumber(Number(product['Deuda Actual']) || 0),
        Plazo: product['Plazo Actual'] || '0',
        PagoMensual: this.formatNumber(Number(product['Pago Mensual']) || 0),
        Tasa: product['Tasa Real'] || '0',
      }
    ))
    };
  
  this.DataService.setJsonFile(JSON.stringify(jsonData, null, 2)); // You can replace this with a service call to save or send the data
  this.generatePDF(jsonData);
}

  generatePDF(jsonData:any) {

      const doc = new jsPDF();
      doc.setFont('helvetica');
    
      // Title
      doc.setFontSize(16);
      doc.text('Reporte de Datos', 10, 10);
      let yLine=20;

      Object.keys(jsonData).forEach((section:string) => {
        doc.setFontSize(12);
        doc.text(section, 10, yLine);
        yLine +=5;

        autoTable(doc, {
          startY: yLine,
          head: [Object.keys(jsonData[section][0])], // Dynamic headers
          body:  Object.values(jsonData[section].map((product: any) => Object.values(product)))
        });
    
          yLine += 25; // Move Y position for next section
        });
    
      // Save the PDF
      doc.save('ReporteDatos.pdf');
    }
  
}

    
interface Info {
  [key: string]:any;
}

