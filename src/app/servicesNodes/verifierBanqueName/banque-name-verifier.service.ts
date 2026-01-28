import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BanqueNameVerifierService {

   constructor(private http: HttpClient) {}

  private baseUrl = environment.apiUrlNode;

  getNomBanque(vcBICCode: any): Observable<any> {
    const body = { vcBICCode: vcBICCode };
    console.log('vcBICCode:', body);
    return this.http.post(`${this.baseUrl}/api/payee/verify`, body, {
      withCredentials: true,
    });
  }
}
