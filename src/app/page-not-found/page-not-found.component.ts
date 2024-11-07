import { Component } from '@angular/core';
import { TestApiComponent } from '../test-api/test-api.component';
import { ApiService } from '../Services/api.service';
@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [TestApiComponent],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.css'
})
export class PageNotFoundComponent {
  constructor(private apiService: ApiService) {}
  tes(){
    this.apiService.consultarBD().subscribe(
      {next:value=>console.log('ok'),
        error:err=>console.error(err),
    });
  }
}
