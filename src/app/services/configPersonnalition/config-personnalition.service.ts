import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root', // Le service est injecté globalement dans l'application
})
export class ConfigPersonnalitionService {
  constructor(private http: HttpClient) {}

  // URL de base provenant du fichier d'environnement
  private baseUrl = environment.apiUrl;

  /**
   * Vérifie les informations du compte d’un client
   * @param clientID - ID du client dont on veut vérifier le compte
   * @returns Observable contenant la réponse de l'API
   */
  verifierNumeroCompte(clientID: number): Observable<any> {
    const body = {
      clientID: clientID, // Corps envoyé à l'API
    };

    // Appel POST vers l’API pour récupérer les infos de compte
    return this.http.post(`${this.baseUrl}/api/getInfoCompteClient`, body);
  }

  addSouscription(
    client: any,
    accounts: any[],
    validationLevels: any[],
    paymentCategories: any[],
    userSecurityOptions: any[],
    liaisonClientAndOrganisation: number,
    cliLienGenerere: string = ''
  ): Observable<any> {
    // Si vcJSONFullDetails est une string -> parser
    if (typeof client.vcJSONFullDetails === 'string') {
      client.vcJSONFullDetails = JSON.parse(client.vcJSONFullDetails);
    }

    const body = {
      client,
      accounts,
      validationLevels,
      paymentCategories,
      userSecurityOptions,
      liaisonClientAndOrganisation,
      cliLienGenerere,
    };

    // 🔹 Log complet du body avant envoi
    console.log('💡 addSouscription body:', JSON.stringify(body, null, 2));

    return this.http.post(`${this.baseUrl}/api/addSouscription`, body);
  }

  getVerifieLienOrganisation(cliLienGenerere: string): Observable<any> {
    // Création des paramètres de la requête
    const params = new HttpParams().set('cliLienGenerere', cliLienGenerere);

    // Requête GET avec paramètres
    return this.http.get(`${this.baseUrl}/api/verifieLienOrganisation`, {
      params,
    });
  }

  getRoleOrganisation(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/getRoleOrganisation`);
  }

  getListeSecuriteQuestion(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/getListeSecuriteQuestion`);
  }
}

// MSSQLSERVER

