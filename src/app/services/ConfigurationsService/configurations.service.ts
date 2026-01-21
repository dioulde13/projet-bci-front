import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Config } from '../../interfaces/config';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationsService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Modification des informations de configurations
  updateMultipleConfigs(
    iOrganisationID: number,
    configs: Config[],
    idUsers: number,
    idPays: number,
    appName: string = 'Banking web site',
  ): Observable<any> {
    const body = {
      iOrganisationID,
      configs,
      idUsers,
      idPays,
      appName
    };

    console.log('body api : ', body);

    return this.http.post(`${this.baseUrl}/api/UpdateUsersConfig`, body);
  }

  getListePays(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/getListePays`);
  }
}
