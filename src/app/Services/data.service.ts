import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

import { HttpClient } from '@angular/common/http';

@Injectable({providedIn: 'root'})

export class DataService {
  constructor(private apiService: ApiService, private http: HttpClient) {}
  
  productList: Array<{ [key: string]: string }> = [];

  setData(data:Array<{ [key: string]: string }>){
    this.productList=data;
  }
  getData() {
    return this.productList;
  }
  addProduct(product:string){
    this.productList.push(JSON.parse(product));
  }
  pullData(documento:string){
    this.setData(this.convertData(documento));    
  }
  convertData(documento:string){
    const cifin = this.apiService.getCifinProducts(documento);

    // Mapping of original keys to new keys
    const newKeysMapping = {
      "NUMEROOBLIGACION": "Nombre Producto",
      "VALORCUOTA": "Pago Mensual",
      "NUMEROCUOTASPACTADAS": "Plazo Actual",
      "SALDOOBLIGACION": "Deuda Actual",
      "LINEACREDITO": "Tarjeta",
      // "NOMBREENTIDAD": "customer1",
      // "NOMBREENTIDAD": "customer1",
    };

    // Function to rename keys in a single object
    function renameKeys(obj: any, keyMap: { [oldKey: string]: string }) {
      const renamedObj: any = {};

      for (const key in keyMap) {
        const newKey = keyMap[key] || key; // Use mapped key or fallback to original key if no mapping is found
      
        // Handle special cases for specific keys
        if (key === "NUMEROOBLIGACION") {
          renamedObj[newKey] = obj["NOMBREENTIDAD"] + " " + obj[key];
        } 
        else if (key === "NUMEROCUOTASPACTADAS") {
          renamedObj[newKey] = obj[key] - obj["CUOTASCANCELADAS"];
        }
        else if (key === "VALORCUOTA" || key === "SALDOOBLIGACION") {
          renamedObj[newKey] = obj[key] * 1000;
        } 
        else if (key === "LINEACREDITO")
          renamedObj[newKey] = String(obj[key] === 'ROTA' || obj[key] === 'TCR');        
        // Default case for all other keys
        else {
          renamedObj[newKey] = obj[key];
        }
      }
      renamedObj['Refinanciamiento']='true';
      return renamedObj;
    }

    const reCifin = cifin.filter((item: any) => 
      item["CALIDAD"] === 'PRIN' && item["NOMBREENTIDAD"] != 'BENEFICIAR- COOP. DE AHORRO Y');

    const renamedCifinArray = reCifin.map((item: any) => renameKeys(item, newKeysMapping));
    
    return renamedCifinArray; 
  }
  
}
