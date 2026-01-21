import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FormNouveauPasseService {

    private baseUrl = environment.apiUrl;
  

  constructor(private http: HttpClient) { }

  private getEmail(): string | null {
    return localStorage.getItem('email_recu'); // clé utilisée dans le composant précédent
  }

  private getToken(): string | null {
    return localStorage.getItem('token_recu'); // clé si tu as sauvegardé un token
  }


  verifierToken(Nouveaupassword: string, appName: string = 'Banking web site'): Observable<any> {
    const token = this.getToken();
    const email = this.getEmail();

    console.log('Token récupéré :', token);
    console.log('Email récupéré :', email);
    console.log('nooveau mot de passe :', Nouveaupassword);
    console.log('Banking :', appName);


    // ✅ Si ton API attend les infos en query params :
    const params = new HttpParams()
      .set('token', token ?? '')
      .set('Nouveaupassword', Nouveaupassword)
      .set('email', email ?? '')
      .set('appName', appName);

    return this.http.post<any>(`${this.baseUrl}/api/resetPassword`, {}, { params }).pipe(
      catchError(err => throwError(() => new Error(err?.message || 'Erreur du serveur')))
    );
  }
}
