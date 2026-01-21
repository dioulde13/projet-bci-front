// import { Injectable } from '@angular/core';
// import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
// import { Observable } from 'rxjs';
// import { AuthService } from '../authServices/auth.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthGuard implements CanActivate {
//   constructor(private authService: AuthService, private router: Router) {}

//   canActivate(
//     route: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot
//   ): Observable<boolean> | Promise<boolean> | boolean {
//     // Vérifier si l'utilisateur est authentifié et si le token n'est pas expiré
//     if (this.authService.isAuthenticated()) {
//       return true; // Accès autorisé
//     } else {
//       // Redirige vers la page de login avec un paramètre de retour (facultatif)
//       this.authService.logout(); // Supprimer le token si expiré
//       this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
//       return false; // Bloque l'accès
//     }
//   }
// }


import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../authServices/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Vérifie la session côté serveur via cookie
    return this.authService.checkSession().pipe(
      map((isLoggedIn: boolean) => {
        if (isLoggedIn) return true;

        // Session invalide → redirection login
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }),
      catchError(() => {
        // En cas d’erreur serveur → redirection login
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return of(false);
      })
    );
  }
}


