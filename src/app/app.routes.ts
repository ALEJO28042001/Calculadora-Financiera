import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ResumenComponent } from './resumen/resumen.component';
import { ProductosComponent } from './productos/productos.component';
import { DataService } from './Services/data.service';

const isUserAdmin = true; // Replace with your actual condition logic.

export 
    const routes: Routes = isUserAdmin
    ? [
        { path: 'Home', component: LoginComponent },
        { path: 'Resumen', component: ResumenComponent },
        { path: 'Productos', component: ProductosComponent },
        { path: '', redirectTo: '/Home', pathMatch: 'full' },
        { path: '**', component: PageNotFoundComponent },
      ]
    : [
        { path: 'Home', component: LoginComponent },
        { path: '**', component: LoginComponent }
      ];
