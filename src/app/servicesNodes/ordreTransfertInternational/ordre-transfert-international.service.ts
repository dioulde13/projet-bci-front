import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { ErrorHandlingService } from './error-handling.service';

@Injectable({
  providedIn: 'root'
})
export class OrdreTransfertInternationalService {

  private http = inject(HttpClient);
  private errorService = inject(ErrorHandlingService);

  private baseUrl = environment.apiUrlNode;
  private apiUrl = environment.apiUrl;

  // --- HELPER : Applique la logique de gestion d'erreur à un flux ---
  private handle<T>(obs: Observable<T>): Observable<T> {
    return obs.pipe(
      switchMap((res) => this.errorService.handleApiResponse<T>(res)),
      catchError((err) => {
        // 1. Si l'erreur vient de handleApiResponse (elle a déjà déclenché un Toast)
        // On vérifie si l'erreur est déjà "marquée" comme traitée
        if (err && err._alreadyHandled) {
          return throwError(() => err);
        }

        // 2. Si c'est une erreur HTTP brute (404 URL, 500, Réseau)
        // On l'envoie vers le handler global
        return this.errorService.handleHttpError(err);
      }),
    );
  }

  getSwiftDetails(vcBIC: string): Observable<any> {
    return this.handle(
      this.http.post(
        `${this.baseUrl}/api/bank/detail`,
        { vcBIC },
        { withCredentials: true },
      ),
    );
  }

  getBeneficiairesActive(): Observable<any> {
    return this.handle(
      this.http.get(`${this.baseUrl}/api/beneficiaries/active`, {
        withCredentials: true,
      }),
    );
  }

  getCountryName(isoCode: string): Observable<any> {
    // Pour l'API externe WorldBank, on utilise handleHttpError mais peut-être pas handleApiResponse
    // car leur format de réponse est différent.
    return this.http
      .get(`https://dev-api-bcibankjs.ecash-guinee.com/api/country/${isoCode}`)
      .pipe(catchError((err) => this.errorService.handleHttpError(err)));
  }

  getAccountInfo(accountNumber: string): Observable<any> {
    return this.handle(
      this.http.post<any>(
        `${this.baseUrl}/api/account/info`,
        { vcAccountNumber: accountNumber },
        { withCredentials: true },
      ),
    );
  }

  getCurrencyRate(from: string, to: string): Observable<any> {
    return this.handle(
      this.http.post<any>(
        `${this.baseUrl}/api/currencyRate`,
        { vcCurrencyFrom: from, vcCurrencyTo: to },
        { withCredentials: true },
      ),
    );
  }

  getInfoOrganisation(idOrganisation: number): Observable<any> {
    return this.handle(
      this.http.get(
        `${this.apiUrl}/api/getInfoOrganisationAndListeCompteClient?idOrganisation=${idOrganisation}`,
        { withCredentials: true },
      ),
    );
  }

  createTransfert(formData: FormData): Observable<any> {
    return this.handle(
      this.http.post(
        `${this.apiUrl}/api/addInternationalTransactionPending`,
        formData,
        { withCredentials: true },
      ),
    );
  }

  /**
   * Validation finale de la transaction (Interne/Externe)
   */
  validateTransactionInterneExterne(data: any): Observable<any> {
    return this.handle(
      this.http.post(`${this.baseUrl}/api/transaction/interne/externe`, data, {
        withCredentials: true,
      }),
    );
  }
}
