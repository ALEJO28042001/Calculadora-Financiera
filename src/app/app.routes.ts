import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ProductsComponent } from './products/products.component';
import { FieldsManagerComponent } from './fields-manager/fields-manager.component';
export const routes: Routes = [    
    {path: 'Home',component:LoginComponent},
    {path: 'Resumen',component:ProductsComponent},
    {path: 'Productos',component:FieldsManagerComponent},
    {path: '',redirectTo:'/Home',pathMatch:'full'},
    {path: '**', component: PageNotFoundComponent},
];
