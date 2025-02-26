import { CalculosService } from './../Services/calculos.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../Services/data.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  constructor(private DataService: DataService, private router:Router, private CalculosService: CalculosService) { }

  ngOnInit(): void {
  }

  isLoading=false;
  cedula='';
  password: string = '';


  async onSubmit() {
    this.isLoading=true;
    if (this.cedula && this.password) {
      let cc = this.cedula.replace(/[^0-9]/g, '');
      var token = await this.DataService.askLogin(cc,this.password);
      if(token){
        this.router.navigate(['/Productos']);
      }
      else{console.log("Info Invalida");
        this.DataService.setContenidoPopUp('Cedula o Constraseña Incorrecta');
      }
    }
    this.isLoading=false;
  }

  fNumber(h:string) {
    let p= this.cedula.replace(/[^0-9]/g, '');
    this.cedula = p.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  getJsonFile(){return this.DataService.getJsonFile()}
  getAccess(){return this.DataService.getAccess()}
}
