import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private baseUrlNode = environment.apiUrlNode;

  constructor(private http: HttpClient) {}

  dixTransactionsRecents(accountNumber: string): Observable<any> {
    const body = { accountNumber };

    return this.http.post(
      `${this.baseUrlNode}/api/account/dixTransactionsRecents`,
      body,
      { withCredentials: true }
    );
  }

  historiqueTransactions(
    accountNumber: string,
    startDate: string,
    endDate: string
  ): Observable<any> {
    const body = {
      accountNumber,
      startDate,
      endDate,
    };
    console.log(body);

    return this.http.post(`${this.baseUrlNode}/api/account/historiqueTransactions`, body, {withCredentials: true});
  }
}
