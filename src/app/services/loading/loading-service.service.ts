import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoadingServiceService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  verifierToken(
    token: string,
    email: string,
    appName: string = 'Banking web site'
  ): Observable<any> {
    const body = {
      /* peut être vide ou d’autres données */
    };
    const params = new HttpParams()
      .set('token', token)
      .set('appName', appName)
      .set('email', email);

    console.log(params);

    return this.http
      .post<any>(`${this.baseUrl}/api/verifyToken`, body, { params })
      .pipe(
        catchError((err) =>
          throwError(() => new Error(err?.message || 'Erreur du serveur'))
        )
      );
  }

  // Verifier l'email et le token apres modification des informations (si email inclus)
  verifyUserUpdate(
    token: string,
    email: string,
    appName: string = 'Banking web site'
  ): Observable<any> {
    const params = new HttpParams()
      .set('token', token)
      .set('email', email)
      .set('appName', appName);

    console.log('params : ', params);

    return this.http
      .post(`${this.baseUrl}/api/verifyTokenmailAfterUpdate`, {}, { params })
      .pipe(
        catchError((err) =>
          throwError(() => new Error(err?.message || 'Erreur du serveur.'))
        )
      );
  }
}
