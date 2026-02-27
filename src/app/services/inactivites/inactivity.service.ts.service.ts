import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root',
})
export class InactivityServiceTsService {
  private timeoutId: any;
  private warningTimeoutId: any;
  private isWatching = false; // ⬅️ Empêche les doublons d'écouteurs
  private warningShown = false; // ⬅️ Empêche les notifications multiples

  private readonly TIMEOUT_DURATION = 60 * 1000;
  private readonly WARNING_BEFORE = 30 * 1000;

  private readonly EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

  // ⬅️ Référence stable pour pouvoir retirer les listeners correctement
  private boundResetTimer = () => this.resetTimer();

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private notification: NotificationService
  ) {}

  startWatching(): void {
    if (this.isWatching) return; // ⬅️ Ne pas démarrer deux fois
    this.isWatching = true;

    this.ngZone.runOutsideAngular(() => {
      this.EVENTS.forEach(event =>
        window.addEventListener(event, this.boundResetTimer)
      );
    });

    this.resetTimer();
  }

  private resetTimer(): void {
    clearTimeout(this.timeoutId);
    clearTimeout(this.warningTimeoutId);
    this.warningShown = false; // ⬅️ Réinitialiser le flag à chaque activité

    // Timer 1 : avertissement affiché une seule fois à t=30s
    this.warningTimeoutId = setTimeout(() => {
      this.ngZone.run(() => {
        if (!this.warningShown) { // ⬅️ N'afficher qu'une seule fois
          this.warningShown = true;
          this.notification.warning(
            "Vous serez déconnecté dans 30 secondes en raison d'inactivité."
          );
        }
      });
    }, this.TIMEOUT_DURATION - this.WARNING_BEFORE);

    // Timer 2 : déconnexion à t=60s
    this.timeoutId = setTimeout(() => {
      this.ngZone.run(() => this.logout());
    }, this.TIMEOUT_DURATION);
  }

  private logout(): void {
    // this.notification.error('Session expirée. Vous avez été déconnecté.');
    localStorage.removeItem('token');
    this.stopWatching();
    this.router.navigate(['/login']);
  }

  stopWatching(): void {
    clearTimeout(this.timeoutId);
    clearTimeout(this.warningTimeoutId);
    this.isWatching = false;
    this.warningShown = false;
    // ⬅️ Fonctionne maintenant car on utilise boundResetTimer (même référence)
    this.EVENTS.forEach(event =>
      window.removeEventListener(event, this.boundResetTimer)
    );
  }
}