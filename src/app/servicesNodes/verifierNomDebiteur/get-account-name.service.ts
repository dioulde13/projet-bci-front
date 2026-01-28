import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GetAccountNameService {
  constructor(private http: HttpClient) {}

  private baseUrl = environment.apiUrlNode;

  getNomDebiteur(accountNumber: any): Observable<any> {
    const body = { vcAccountNumber: accountNumber };
    console.log('Payload sent:', body);
    return this.http.post(`${this.baseUrl}/api/account/info`, body, {
      withCredentials: true,
    });
  }
}
