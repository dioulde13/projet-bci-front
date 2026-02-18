import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HistoriqueTransactionService {
  private baseUrl = environment.apiUrl;

  private baseUrlNode = environment.apiUrlNode;

  constructor(private http: HttpClient) {}

  cancelTransaction(vcTransactionID: any): Observable<any> {
    const body = { vcTransactionID: vcTransactionID };

    return this.http.post(`${this.baseUrlNode}/api/transactions/cancel`, body, {
      withCredentials: true,
    });
  }

  getTransactionStatus(iRequestID: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrlNode}/api/transactions/status/${iRequestID}`,
      { withCredentials: true },
    );
  }

  verifierTransaction(vcTransactionID: any): Observable<any> {
    const body = { vcTransactionID: vcTransactionID };

    return this.http.post(`${this.baseUrlNode}/api/transactions/cancel`, body, {
      withCredentials: true,
    });
  }

  // Récupère la liste des comptes clients pour une organisation
  getAllTransactions(idOrganisation: number): Observable<any> {
    const params = new HttpParams().set(
      'organisation_id',
      idOrganisation.toString(),
    );

    return this.http.get(`${this.baseUrl}/api/getAllTransactions`, {
      withCredentials: true,
      params,
    });
  }
}
