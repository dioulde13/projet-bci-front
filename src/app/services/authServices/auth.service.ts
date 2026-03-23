import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';
import { InactivityServiceTsService } from '../inactivites/inactivity.service.ts.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private appVersion = environment.appVersion.vcVersion;

  // ✅ Signals
  private _userInfo = signal<any | null>(null);
  private _userInfoConfig = signal<any | null>(null);

  // ✅ Exposition lecture seule
  userInfo = this._userInfo.asReadonly();
  userInfoConfig = this._userInfoConfig.asReadonly();

  constructor(private http: HttpClient,
    private inactivityService: InactivityServiceTsService
  ) {
    // console.log('%c[AuthService] ✅ Initialisation du service', 'color: cyan;');
    this.restoreFromLocalStorage();
  }

  // 🧩 Restauration du localStorage
  restoreFromLocalStorage(): void {
    // console.log(
    //   '%c[AuthService] 🔹 Restauration depuis localStorage...',
    //   'color: #999;'
    // );

    const storedUser = localStorage.getItem('userInfo');
    const storedConfig = localStorage.getItem('userInfoConfig');

    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      this._userInfo.set(parsed);
      // console.log(
      //   '%c[AuthService] 🟢 Utilisateur restauré :',
      //   'color: #6f6;',
      //   parsed
      // );
    } else {
      // console.log('%c[AuthService] ⚠️ Aucun userInfo trouvé', 'color: orange;');
    }

    if (storedConfig) {
      const parsedConfig = JSON.parse(storedConfig);
      this._userInfoConfig.set(parsedConfig);
      // console.log(
      //   '%c[AuthService] ⚙️ Config restaurée :',
      //   'color: #0ff;',
      //   parsedConfig
      // );
    }
  }

  private _isAuthenticated = false; // état côté client

  /** Charge le cookie CSRF avant login */
  getCsrfCookie(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/csrf-cookie`, {
      withCredentials: true,
    });
  }

  /**
   * Connexion de l'utilisateur
   * @param email - adresse e-mail de l'utilisateur
   * @param password - mot de passe
   * @param appName - nom de l'application cliente
   * @param captchaToken - token reCAPTCHA
   * @param appVersion - version de l'application (par défaut: celle du fichier environment)
   */

  login(
    email: string,
    password: string,
    appName: string,
    captcha_token: string,
    appVersion: string = this.appVersion
  ): Observable<any> {
    const body = { email, password, captcha_token, appName, appVersion };

    // console.log('Login body:', body);

    return this.http
      .post(`${this.baseUrl}/api/auth/loginTest`, body, {
        withCredentials: true,
      })
      .pipe(tap(() => (this._isAuthenticated = true)));
  }

  // Vérifier si l’utilisateur est connecté
  isAuthenticated(): boolean {
    // ✅ côté client : état connu grâce aux login/logout
    // console.log(
    //   '%c[AuthService] 🔒 isAuthenticated() =>',
    //   'color: cyan;',
    //   this._isAuthenticated
    // );
    return this._isAuthenticated;
  }

  checkSession(): Observable<boolean> {
    return this.http
      .get(`${this.baseUrl}/api/user`, { withCredentials: true })
      .pipe(
        map((user) => {
          // si la requête réussit, l'utilisateur est connecté
          this._isAuthenticated = true;
          return true; // <-- retourne un boolean
        }),
        catchError(() => {
          this._isAuthenticated = false;
          return of(false); // <-- retourne aussi un boolean
        })
      );
  }

  /** Helper lecture cookie JS */
  public getCookieValue(name: string): string {
    const match = document.cookie.match(
      new RegExp('(^| )' + name + '=([^;]+)')
    );
    return match ? decodeURIComponent(match[2]) : '';
  }

  requestResetPassword(
    email: string,
    lienSite: string = 'https://dev-bci-banking.ecash-guinee.com',
    appName: string = 'Banking web site'
  ): Observable<any> {
    const body = { email, appName, lienSite };
    // console.log(
    //   '%c[AuthService] ✉️ Demande reset password:',
    //   'color: cyan;',
    //   body
    // );
    return this.http.post(`${this.baseUrl}/api/requestResetPassword`, body);
  }

  // -------------------- Gestion User Info --------------------

  setUserInfo(userInfo: any): void {
    // console.log(
    //   '%c[AuthService] 🟢 setUserInfo() appelé avec :',
    //   'color: #6f6;',
    //   userInfo
    // );
    const previous = this._userInfo();
    // console.log('%c[AuthService] Ancienne valeur :', 'color: gray;', previous);

    this._userInfo.set({ ...userInfo }); // clone → force la réactivité
    localStorage.setItem('userInfo', JSON.stringify(userInfo));

    // console.log(
    //   '%c[AuthService] ✅ Nouvelle valeur signal userInfo :',
    //   'color: #0f0;',
    //   this._userInfo()
    // );
  }

  getUserInfo(): any {
    // console.log('%c[AuthService] 📖 getUserInfo() appelé', 'color: #09f;');
    const user = this._userInfo();
    if (user) {
      // console.log(
      //   '%c[AuthService] ↪️ Signal actuel userInfo :',
      //   'color: #0ff;',
      //   user
      // );
      return user;
    }

    const stored = localStorage.getItem('userInfo');
    if (stored) {
      const parsed = JSON.parse(stored);
      this._userInfo.set(parsed);
      // console.log(
      //   '%c[AuthService] 🔄 Restauré depuis localStorage :',
      //   'color: #6f6;',
      //   parsed
      // );
      return parsed;
    }

    // console.warn(
    //   '%c[AuthService] ⚠️ Aucun userInfo disponible',
    //   'color: orange;'
    // );
    return null;
  }

  setUserInfoConfig(config: any): void {
    // console.log(
    //   '%c[AuthService] ⚙️ setUserInfoConfig() appelé avec :',
    //   'color: cyan;',
    //   config
    // );
    this._userInfoConfig.set(config);
    localStorage.setItem('userInfoConfig', JSON.stringify(config));
  }

  getUserInfoConfig(): any {
    // console.log(
    //   '%c[AuthService] 📖 getUserInfoConfig() appelé',
    //   'color: #09f;'
    // );
    const config = this._userInfoConfig();
    if (config) {
      // console.log(
      //   '%c[AuthService] ↪️ Signal actuel config :',
      //   'color: #0ff;',
      //   config
      // );
      return config;
    }

    const stored = localStorage.getItem('userInfoConfig');
    if (stored) {
      const parsed = JSON.parse(stored);
      this._userInfoConfig.set(parsed);
      // console.log(
      //   '%c[AuthService] 🔄 Restauré depuis localStorage :',
      //   'color: #6f6;',
      //   parsed
      // );
      return parsed;
    }

    // console.warn(
    //   '%c[AuthService] ⚠️ Aucun userInfoConfig disponible',
    //   'color: orange;'
    // );
    return null;
  }

  // // -------------------- Tokens --------------------
  // saveToken(token: string): void {
  //   console.log('%c[AuthService] 💾 Token sauvegardé', 'color: cyan;', token);
  //   localStorage.setItem('token', token);
  // }

  // getToken(): string | null {
  //   const token = localStorage.getItem('token');
  //   console.log('%c[AuthService] 🔑 getToken() =>', 'color: cyan;', token);
  //   return token;
  // }

  // logout(): void {
  //   // console.log(
  //   //   '%c[AuthService] 🚪 Déconnexion utilisateur...',
  //   //   'color: orange;'
  //   // );
  //   localStorage.removeItem('token');
  //   localStorage.removeItem('userInfo');
  //   localStorage.removeItem('userInfoConfig');
  //   this._userInfo.set(null);
  //   this._userInfoConfig.set(null);
  //   // console.log(
  //   //   '%c[AuthService] ✅ Données utilisateur effacées',
  //   //   'color: green;'
  //   // );
  // }

  deConnexion(appName: string = 'Banking web site'): Observable<any> {
    const params = new HttpParams().set('appName', appName);

    // console.log('%c[AuthService] 🚪 Déconnexion API appelée', 'color: orange;');

    return this.http
      .post(`${this.baseUrl}/api/logout`, {}, { withCredentials: true, params })
      .pipe(
        tap(() => {
          // console.log(
          //   '%c[AuthService] ✅ Déconnexion API réussie',
          //   'color: green;'
          // );
          localStorage.clear();
          this._userInfo.set(null);
          this._userInfoConfig.set(null);
          this.inactivityService.stopWatching();
        }),
        catchError((error) => {
          console.error(
            '%c[AuthService] ❌ Erreur déconnexion API :',
            'color: red;',
            error
          );
          return throwError(() => error);
        })
      );
  }


  // -------------------- Profil --------------------
  modifierProfile(
    nom: string,
    prenom: string,
    email: string,
    phoneNumber: string,
    userId: number,
    appName: string = 'Banking web site'
  ): Observable<any> {
    const params = new HttpParams()
      .set('nom', nom)
      .set('prenom', prenom)
      .set('email', email)
      .set('phoneNumber', phoneNumber)
      .set('userId', userId)
      .set('appName', appName);

    // console.log('Modifier', params.toString());

    return this.http
      .post<any>(`${this.baseUrl}/api/updateUserInfo`, null, {
        withCredentials: true,
        params,
      })
      .pipe(
        tap((res) =>
          console.log(
            '%c[AuthService] 🟩 Réponse updateUserInfo :',
            'color: #6f6;',
            res
          )
        ),
        catchError((err) => {
          console.error(
            '%c[AuthService] ❌ Erreur updateUserInfo :',
            'color: red;',
            err
          );
          return throwError(() => err);
        })
      );
  }

  updatePassword(
    ancienPassword: string,
    Nouveaupassword: string,
    email: string,
    appName: string = 'Banking web site'
  ): Observable<any> {
    console.log('%c[AuthService] 🔑 Appel updatePassword()...', 'color: cyan;');

    // const token = localStorage.getItem('token');
    // const headers = new HttpHeaders({
    //   Authorization: `Bearer ${token}`,
    //   'Content-Type': 'application/json',
    // });

    const params = new HttpParams()
      .set('appName', appName)
      .set('ancienPassword', ancienPassword)
      .set('Nouveaupassword', Nouveaupassword)
      .set('email', email);

    return this.http.post(
      `${this.baseUrl}/api/resetPasswordAfterLogin`,
      {},
      { withCredentials: true, params }
    );
  }

  creerUnNouveauUtilisateur(
    prenom: string,
    nom: string,
    email: string,
    iRoleID: number,
    PhoneNumber: string,
    modeOtp: string,
    idPays: number,
    iOrganisationID: number,
    vcDescription: string = '',
    vcPhotoSignature?: File,
    appName: string = 'Backoffice web site'
  ): Observable<any> {
    const formData = new FormData();
    formData.append('prenom', prenom);
    formData.append('nom', nom);
    formData.append('email', email);
    formData.append('iRoleID', iRoleID.toString());
    formData.append('PhoneNumber', PhoneNumber);
    formData.append('modeOtp', modeOtp);
    formData.append('idPays', idPays.toString());
    formData.append('iOrganisationID', iOrganisationID.toString());
    formData.append('vcDescription', vcDescription);
    formData.append('appName', appName);

    if (vcPhotoSignature) {
      formData.append('vcPhotoSignature', vcPhotoSignature);
    }

    return this.http.post(`${this.baseUrl}/api/addUserssiteclient`, formData, {
      withCredentials: true,
    });
  }
  getListePays(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/getListePays`);
  }
}
