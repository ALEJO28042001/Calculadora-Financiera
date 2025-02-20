import { Component } from '@angular/core';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataService } from './Services/data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule,RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent{
  constructor(private DataService: DataService) {}
  getAccess(){return this.DataService.getAccess()}
  logOut(){
    this.DataService.setAccess(false);
    this.DataService.resetValues();
  }
  getNombreFuncionario(){return this.DataService.getNombreFuncionario()}
  closePopUp(){this.DataService.setContenidoPopUp('')}
  getContenidoPopUp(){return this.DataService.getContenidoPopUp()}
  getEstadoCargando(){return this.DataService.getEstadoCargando()}
  getEstadoConsulta(){return this.DataService.getEstadoConsulta()}

}
