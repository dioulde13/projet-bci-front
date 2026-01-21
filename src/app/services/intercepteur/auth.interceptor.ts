// import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { Router } from '@angular/router';
// import { catchError, throwError } from 'rxjs';

// export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
//   const router = inject(Router);
//   const token = localStorage.getItem('token');

//   // Cloner la requête avec le token si présent
//   const authReq = token
//     ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
//     : req;

//   return next(authReq).pipe(
//     catchError((error: HttpErrorResponse) => {
//       if (error.status === 401) {
//         // Token expiré ou invalide → déconnexion
//         localStorage.clear();
//         router.navigateByUrl('/login');
//       }
//       return throwError(() => error);
//     })
//   );
// };


// src/app/services/intercepteur/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const cookieInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Cloner la requête pour envoyer les cookies avec toutes les requêtes
  const reqWithCookies = req.clone({ withCredentials: true });

  return next(reqWithCookies).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Session expirée ou cookie invalide → redirection vers login
        router.navigateByUrl('/login');
      }
      return throwError(() => error);
    })
  );
};


