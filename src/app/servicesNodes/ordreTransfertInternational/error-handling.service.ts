import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlingService {
  private toastr = inject(ToastrService);

  /**
   * Analyse la réponse de l'API (Succès ou Erreur métier encapsulée)
   */
  handleApiResponse<T>(response: any): Observable<T> {
    if (response && (response.status === 200 || response.status === 201)) {
      return of(response);
    }

    // Extraction et nettoyage du message
    const msg = this.decodeErrorText(
      response?.message || 'Une erreur est survenue',
    );
    this.toastr.error(msg);

    const errorWithMarker = { ...response, _alreadyHandled: true };

    return throwError(() => errorWithMarker);
  }
  /**
   * Gestion des erreurs HTTP réelles (crash serveur, 404 URL, réseau)
   */
  handleHttpError(error: any): Observable<never> {
    console.error('Erreur Système capturée:', error);

    const msg =
      error?.error?.message ||
      error?.message ||
      'Impossible de contacter le serveur';

    this.toastr.error(this.decodeErrorText(msg));

    return throwError(() => error);
  }

  /**
   * Petit utilitaire pour nettoyer les textes mal encodés si nécessaire
   */
  private decodeErrorText(text: string): string {
    try {
      return text.replace(/\+®/g, 'é');
    } catch {
      return text;
    }
  }
}