import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../Services/data.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  constructor(private DataService: DataService) { }

  ngOnInit(): void {
    this.nombreFuncionario=this.DataService.getNombreFuncionario();
    this.access=this.DataService.getAccess();    
  }
  isLoading=false;
  cedula='';
  password: string = '';
  nombreFuncionario="";
  access=false;
  error=false;


  async onSubmit() {
    this.isLoading=true;
    console.log(this.access);
    if (this.cedula && this.password) {
      let cc = this.cedula.replace(/[^0-9]/g, '');
      var token = await this.DataService.askLogin(cc,this.encrypt(this.password));
      if(token){
        this.nombreFuncionario=this.DataService.getNombreFuncionario();
        this.access=this.DataService.getAccess();   
        this.error=false;
      }
      else{console.log("Info Invalida");
        this.error=true;
      }
    }
    console.log(this.access);

    this.isLoading=false; 

  }

  encrypt(clave:string):string{
    return clave;
  }
  fNumber(h:string) {
    let p= this.cedula.replace(/[^0-9]/g, '');
    this.cedula = p.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
}
