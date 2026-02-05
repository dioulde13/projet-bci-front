import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MobileMoneyService {

private baseUrl = environment.apiUrlNode;

  constructor(private http: HttpClient) {}

  payerMobileMoney(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/mobilemoney/paye`, payload);
  }
}
