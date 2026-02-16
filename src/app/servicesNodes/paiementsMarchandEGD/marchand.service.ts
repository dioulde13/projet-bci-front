import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MarchandService {
  constructor(private http: HttpClient) {}

  private baseUrl = environment.apiUrlNode;

  getAllFacturiers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/facturiers/active/list`, {
      withCredentials: true,
    });
  }

  postPaiementMarchant(
    vcPayerAccount: string,
    vcBenefName: string,
    vcBenefAccount: string,
    mAmount: any,
    mFeesEcash: number,
    mFeesBCI: number,
    vcNotes: string,
    btFeesIncluded: number,
    iTransactionID: number
  ): Observable<any> {
    const body = {
      vcPayerAccount: vcPayerAccount,
      vcBenefName: 'EDG COLLECTES',
      vcBenefAccount: '',
      mAmount: mAmount,
      mFeesEcash: mFeesEcash,
      mFeesBCI: mFeesBCI,
      vcNotes: vcNotes,
      btFeesIncluded: btFeesIncluded,
      iTransactionID: iTransactionID
    };

    console.log('body:', body);
    return this.http.post(`${this.baseUrl}/api/payment/marchands`, body, {
      withCredentials: true,
    });
  }

  loginAvoirTokenEdg(): Observable<any> {
    const body = {
      email: 'bci.banking@ecash-guinee.com',
      password: '7BNXjFMaGkXDvt',
    };
    return this.http.post('https://dev-bcibank-api-js.ecash-guinee.com/api/login', body);
  }

  verifierCompteurPrepayer(compteur: string, msisdn: string): Observable<any> {
    const token = this.getToken(); // Récupérer le token depuis le stockage local

    if (!token) {
      return throwError(() => new Error('Utilisateur non authentifié'));
    }

    // Ajouter le token au header Authorization
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const body = {
      compteur: compteur,
      msisdn: msisdn,
    };
    return this.http.post('https://dev-bcibank-api-js.ecash-guinee.com/api/verify-equipment', body, { headers });
  }

  verifierCompteurPostpayer(compteur: string, msisdn: string): Observable<any> {
    const token = this.getToken(); // Récupérer le token depuis le stockage local

    if (!token) {
      return throwError(() => new Error('Utilisateur non authentifié'));
    }

    // Ajouter le token au header Authorization
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const body = {
      compteur: compteur,
      msisdn: msisdn,
    };
    console.log('body: ', body);
    return this.http.post('https://dev-bcibank-api-js.ecash-guinee.com/api/get-invoices', body, { headers });
  }

  // Sauvegarder le token dans le stockage local
  saveToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('token', token);
    }
  }

  // Récupérer le token du stockage local
  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('token');
    }
    return null;
  }
}
