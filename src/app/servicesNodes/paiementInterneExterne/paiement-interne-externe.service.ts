import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { param } from 'jquery';

@Injectable({
  providedIn: 'root',
})
export class PaiementInterneExterneService {
  private baseUrl = environment.apiUrlNode;
  private baseUrlSimple = environment.apiUrl;


  constructor(private http: HttpClient) {}

  payementInterneExterne(payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/transaction/interne/externe`,
      payload,
    );
  }

  getListeBeneficiaireByCategorie(
    idCategorieBeneficiaire: number,
  ): Observable<any> {
    return this.http.get(
      `${this.baseUrlSimple}/api/getListeBeneficiaireByCategorie`,
      {
        params: { idCategorieBeneficiaire },
      },
    );
  }
}
