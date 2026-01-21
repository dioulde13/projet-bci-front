import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BeneficiaireEnAttenteService {
  constructor(private http: HttpClient) {}

  // URL de base provenant du fichier d'environnement
  private baseUrl = environment.apiUrlNode;

 getListeBeneficiaireEnAttente(iOrganisationID: number): Observable<any> {
  const body = { iOrganisationID }; // corps de la requête

  return this.http.post(
    `${this.baseUrl}/api/beneficiaires/en-attente`,
    body,
    {
      withCredentials: true, // si tu dois envoyer les cookies
    }
  );
}



  getListeRejectReasons(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/reject-reasons`, {
      withCredentials: true,
    });
  }

  detailBeneficiaireEnAttente(BeneficiaryID: number): Observable<any> {
    const body = {
      BeneficiaryID: BeneficiaryID,
    };
    return this.http.post(`${this.baseUrl}/api/beneficiaire/detail`, body, {
      withCredentials: true,
    });
  }

  detailBeneficiaireRejeter(
    idDemande: number,
    vcNotes: string,
    iValidatorID: number
  ): Observable<any> {
    const body = {
      idDemande: idDemande,
      vcNotes: vcNotes,
      iValidatorID: iValidatorID,
    };

    return this.http.post(`${this.baseUrl}/api/beneficiaire/rejeter`, body, {
      withCredentials: true,
    });
  }

  detailBeneficiaireValider(
    idDemande: number,
    vcNotes: string,
    iValidatorID: number
  ): Observable<any> {
    const body = {
      idDemande: idDemande,
      vcNotes: vcNotes,
      iValidatorID: iValidatorID,
    };

    return this.http.post(`${this.baseUrl}/api/beneficiaire/valider `, body, {
      withCredentials: true,
    });
  }
}
