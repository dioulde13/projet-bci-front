// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
  withXsrfConfiguration
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { cookieInterceptor } from './services/intercepteur/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideToastr(),

    // Router
    provideRouter(routes),

    // HttpClient avec cookies et XSRF
    provideHttpClient(
      withFetch(),
      withInterceptors([cookieInterceptor]),
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',   // cookie créé par le serveur
        headerName: 'X-XSRF-TOKEN', // header ajouté automatiquement
      })
    ),

    // Stratégie de routing
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy,
    },
  ],
};
