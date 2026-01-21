import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OtpAfterChangeInfoService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // private getVerifierOtpEmail() {
  //   return localStorage.getItem('validateEmailUrlEmail');
  // }

  // Méthode pour vérifier l'OTP
  verifyOTP(
    otp: string | null,
    email: string | null,
    appName: string = 'Banking web site'
  ): Observable<any> {
    // const email = this.getVerifierOtpEmail();
    const body = { otp, appName, email };
    console.log('Debug OTP Org : ', body);

    return this.http
      .post<any>(`${this.baseUrl}/api/validePhone`, body)
      .pipe(
        catchError((err) =>
          throwError(() => new Error(err?.message || 'Erreur du serveur'))
        )
      );
  }

  // Méthode pour renvoyer l'OTP
  resentOTP(email: string | null, appName: string = 'Banking web site'): Observable<any> {
    // const email = this.getVerifierOtpEmail();
    const body = {
      email,
      appName,
    };

    console.log('debug 1 : ', body);

    return this.http
      .post<any>(`${this.baseUrl}/api/renvoiOTPValidPhone`, body)
      .pipe(
        catchError((err) =>
          throwError(() => new Error(err?.message || 'Erreur du serveur'))
        )
      );
  }
}
