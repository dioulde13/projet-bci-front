import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CurrencyRateService {
  constructor(private http: HttpClient) {}

  private baseUrl = environment.apiUrlNode;

  getCurrencyRate(
    vcCurrencyFrom: string,
    vcCurrencyTo: string,
  ): Observable<any> {
    const body = {
      vcCurrencyFrom: vcCurrencyFrom,
      vcCurrencyTo: vcCurrencyTo,
    };
    console.log('vcBICCode:', body);
    return this.http.post(`${this.baseUrl}/api/currencyRate`, body, {
      withCredentials: true,
    });
  }
}
