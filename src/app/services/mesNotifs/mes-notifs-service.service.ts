import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MesNotifsService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Pour affiche la liste des notifications de l'utilisateur courrant connecter
  mesNotifications(idUser: number | string): Observable<any> {
    const params = new HttpParams().set('idUsersConnect', idUser.toString());
    return this.http.get(`${this.baseUrl}/api/getListeNotiificationUsers`, {
      withCredentials: true,
      params: params,
    });
  }

  //  getToken(): string | null {
  //   return localStorage.getItem('token');
  // }

  // Pour bloquer ou debloquer la notification de l'user courrant.
  setToggleNotification(data: any): Observable<any> {
      // Récupère d'abord le token avant toute suppression
    // const token = this.getToken();
    // if (!token) {
    //   return throwError(
    //     () => new Error('Token non trouvé. Veuillez vous connecter.')
    //   );
    // }

    // Prépare les en-têtes d'authentification
    // const headers = new HttpHeaders({
    //   Authorization: `Bearer ${token}`,
    //   'Content-Type': 'application/json',
    // });

    const params = new HttpParams()
      .set('idNotification', data.idNotification.toString())
      .set('btEnabled', data.btEnabled.toString());

    return this.http.post(
      `${this.baseUrl}/api/activeOrDesactiveNotificationUsers`,
      null,
      {
        params: params,
        withCredentials: true,
      }
    );
  }
}
