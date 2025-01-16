import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { PageNotFoundComponent } from '../page-not-found/page-not-found.component';
import { ResumenComponent } from '../resumen/resumen.component';
import { ProductosComponent } from '../productos/productos.component';
import { DataService } from '../Services/data.service';

// Factory function to create routes dynamically.
export function createRoutes(dataService: DataService): Routes {
  const hasAccess = dataService.getAccess(); // Get the condition value.
  return hasAccess
    ? [
        { path: 'Home', component: LoginComponent },
        { path: 'Resumen', component: ResumenComponent },
        { path: 'Productos', component: ProductosComponent },
        { path: '', redirectTo: '/Home', pathMatch: 'full' },
        { path: '**', component: PageNotFoundComponent },
      ]
    : [
        { path: 'Home', component: LoginComponent },
        { path: 'Productos', component: ProductosComponent },
        { path: '', redirectTo: '/Home', pathMatch: 'full' },
        { path: '**', component: PageNotFoundComponent },
      ];
}

@NgModule({
  imports: [
    RouterModule.forRoot([]), // Temporary placeholder.
  ],
  exports: [RouterModule],
  providers: [
    {
      provide: 'APP_ROUTES',
      useFactory: (dataService: DataService) => createRoutes(dataService),
      deps: [DataService], // Inject DataService as a dependency.
    },
  ],
})
export class AppRoutingModule {
  constructor() {}
}
