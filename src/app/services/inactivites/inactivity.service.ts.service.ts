import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../authServices/auth.service';

@Injectable({
  providedIn: 'root',
})
export class InactivityServiceTsService {
  private timeoutId: any;
  private warningTimeoutId: any;
  private countdownInterval: any;

  private readonly INACTIVITY_TIME = 15 * 60 * 1000; // 15 min
  private readonly WARNING_TIME = 30 * 1000; // 30 sec
  private countdownValue = 30;

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  // 🚀 Démarrer la surveillance
  startWatching(): void {
    this.resetTimer();

    ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach((event) =>
      window.addEventListener(event, () => this.resetTimer())
    );

    console.log('🟢 Surveillance d’inactivité démarrée.');
  }

  // 🛑 Stopper la surveillance
  stopWatching(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId);
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.toastr.clear();

    ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach((event) =>
      window.removeEventListener(event, () => this.resetTimer())
    );

    console.log('🔴 Surveillance d’inactivité arrêtée.');
  }

  private resetTimer(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId);
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.toastr.clear();

    this.ngZone.runOutsideAngular(() => {
      this.timeoutId = setTimeout(() => {
        this.ngZone.run(() => this.handleInactivity());
      }, this.INACTIVITY_TIME);

      this.warningTimeoutId = setTimeout(() => {
        this.ngZone.run(() => this.showWarningToastr());
      }, this.INACTIVITY_TIME - this.WARNING_TIME);
    });
  }

  private showWarningToastr(): void {
    this.countdownValue = this.WARNING_TIME / 1000;

    const toast = this.toastr.error(
      `Vous allez être déconnecté dans ${this.countdownValue} secondes.`,
      '',
      {
        disableTimeOut: true,
        tapToDismiss: false,
        closeButton: false,
        positionClass: 'toast-custom-center',
      }
    );

    this.countdownInterval = setInterval(() => {
      this.countdownValue--;
      if (this.countdownValue > 0) {
        const message =
          this.countdownValue > 1
            ? `Vous allez être déconnecté dans ${this.countdownValue} secondes.`
            : `Vous allez être déconnecté dans 1 seconde.`;

        if (toast.toastRef.componentInstance) {
          toast.toastRef.componentInstance.message = message;
        }
      } else {
        clearInterval(this.countdownInterval);
        this.toastr.clear();
        this.handleInactivity();
      }
    }, 1000);
  }

  private handleInactivity(): void {
    console.log('⏳ Utilisateur inactif — déconnexion automatique.');
    // Déconnexion via le backend, session cookie
    this.authService.deConnexion().subscribe({
      next: () => {
        this.stopWatching();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.stopWatching();
        this.router.navigate(['/login']);
      },
    });
  }
}
