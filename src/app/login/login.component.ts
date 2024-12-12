import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../Services/data.service';
import { RouterLink} from '@angular/router';
import { Router } from '@angular/router';
import { Md5 } from 'ts-md5';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  constructor(private DataService: DataService, private router:Router) { }

  ngOnInit(): void {
    this.nombreFuncionario=this.DataService.getNombreFuncionario();
    this.access=this.DataService.getAccess();    
  }
  gAccess(){return this.DataService.getAccess()}

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
        this.router.navigate(['/Productos']);
      }
      else{console.log("Info Invalida");
        this.error=true;
      }
    }
    console.log(this.access);

    this.isLoading=false; 
  }

  encrypt(clave:string):string{
    return Md5.hashStr(clave);
  }
  fNumber(h:string) {
    let p= this.cedula.replace(/[^0-9]/g, '');
    this.cedula = p.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
}
