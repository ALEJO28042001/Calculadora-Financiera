import { Component } from '@angular/core';
import { DataService } from '../Services/data.service';
import { FieldsManagerComponent } from '../fields-manager/fields-manager.component';

@Component({
  selector: 'app-page3',
  standalone: true,
  imports: [ FieldsManagerComponent],
  templateUrl: './page3.component.html',
  styleUrl: './page3.component.css'
})
export class Page3Component {
  constructor(private DataService: DataService) { }
  ge(){
    return this.DataService.getData().length;
  }
}
