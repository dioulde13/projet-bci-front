import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BalanceService {
  constructor(private http: HttpClient) {}

  private baseUrl = environment.apiUrlNode;

 getBalance(accountNumber: any): Observable<any> {
  const body = { accountNumber: accountNumber };
  console.log("Payload sent:", body);   
  return this.http.post(`${this.baseUrl}/api/balance`, body, { withCredentials: true });
}

}
