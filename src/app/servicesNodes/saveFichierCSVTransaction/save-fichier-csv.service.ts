import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SaveFichierCSVService {

 private baseUrl = environment.apiUrlNode;

  constructor(private http: HttpClient) {}

  saveFichierCSVTransaction(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/beneficiaire/importBeneficiary`, payload);
  }
}
