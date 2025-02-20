import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class CalculosService {

  constructor() { }

  calculateFunction(r: number, cuota: number, capital: number, plazo: number): number {
    return capital * r - cuota * (1 - Math.pow(1 + r, -plazo));
  }

  calculateDerivative(r: number, cuota: number, capital: number, plazo: number): number {
    return capital - cuota * (1 - plazo * Math.pow(1 + r, -plazo) / (1 + r));
  }

  findInterestRate(pagoMensual: number, capital: number, plazo: number, initialGuess: number = 0.05): number {
    const tolerance = 1e-6;
    let r = initialGuess;
    let diff = this.calculateFunction(r, pagoMensual, capital, plazo);

    while (Math.abs(diff) > tolerance) {
      const derivative = this.calculateDerivative(r, pagoMensual, capital, plazo);
      if (derivative === 0) {
        throw new Error('Derivative is zero; Newton-Raphson method fails.');
      }
      r = r - diff / derivative;
      diff = this.calculateFunction(r, pagoMensual, capital, plazo);
    }
    return r || 0;
  }

  calcularInteres(capital:number,tasa:number): string{
    return this.formatearNumero(Number((capital * tasa / 1200).toFixed(0)));
  }

  fNumber(key:string) {
    // let p=this.product[key].replace(/[^0-9.]/g, '');
    // this.product[key] = p.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  calculateMonthlyPayment(plazo: number, tasa: number, monto: number): number {
    const monthlyRate = tasa / 100 / 12; // Convert annual rate to monthly rate
    if (plazo === 0 || monto === 0) {
      return 0;
    }
    return (monto * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -plazo));
  }

  num(s:string){
    return Number(s) || 0;
  }

  calcularSituacion(productos:any, aportes:string){
    let pago = 0;
    let tasaPonderada = 0;
    let costoFinanciero = 0;
    let deuda = 0;

        for (let i = 0; i < productos.length; i++) {
          pago += Number(
            productos[i]["Pago Mensual"].replace(/[^0-9]/g, ''));
          tasaPonderada += Number(
            productos[i]["Tasa Real"]);
          costoFinanciero += Number(
            productos[i]["Interes Actual"].replace(/[^0-9]/g, ''));
          deuda += Number(
            productos[i]["Deuda Actual"].replace(/[^0-9]/g, ''));
        }
    tasaPonderada = (tasaPonderada/productos.length||0);  

    const situacion = { // Create the object to return
      deudaTotal: this.formatearNumero(deuda),
      pagoMensual: this.formatearNumero(pago),
      'tasa+Costos': tasaPonderada,
      costoFinanciero: this.formatearNumero(costoFinanciero),
      aportes: aportes
    };
    return  situacion
  }

  formatDate() {
    const date = new Date();
    const day = date.getDate();
    const monthNames = ["ene", "feb", "mar", "abr", "may", "jun",
      "jul", "ago", "sep", "oct", "nov", "dic"
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  formatear(funcion:string,value:any): string {
    if(funcion==='numero') return this.formatearNumero(value);
    if(funcion==='documento') return this.formatearDocumento(value);

    return ''
  }

  formatearNumero(value: number): string {
    return value.toLocaleString('en-US', {maximumFractionDigits:0});
  }

  formatearDocumento(value: string): string {
    return value.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }


  generatePDF(jsonData:any) {
    const doc = new jsPDF();
    doc.setFont('helvetica');

    // Title
    doc.setFontSize(16);
    doc.text('Asesoría Financiera Integral '+this.formatDate()+' '+new Date().toLocaleTimeString(), 10, 10);
    let yLine=20;

    const imgWidth = 50; // Width in mm
    const imgHeight = 30; // Height in mm
    const xPos = 150; // X position

    const imageFormat = logo.split(';')[0].split('/')[1]; // e.g., "png" or "jpeg"

    // Add the image to the PDF
    doc.addImage(logo, imageFormat, xPos, -3, imgWidth, imgHeight);


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
    doc.save(`Asesoría Financiera Integral: ${jsonData['DatosAsociado'][0]['Documento'] }.pdf`);
  }



}

const logo='data:image/png;base64,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';
