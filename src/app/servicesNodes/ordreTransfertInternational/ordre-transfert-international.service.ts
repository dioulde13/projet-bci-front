import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdreTransfertInternationalService {

  private http = inject(HttpClient);
  private baseUrl = environment.apiUrlNode;

 
  // Récupère les détails d'une banque (Nom) via son code SWIFT/BIC
   
  getSwiftDetails(vcBIC: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/bank/detail`,
      { vcBIC },
      {
        withCredentials: true, 
      },
    );
  }

// Récupère la liste des bénéficiaires actifs pour l'auto-complétion

  getBeneficiairesActive(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/beneficiaries/active`, {
      withCredentials: true,
    });
  }

  
// Traduit un code ISO (ex: 'GN') en nom de pays (ex: 'Guinée') via l'API WorldBank
   
  getCountryName(isoCode: string): Observable<any> {
    return this.http.get(
      `https://api.worldbank.org/v2/fr/country/${isoCode}?format=JSON`,
    );
  }
}
