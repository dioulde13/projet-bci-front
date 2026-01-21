import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BeneficiaireService {
  constructor(private http: HttpClient) {}

  // URL de base provenant du fichier d'environnement
  private baseUrl = environment.apiUrl;

  // beneficiaire.service.ts
  ajouterBeneficiaire(formData: FormData) {
    return this.http.post(`${this.baseUrl}/api/addBeneficiaire`, formData, {
      withCredentials: true,
    });
  }

  modifierBeneficiaire(formData: FormData) {
    return this.http.post(
      `${this.baseUrl}/api/updateBeneficiairePersonalInfo`,
      formData,
      {
        withCredentials: true,
      }
    );
  }

  getListeBeneficiaire(iOrganisationID: number): Observable<any> {
    const params = new HttpParams().set('iOrganisationID', iOrganisationID);
    return this.http.get(`${this.baseUrl}/api/getListeBeneficiaire`, {
      params: params,
      withCredentials: true,
    });
  }

  detailBeneficiaire(BeneficiaryID: number): Observable<any> {
    const params = new HttpParams().set(
      'BeneficiaryID',
      BeneficiaryID.toString()
    );

    return this.http.get<any>(`${this.baseUrl}/api/detailBeneficiaire`, {
      params: params,
      withCredentials: true,
    });
  }

  getListeTypeBeneficiaire(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/getListeTypeBeneficiaire`, {
      withCredentials: true,
    });
  }

  getCurrency(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/getCurrency`, {
      withCredentials: true,
    });
  }

  getListeTypePaiement(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/getListeTypePaiement`, {
      withCredentials: true,
    });
  }
}
