import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ValiderUtilisateurServiceService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

    
  verifierTokenEtEmail(token: string, email: string, appName: string = 'Banking web site'): Observable<any> {
    const body = {
      // token: token,
      // email: email,
      // appName: appName
      /* peut être vide ou d’autres données */
    };
    const params = new HttpParams()
    .set('token', token)
    .set('email', email)
    .set('appName', appName);

    console.log(body);

    return this.http
      .post<any>(`${this.baseUrl}/api/checkEmailToken`, body, {params})
      .pipe(
        catchError((err) =>
          throwError(() => new Error(err?.message || 'Erreur du serveur'))
        )
      );
  }
}
