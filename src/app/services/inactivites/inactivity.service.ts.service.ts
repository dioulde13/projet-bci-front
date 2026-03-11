import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root',
})
export class InactivityServiceTsService {
  private timeoutId: any;
  private warningTimeoutId: any;

  private isWatching = false;
  private warningShown = false;

  private readonly TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private readonly WARNING_BEFORE = 60 * 1000; // Avertissement 1 min avant

  private readonly EVENTS = [
    'mousemove',
    'keydown',
    'click',
    'scroll',
    'touchstart',
  ];

  // Référence stable pour removeEventListener
  private boundResetTimer = () => this.resetTimer();

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private notification: NotificationService,
  ) {}

  // 🚀 Démarrer la surveillance
  startWatching(): void {
    if (this.isWatching) return;

    this.isWatching = true;

    this.ngZone.runOutsideAngular(() => {
      this.EVENTS.forEach((event) =>
        window.addEventListener(event, this.boundResetTimer),
      );
    });

    this.resetTimer();
  }

  // 🔄 Réinitialiser le timer à chaque activité
  private resetTimer(): void {
    clearTimeout(this.timeoutId);
    clearTimeout(this.warningTimeoutId);

    this.warningShown = false;

    const warningTime = this.TIMEOUT_DURATION - this.WARNING_BEFORE;

    // 🔔 Timer d’avertissement
    if (warningTime > 0) {
      this.warningTimeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          if (!this.warningShown) {
            this.warningShown = true;
            this.notification.error(
              "Vous serez déconnecté dans 30 secondes en raison d'inactivité.",
            );
          }
        });
      }, warningTime);
    }

    // 🚪 Timer de déconnexion
    this.timeoutId = setTimeout(() => {
      this.ngZone.run(() => this.logout());
    }, this.TIMEOUT_DURATION);
  }

  // 🚪 Déconnexion
  private logout(): void {
    this.notification.error('Session expirée. Vous avez été déconnecté.');

    localStorage.removeItem('token');

    this.stopWatching();

    this.router.navigate(['/login']);
  }

  // 🛑 Arrêter la surveillance
  stopWatching(): void {
    clearTimeout(this.timeoutId);
    clearTimeout(this.warningTimeoutId);

    this.isWatching = false;
    this.warningShown = false;

    this.EVENTS.forEach((event) =>
      window.removeEventListener(event, this.boundResetTimer),
    );
  }
}
