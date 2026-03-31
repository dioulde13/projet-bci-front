import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Beneficiaire {
  prenom: string;
  nom: string;
  typeBeneficiaire: string;
  numeroCompte: string;
  cleRib: string;
  bic: string;
  montant: number;
  devise: string;
  modePaiement: string;
  nomBanque?: string;
  adresseBanque?: string;
  objetPaiement?: string;
}

export interface ImportBeneficiairePayload {
  iOrganisationID: number;
  beneficiaires: Beneficiaire[];
}

export interface ImportBeneficiaireResponse {
  status: number;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root',
})
export class ImportListeBeneficiaireService {
  private readonly apiUrl =
    'https://dev-api-bcibank.ecash-guinee.com/api/importBeneficiaire';

  constructor(private http: HttpClient) {}

  importBeneficiaires(
    iOrganisationID: number,
    beneficiaires: Beneficiaire[],
  ): Observable<ImportBeneficiaireResponse> {
    const payload: ImportBeneficiairePayload = {
      iOrganisationID,
      beneficiaires,
    };
    return this.http.post<ImportBeneficiaireResponse>(this.apiUrl, payload);
  }
}