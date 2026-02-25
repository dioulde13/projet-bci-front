import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TranfertUniqueService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getBank(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/getBank`);
  }

  sendOtpTransaction(phoneNumber: string): Observable<any> {
    const body = { phoneNumber: phoneNumber };

    return this.http.post(`${this.baseUrl}/api/sendOtpTransaction`, body, {
      withCredentials: true,
    });
  }

  verifyOTPConfirmmeTransaction(
    otp: string,
    phoneNumber: string | null,
    appName: string = 'Banking web site',
  ): Observable<any> {
    const body = { otp, phoneNumber, appName };
    console.log('📤 Envoi OTP:', body);

    return this.http
      .post<any>(`${this.baseUrl}/api/verifyOTPConfirmmeTransaction`, body)
      .pipe(
        tap((response: any) => {
          // ✅ Si la vérification est réussie
          if (response) {
            console.log('✅ OTP validé avec succès.');
          } else {
            console.warn('⚠️ OTP valide mais pas de token retourné.');
          }
        }),
        catchError((err) => {
          console.error('❌ Erreur lors de la vérification OTP:', err);
          return throwError(
            () => new Error(err?.message || 'Erreur du serveur'),
          );
        }),
      );
  }

  /**
   * Envoyer une transaction interne ou externe
   */
  sendTransaction(payload: any): Observable<any> {
    const url = `${this.baseUrl}/api/transactions/interne-externe`;

    return this.http.post<any>(url, payload, { withCredentials: true }).pipe(
      tap((response) => {
        console.log('✅ Transaction envoyée:', response);
      }),
      catchError((error) => {
        console.error('❌ Erreur lors de la transaction:', error);
        return throwError(
          () => new Error(error?.message || 'Erreur du serveur'),
        );
      }),
    );
  }
}
