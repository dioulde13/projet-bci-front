import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MarchandService {
  constructor(private http: HttpClient) {}

  private baseUrl = environment.apiUrlNode;

  getAllFacturiers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/facturiers`);
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
  ): Observable<any> {
    const body = {
      vcPayerAccount: vcPayerAccount,
      vcBenefName: "EDG COLLECTES",
      vcBenefAccount: "",
      mAmount: mAmount,
      mFeesEcash: mFeesEcash,
      mFeesBCI: mFeesBCI,
      vcNotes: vcNotes,
       btFeesIncluded: btFeesIncluded,
    };

    console.log('body:', body);
    return this.http.post(`${this.baseUrl}/api/payment/marchands`, body, {
      withCredentials: true,
    });
  }
}
