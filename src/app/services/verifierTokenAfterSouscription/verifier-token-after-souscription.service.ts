import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VerifierTokenAfterSouscriptionService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  verifierToken(
    token: string,
    email: string,
    appName: string = 'Banking web site',
    lienSiteClient: string = 'https://dev-bci-banking.ecash-guinee.com'
  ): Observable<any> {
    const body = {
      /* peut être vide ou d’autres données */
    };
    const params = new HttpParams()
      .set('token', token)
      .set('appName', appName) 
      .set('email', email)
      .set('lienSiteClient', lienSiteClient);

    console.log(params);

    return this.http
      .post<any>(`${this.baseUrl}/api/verifyTokenAfterSouscript`, body, { params })
      .pipe(
        catchError((err) =>
          throwError(() => new Error(err?.message || 'Erreur du serveur'))
        )
      );
  }

}
