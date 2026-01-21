import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BeneficiaireNodeService {
  constructor(private http: HttpClient) {}

  // URL de base provenant du fichier d'environnement
  private baseUrl = environment.apiUrlNode;

  getListeBanque(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/banks/banques-participantes`, {
      withCredentials: true,
    });
  }
}
