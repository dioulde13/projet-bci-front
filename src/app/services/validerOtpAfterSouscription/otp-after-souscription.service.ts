import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OtpAfterSouscriptionService {

  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  verifyOTPSouscription(otp: any, msisdn: string): Observable<any> {
    const body = {
      otp: otp,
      msisdn: msisdn,
    };
    console.log(body);
    return this.http.post(`${this.baseUrl}/api/verifyOTPSouscription`, body);
  }

  renvoiOtpAfterSouscription(msisdn: string): Observable<any>{
    const body = {
      msisdn: msisdn
    };
    return this.http.post(`${this.baseUrl}/api/RenvoiOTPSouscription`, body);
  }
}
