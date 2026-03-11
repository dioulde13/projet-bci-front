import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TransfertMultipleService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllBeneficiaireImport(idOrganisation: number): Observable<any> {
    const params = new HttpParams().set(
      'organisation_id',
      idOrganisation.toString(),
    );

    return this.http.get(`${this.baseUrl}/api/getAllBeneficiaireImport`, {
      withCredentials: true,
      params,
    });
  }

  addTransactionMultiple(
    payment_date: any,
    vcPayerName: any,
    payer_account: any,
    montantTotal: any,
    iOrganisationID: any,
    iUserID: any,
    vcCurrency: any,
    vcDescription: any,
    beneficiaries: any[],
  ): Observable<any> {
    const body = {
      payment_date,
      vcPayerName,
      payer_account,
      montantTotal,
      iOrganisationID,
      iUserID,
      vcCurrency,
      vcDescription,
      beneficiaries,
    };

    // 🔹 Log complet du body avant envoi
    console.log('💡 addTransactionMultiple body:', body);

    return this.http.post(`${this.baseUrl}/api/addTransactionMultiple`, body);
  }
}
