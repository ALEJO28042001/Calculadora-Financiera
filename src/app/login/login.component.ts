import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../Services/data.service';
import { ProductsComponent } from '../products/products.component';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductsComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  constructor(private DataService: DataService) { }

  ngOnInit(): void {
    this.nombreFuncionario=this.DataService.nombreFuncionario;
    this.access=this.DataService.getAccess();
    
  }
  cedula='';
  password: string = '';
  nombreFuncionario="";
  access=false


  onSubmit() {
    if (this.cedula && this.password) {
      let cc = this.cedula.replace(/[^0-9]/g, '');
      console.log('Login Details:', { cedula: cc, password: this.password });
      this.DataService.getLogin(cc,this.encrypt(this.password));
      if(this.DataService.nombreFuncionario!=""){
        // routerLink="/Products";
        this.nombreFuncionario=this.DataService.nombreFuncionario;
        this.access=this.DataService.getAccess();
        
      }
      else
        console.log("Info Invalida");
    }
  }

  encrypt(clave:string):string{
    return clave;
  }
  fNumber(h:string) {
    let p= this.cedula.replace(/[^0-9]/g, '');
    this.cedula = p.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
}
