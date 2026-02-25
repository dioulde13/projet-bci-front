import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionInternationalService {

   private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}


  // Récupère la liste des comptes clients pour une organisation
  getAllTransactions(idOrganisation: number): Observable<any> {
    const params = new HttpParams().set(
      'organisation_id',
      idOrganisation.toString(),
    );

    return this.http.get(`${this.baseUrl}/api/getAllTransactionsInternation`, {
      withCredentials: true,
      params,
    });
  }
}
