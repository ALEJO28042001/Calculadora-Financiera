// Import necessary modules in your Angular service
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://test.beneficiar.com.co/TestConsultaCifin/ConsultaCifinIsapi.dll/api/rest/TServerMethodCifin/ConsultarBD';

  constructor(private http: HttpClient) {}

  consultarBD(): Observable<any> {
    // Basic auth username and password
    const username = 'ServerAdmin';
    const password = 'B3N3F1C14R_R3ST';
    const credentials = btoa(`${username}:${password}`); // Encode credentials to base64

    // Set headers
    const headers = new HttpHeaders({
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    });

    // Request body
    const body = {
      Tipo: "1",
      Numero: "3167398",
      Motivo: "24",
      Codigo: "154",
      FECHACONSULTA: "07/12/2024",
      IdCentralCred: "1"
    };

    // Send POST request
    return this.http.post(this.apiUrl, body, { headers });
  }
}
