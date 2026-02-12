import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SaveFichierCSVService {
  private baseUrl = environment.apiUrlNode;

  constructor(private http: HttpClient) {}

  saveFichierCSVTransaction(
    file: File,
    iOrganisationID: number,
    iEnterpriseID: number,
  ): Observable<any> {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('iOrganisationID', iOrganisationID.toString());
    formData.append('iEnterpriseID', iEnterpriseID.toString());
    console.log('formData: ', formData);

    return this.http.post(
      `${this.baseUrl}/api/beneficiaire/importBeneficiary`,
      formData,
    );
  }
}
