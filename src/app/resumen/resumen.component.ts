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
  indexGarantia = 4;
  indexProducto = 3;
  comentarios = '';
  capacidadPago=0;
  calificacionesBuenas = ['A', 'AA', 'AAA'];
  i:number=0;
  @ViewChild('resumenInteres') resumenInteres!: GenerateChartComponent;
  @ViewChild('resumenFlujoCaja') resumenFlujoCaja!: GenerateChartComponent;

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
    'tasa+Costos': '',
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
      this.situacionFutura['tasa+Costos']=this.getTasaUsura();

      this.info['ingresos'] = this.CalculosService.formatear('numero',Number(this.DataService.getSalario()|| 0) );
      this.infoCliente=this.DataService.getInfoCliente();
      if (!this.calificacionesBuenas.includes(this.infoCliente['calificacion'])) {
        this.DataService.setContenidoPopUp(`¡ ¡ ¡ ATENCIÓN ! ! ! Calificación: `+ this.DataService.getCalificacion());
      }
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
      this.situacionFutura['deudaTotal'] = '';
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
    this.calcularCapacidadPago();
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
  displayName(n:string): string{
    return this.CalculosService.displayName(n);
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
    if(Number(this.situacionFutura['tasa+Costos'])>this.getTasaUsura())
    {
      this.datosProductoValidos = false;
        this.DataService.setContenidoPopUp('Reporte no generado, tasa mayor a Usura');
    }
    if(Number(this.situacionFutura['tasa+Costos'])<this.getTasaMinima())
      {
        this.datosProductoValidos = false;
          this.DataService.setContenidoPopUp('Reporte no generado, tasa inferior a Esperada');
      }
    if(this.datosProductoValidos)
      this.generateJsonData();
  }
  getEstadoConsulta(){return this.DataService.getEstadoConsulta()}

  calcularCapacidadPago() {
    const aportes = this.extractNumber(this.situacionFutura['aportes']);
    const pagoMensual = this.extractNumber(this.situacionFutura['pagoMensual']);
    const ingresos = this.extractNumber(this.info['ingresos']);

    if (isNaN(aportes) || isNaN(pagoMensual) || isNaN(ingresos) || ingresos === 0 || pagoMensual === 0) {
      this.capacidadPago = 0; // Handle invalid input
      return;
    }

    this.capacidadPago = Number(((aportes + pagoMensual) / ingresos).toFixed(2));
    this.estadoCapacidadPago();
  }

  private extractNumber(value: string | number | undefined): number {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const extracted = Number(value.replace(/[^0-9]/g, ''));
      return isNaN(extracted) ? 0 : extracted;
    }
    return 0; // Default to 0 if value is undefined or null
  }

  generateJsonData() {

  const jsonData:Info = {
    'DatosFuncionario':[{
      Documento: this.CalculosService.formatear('documento',this.DataService.getDocumentoFuncionario()),
      Nombre: this.DataService.getNombreFuncionario()
    }],
    'DatosAsociado': [{
      TipoDoc: 'C',
      Documento: this.CalculosService.formatear('documento',this.DataService.getDocumento()) || 'N/A',
      Calificacion: this.DataService.getCalificacion() || 1,
      SaldoAportes: this.info['saldoAportes'] || '0',
      CODAFILIADO: this.DataService.getCodigoFuncionario(),
      AutorizacionConsulta: {
        autorizacion: 'any',
      },
    }],
    'DatosSolicitud': [{
      Linea: this.seleccionProducto(this.indexProducto)['VALOR'] || 'CONSUMO',
      CodLin: this.seleccionProducto(this.indexProducto)['CAMPO'] || '15',
      Monto: this.situacionFutura['deudaTotal'] || 0,
      ValorRequerido: this.situacionFutura['valorRequerido'] || 0,
      Plazo: Number(this.situacionFutura['plazo']) || 0,
      Tasa: Number(this.situacionFutura['tasa+Costos']) || 0,
      ValorCuota: this.situacionFutura['pagoMensual'] || 0,
      Aportes: this.situacionFutura['aportes'] || 0,
      Ingresos: this.info['ingresos'] || 0,
      CapacidadPago:this.capacidadPago || 0,
      Apalancamiento: this.info['valorApalancamiento'] || 0,
      CodGarantia: this.seleccionGarantia(this.indexGarantia)['CAMPO'] || 'PS'
    }],
    'Comentarios':[{Comentario:this.comentarios || ''}],
    'Productos': (this.DataService.getProductList() || []).map((product: any) => ({
      Nombre: product['Nombre Producto'] || 'N/A',
      Tipo: product['Linea'],
      SaldoActual: this.CalculosService.formatearNumero(Number(product['Deuda Actual'].replace(/[^0-9]/g, '')) || 0) ,
      Plazo: product['Plazo Actual'] || '0',
      PagoMensual: this.CalculosService.formatearNumero(Number(product['Pago Mensual'].replace(/[^0-9]/g, '')) || 0) ,
      Tasa: Number(product['Tasa Real']).toFixed(2) || '0.00',
      Recoger: product['Recoger']==='true' ? 'Si' : 'No'
    }
    )),
  };
  this.CalculosService.generatePDF(jsonData);
  this.DataService.setJsonFile(jsonData);
  this.DataService.guardarAsesoria(jsonData);
  this.DataService.setContenidoPopUp('Reporte Generado Correctamente');
  }

  getEsAsociado(){return this.DataService.getEsAsociado()}
  getTiposGarantias(){return this.DataService.getTiposGarantias()}
  seleccionGarantia(index:number){return this.DataService.getGarantia(index)}

  getTiposProductos(){return this.DataService.getTiposProductos()}
  seleccionProducto(index:number){return this.DataService.getProducto(index)}

  getTasaUsura(){return this.DataService.getTasaUsura()}
  getTasaMinima(){return this.DataService.getTasaMinima()}

  validateAndCalculate(event: any) {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;

    // Regular expression to allow only digits and dots
    if (!/^[0-9.]*$/.test(inputValue)) {
      // Remove invalid characters
      inputElement.value = inputValue.replace(/[^0-9.]/g, '');
      this.situacionFutura['tasa+Costos'] = inputElement.value; // Update ngModel
    }

    // Ensure only one dot is allowed
    if ((inputValue.match(/\./g) || []).length > 1) {
      //Remove the last dot
      inputElement.value = inputValue.slice(0,inputValue.lastIndexOf('.'));
      this.situacionFutura['tasa+Costos'] = inputElement.value;
    }

    // Call your calculation function
    this.calcularSituacionFutura();
  }

  estadoCalificacion(): string {
    if (this.calificacionesBuenas.includes(this.infoCliente['calificacion'])) {
      return 'rgb(96, 255, 96)';
    } else {
      return 'red';
    }
  }

  estadoCapacidadPago(): string {
    if (this.capacidadPago < 0.36) {
      return 'rgb(96, 255, 96)';
    } else if (this.capacidadPago >= 0.36 && this.capacidadPago <= 0.42) {
      return 'rgb(253, 250, 70)';
    } else {
      return 'red';
    }
  }
}



interface Info {
  [key: string]:any;
}

const camposVerificarProducto=['plazo','deudaTotal','tasa+Costos','aportes'];
