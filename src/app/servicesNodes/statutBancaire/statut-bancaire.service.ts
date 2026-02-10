import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatutBancaireService {
  private baseUrl = environment.apiUrlNode;

  constructor(private http: HttpClient) {}

  coreBankingStatus(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/core_banking/status`);
  }
}
