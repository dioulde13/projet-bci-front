import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InactivityServiceTsService } from '../inactivites/inactivity.service.ts.service';

@Injectable({
  providedIn: 'root',
})
export class OtpLoginServiceService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private inactivityService: InactivityServiceTsService, // ✅ injection du service d’inactivité
    // private router: Router
  ) {}

  // ✅ Vérification du code OTP
  verifierOtp(
    otp: string,
    email: string | null,
    appName: string = 'Banking web site'
  ): Observable<any> {
    const body = { otp, email, appName };
    console.log('📤 Envoi OTP:', body);

    return this.http.post<any>(`${this.baseUrl}/api/verify-otp`, body).pipe(
      tap((response: any) => {
        // ✅ Si la vérification est réussie
        if (response) {
          console.log('✅ OTP validé avec succès.');

          // 🔐 Sauvegarde du token pour la session
          // localStorage.setItem('token', response.token);

          // 🚀 Démarrage automatique de la surveillance d’inactivité
          this.inactivityService.startWatching();

          // 🔁 Redirection vers le tableau de bord (ou autre)
          // this.router.navigate(['/dashboard']); // à adapter selon ta route
        } else {
          console.warn('⚠️ OTP valide mais pas de token retourné.');
        }
      }),
      catchError((err) => {
        console.error('❌ Erreur lors de la vérification OTP:', err);
        return throwError(() => new Error(err?.message || 'Erreur du serveur'));
      })
    );
  }

  // 🔁 Réenvoi de l’OTP
  reenvoiOtp( email: string | null, appName: string = 'Banking web site'): Observable<any> {
    const body = {email, appName };
    // console.log('📤 Réenvoi OTP:', body);

    return this.http
      .post<any>(`${this.baseUrl}/api/RenvoiOTP`, body)
      .pipe(
        catchError((err) =>
          throwError(() => new Error(err?.message || 'Erreur du serveur'))
        )
      );
  }
}
