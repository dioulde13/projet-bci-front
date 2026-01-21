import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private baseUrl = environment.apiUrl; 

  constructor(private http: HttpClient) {}

  // Récupère le token depuis localStorage
  // getToken(): string | null {
  //   return localStorage.getItem('token');
  // }

  // Récupère la liste des comptes clients pour une organisation
  getListeCompteClient(idOrganisation: number): Observable<any> {
    // const token = this.getToken();

    // if (!token) {
    //   return throwError(() => new Error('Token non trouvé. Veuillez vous connecter.'));
    // }

    // const headers = new HttpHeaders({
    //   Authorization: `Bearer ${token}`,
    //   'Content-Type': 'application/json',
    // });

    const params = new HttpParams().set('idOrganisation', idOrganisation.toString());

    return this.http.get(`${this.baseUrl}/api/getListeCompteClient`, {
      withCredentials: true,
      params,
    });
  }
}
