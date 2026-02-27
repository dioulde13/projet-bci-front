// // src/app/app.config.ts
// import { ApplicationConfig } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { routes } from './app.routes';
// import {
//   provideHttpClient,
//   withFetch,
//   withInterceptors,
//   withXsrfConfiguration
// } from '@angular/common/http';
// import { provideAnimations } from '@angular/platform-browser/animations';
// import { provideToastr } from 'ngx-toastr';
// import { LocationStrategy, PathLocationStrategy } from '@angular/common';
// import { cookieInterceptor } from './services/intercepteur/auth.interceptor';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideAnimations(),
//     provideToastr(),

//     // Router
//     provideRouter(routes),

//     // HttpClient avec cookies et XSRF
//     provideHttpClient(
//       withFetch(),
//       withInterceptors([cookieInterceptor]),
//       withXsrfConfiguration({
//         cookieName: 'XSRF-TOKEN',   // cookie créé par le serveur
//         headerName: 'X-XSRF-TOKEN', // header ajouté automatiquement
//       })
//     ),

//     // Stratégie de routing
//     {
//       provide: LocationStrategy,
//       useClass: PathLocationStrategy,
//     },
//   ],
// };



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
    provideToastr({
      positionClass: 'toast-top-center',
      timeOut: 12000,
      extendedTimeOut: 12000,
      closeButton: true,
      progressBar: true,
      preventDuplicates: true,
      easing: 'ease-in',
      easeTime: 300,
    }),

    provideRouter(routes),

    provideHttpClient(
      withFetch(),
      withInterceptors([cookieInterceptor]),
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      })
    ),

    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy,
    },
  ],
};
