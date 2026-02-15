import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModePaiementService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

    addMobileMoneyTransaction(payload: any): Observable<any> {
      const url = `${this.baseUrl}/api/transactions/mobile-money`;
  
      return this.http.post<any>(url, payload, { withCredentials: true }).pipe(
        tap((response) => {
          console.log('✅ Transaction envoyée:', response);
        }),
        catchError((error) => {
          console.error('❌ Erreur lors de la transaction:', error);
          return throwError(() => new Error(error?.message || 'Erreur du serveur'));
        }),
      );
    }
}
