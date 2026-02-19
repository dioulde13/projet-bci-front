import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SouscriptionsService {

  constructor(private http: HttpClient) {}

  baseUrl = environment.apiUrl;

  verifierNumeroDeCompte(clientID: number, modeEnvoiSms: string): Observable<any> {
    const body = {
      clientID: clientID,
      modeEnvoiSms: modeEnvoiSms
    };
    console.log(body);
    return this.http.post(`${this.baseUrl}/api/getInfoCompteClient`, body);
  }
}
