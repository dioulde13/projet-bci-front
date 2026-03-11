import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AjouterComptesService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getInfoCompteClientAjout(clientID: any): Observable<any> {
    const body = {
      clientID,
    };

    console.log('💡 getInfoCompteClientAjoout body:', body);

    return this.http.post(
      `${this.baseUrl}/api/getInfoCompteClientAjoout`,
      body,
    );
  }

  // ✅ Ajouter des comptes
  addClientAccounts(clientID: number, accounts: any[]): Observable<any> {
    const payload = {
      ClientID: clientID,
      accounts: accounts.map((c) => ({
        compte: c.compte,
        typ: c.typ,
        nomCompte: c.nomCompte,
        devise: c.devise,
        posdisp: c.posdisp,
        btBlocked: c.isBlocked ? 1 : 0,
        vcBlockedStatus: c.isBlocked ? 'BLOCKED' : 'ACTIVE',
      })),
    };
    return this.http.post(`${this.baseUrl}/api/add-client-account`, payload);
  }

  // ✅ Activer / Désactiver un compte
  toggleAccount(
    clientID: number,
    accountNumber: string,
    enabled: number,
  ): Observable<any> {
    const payload = {
      clientID,
      accountNumber,
      enabled,
    };
    return this.http.post(`${this.baseUrl}/api/toggleAccount`, payload);
  }
}
