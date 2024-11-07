import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { Page3Component } from './page3/page3.component';
import { ProductsComponent } from './products/products.component';
export const routes: Routes = [    
    {path: 'Login',component:LoginComponent},
    {path: 'Products',component:ProductsComponent},
    {path: 'Home',component:Page3Component},
    {path: '',redirectTo:'/Home',pathMatch:'full'},
    {path: '**', component: PageNotFoundComponent},
];
