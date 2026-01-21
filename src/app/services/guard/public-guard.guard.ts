// src/app/services/guard/public-guard.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../authServices/auth.service';
@Injectable({
  providedIn: 'root',
})
export class PublicGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // Vérifie si l'utilisateur est connecté
    if (this.authService.isAuthenticated()) {
      if (window.history.length > 1) {
        // Si connecté, redirige vers le tableau de bord
        // return this.router.createUrlTree(['/dashboard']);
        window.history.back();
        return false;
      }
      //  else {
      //   return this.router.createUrlTree(['/dashboard']);
      // }
    }
    // Sinon, l'utilisateur n'est pas connecté, on autorise l'accès à la page de login.
    return true;
  }
}