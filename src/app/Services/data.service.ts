import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})

export class DataService {
  productList: Array<{ [key: string]: string }> = [];

  setData(data:Array<{ [key: string]: string }>){
    console.log("envia info:",data);
    this.productList=data;
  }
  getData() {
    console.log("pide info:",this.productList);
    return this.productList;
  }
  addProduct(product:string){
    this.productList.push(JSON.parse(product));
  }
}
