import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TransfertMultipleServiceNode {
  private baseUrl = environment.apiUrlNode;

  constructor(private http: HttpClient) {}

  addTransactionMultipleNodes(
    vcPayerName: any,
    dtPaymentDate: any,
    vcPaymentReference: any,
    vcPayerAccount: any,
    iTransactionID: any,
  ): Observable<any> {
    const body = {
      vcPayerName,
      dtPaymentDate,
      vcPaymentReference,
      vcPayerAccount,
      iTransactionID,
    };

    // 🔹 Log complet du body avant envoi
    console.log('💡 addTransactionMultiple Nodes body:', body);

    return this.http.post(
      `${this.baseUrl}/api/transaction/multiTransaction`,
      body,
    );
  }
}
