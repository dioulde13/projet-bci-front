import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthServicesNodes {
  private baseUrlNode = environment.apiUrlNode;

  constructor(private http: HttpClient) {}

  login(email: string): Observable<any> {
    const body = { email };

    return this.http.post(`${this.baseUrlNode}/api/auth/login`, body, {
      withCredentials: true,
    });
  }

  listeUtilisateur(idResponsable: number): Observable<any> {
    const body = {
      idResponsable: idResponsable,
    };

    return this.http.post(
      `${this.baseUrlNode}/api/user-responsable/listeUsers`,
      body,
      { withCredentials: true }
    );
  }

  listeRole(iOrganisationID: number): Observable<any> {
    const body = {
      iOrganisationID: iOrganisationID,
    };

    return this.http.post(`${this.baseUrlNode}/api/roles`, body, {
      withCredentials: true,
    });
  }

  bloquerDebloquer(id: number, btEnabled: number): Observable<any> {
    const body = {
      id: id,
      btEnabled: btEnabled,
    };

    return this.http.post(
      `${this.baseUrlNode}/api/users-activation/toggle-activation`,
      body,
      { withCredentials: true }
    );
  }
}
