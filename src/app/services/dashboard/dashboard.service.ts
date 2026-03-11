import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private baseUrl = environment.apiUrl;
  private baseUrlNode = environment.apiUrlNode;


  constructor(private http: HttpClient) {}

  // Récupère le token depuis localStorage
  // getToken(): string | null {
  //   return localStorage.getItem('token');
  // }

  

  // Récupère la liste des comptes clients pour une organisation
  getListeCompteClient(idOrganisation: number): Observable<any> {
  
    const params = new HttpParams().set(
      'idOrganisation',
      idOrganisation.toString(),
    );

    return this.http.get(`${this.baseUrl}/api/getListeCompteClient`, {
      withCredentials: true,
      params,
    });
  }

   // Récupère la liste des comptes clients pour une organisation
  getListeCompteClientAoujout(idOrganisation: number): Observable<any> {
  
    const params = new HttpParams().set(
      'idOrganisation',
      idOrganisation.toString(),
    );

    return this.http.get(`${this.baseUrl}/api/getListeCompteClientAoujout`, {
      withCredentials: true,
      params,
    });
  }

  getSwiftDetails(vcBIC: string): Observable<any> {
    const body = { vcBIC: vcBIC };

    return this.http.post(`${this.baseUrlNode}/api/bank/detail`, body, {
      withCredentials: true,
    });
  }
}
