import { Injectable } from '@angular/core';

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

  findInterestRate(cuota: number, capital: number, plazo: number, initialGuess: number = 0.05): number {
    const tolerance = 1e-6;
    let r = initialGuess;
    let diff = this.calculateFunction(r, cuota, capital, plazo);

    while (Math.abs(diff) > tolerance) {
      const derivative = this.calculateDerivative(r, cuota, capital, plazo);
      if (derivative === 0) {
        throw new Error('Derivative is zero; Newton-Raphson method fails.');
      }
      r = r - diff / derivative;
      diff = this.calculateFunction(r, cuota, capital, plazo);
    }
    return r || 0;
  }

  calcularInteres(capital:number,tasa:number): string{
    return this.formatNumber(Number((capital * tasa / 1200).toFixed(0)));
  }

  fNumber(key:string) {
    // let p=this.product[key].replace(/[^0-9.]/g, '');
    // this.product[key] = p.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  documentoNumber() {
    // let p=this.infoCliente['documento'].replace(/[^0-9]/g, '');
    // this.infoCliente['documento'] = p.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  calculateMonthlyPayment(plazo: number, tasa: number, monto: number): number {
    const monthlyRate = tasa / 100 / 12; // Convert annual rate to monthly rate
    if (plazo === 0 || monto === 0) {
      return 0;
    }
    return (monto * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -plazo));
  }
  formatNumber(value: number): string {
    return value.toLocaleString('en-US', {});
  }
  num(s:string){
    return Number(s) || 0;
  }
  base64FromLocalImage(imagePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // Prevents CORS issues
      img.src = imagePath;
  
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
  
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const base64String = canvas.toDataURL('image/png'); // Convert to PNG format
          resolve(base64String);
        } else {
          reject(new Error('Could not create canvas context'));
        }
      };
  
      img.onerror = (err) => reject(err);
    });
  }
  
}
