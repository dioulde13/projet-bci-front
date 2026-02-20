import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxCaptchaModule } from 'ngx-captcha';
import { AuthService } from '../../services/authServices/auth.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../services/notification/notification.service';
// import { error } from 'jquery';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    NgxCaptchaModule,
    ReactiveFormsModule,
    CommonModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  sousCription() {
    // Exemple : rediriger vers la page mot de passe oublié
    this.router.navigate(['/reunitialiserMotPasse']);

    // ou bien ouvrir un modal
    // this.showModal = true;
  }

  loginForm!: FormGroup;
  
  // siteKey: string = '6LfowNgrAAAAAOxng04whZbCR8mPQZyc2iLtNZQx';
  // siteKey: string = '6LfNstgrAAAAAHnIIdUeCuDyv7IBMWfEOh2uzWhF';
  siteKey: string = '6LfVN9UrAAAAABnkhkRbaBBFeT5P5I7SO9OPXBVp';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private notification: NotificationService
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      recaptcha: ['', Validators.required],
    });
  }
  passwordVisible = false; // false = masque, true = visible
  // bascule visibilité
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  message = '';
  success = false;
  loading = false;

 onSubmit() {
  if (this.loginForm.valid) {
    this.loading = true;
    this.message = '';

    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;
    const captcha_token = this.loginForm.get('recaptcha')?.value;
    const appName = 'Banking web site'; // ← corrigé

    console.log('Formulaire valide:', {
      email,
      password,
      appName,
      captcha_token,
    });

    this.authService.getCsrfCookie().subscribe({
      next: () => {
        // Appel à l'API via le service AuthService
        this.authService
          .login(email, password, appName, captcha_token)
          .subscribe({
            next: (res) => {
              console.log("response:",res);
              if (res.status === 200) {
                this.notification.success('Otp envoyé avec succès');
                localStorage.setItem('loginEmail', email);
                this.router.navigate(['/validerOtpLogin']);
              } else {
                // console.log("res:",res);
                // console.log("message:",res.message);
                this.notification.error(res.message);
               
              }
              this.loading = false;
            },
            error: (err) => {
              this.notification.error("Une erreur interne est survenue.");
              this.loading = false;
            }
          });
      },
      error: (error: any) => {
        // Gérer l'erreur si getCsrfCookie échoue
        console.error('Erreur CSRF:', error);
        this.loading = false;
      }
    });

  } else {
    this.toastr.error(
      'Formulaire invalide !! Veuillez remplir tous les champs.',
      '',
      {
        positionClass: 'toast-custom-center',
      }
    );
  }
}


  onCaptchaSuccess(token: string) {
    console.log('✅ reCAPTCHA validé ! Token =', token);
  }

  onCaptchaError() {
    console.log(
      '❌ Erreur reCAPTCHA : échec du chargement ou validation impossible'
    );
  }

  onCaptchaReset() {
    console.log(
      '🔄 reCAPTCHA réinitialisé par l’utilisateur ou automatiquement'
    );
  }
}
