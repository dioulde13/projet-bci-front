import { CommonModule } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { VerifierOtpAfterVerifiTokenService } from '../../../services/verifierOtpAfterVerifiToken/verifier-otp-after-verifi-token.service';
import { OtpAfterChangeInfoService } from '../../../services/otp-after-change-info/otp-after-change-info.service';

@Component({
  selector: 'app-verifie-otp-after-verifi-token',
  imports: [FormsModule, CommonModule, MatSnackBarModule],
  standalone: true,
  templateUrl: './verifie-otp-after-verifi-token.component.html',
  styleUrl: './verifie-otp-after-verifi-token.component.css',
})
export class VerifieOtpAfterVerifiTokenComponent {
  @ViewChildren('otp0, otp1, otp2, otp3') otpInputs!: QueryList<ElementRef>;
  otpValues: string[] = ['', '', '', ''];
  isLoading = false;
  errorMessage = '';

  // Contrôle des modals
  showModalSuccess: boolean = false;
  showModalError: boolean = false;
  showModalOTP_expire: boolean = false;

  loginEmail: string | null = '';
  userEmail: string | null = '';

  // Constructuer
  constructor(
    private otpService: VerifierOtpAfterVerifiTokenService,
    private otpRenvoiService: OtpAfterChangeInfoService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  // A l'initialisation
  ngOnInit() {
    this.loginEmail = localStorage.getItem('loginEmail');
    this.userEmail = localStorage.getItem('userEmail');
  }

  moveToNext(event: any, index: number) {
    const input = event.target;
    const value = input.value;
    if (value.length === 1 && index < this.otpInputs.length - 1) {
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
    } else if (value.length === 0 && index > 0) {
      this.otpInputs.toArray()[index - 1].nativeElement.focus();
    }

    // soumettre le formulaire si otp valide
    if (this.isOtpComplete()) {
      setTimeout(() => {
        this.submitOtp();
      }, 200);
    }
  }

  isOtpComplete(): boolean {
    return this.otpValues.every((value) => value.trim() !== '');
  }

  ngAfterViewInit(): void {
    if (this.otpInputs && this.otpInputs.first) {
      setTimeout(() => {
        this.otpInputs.first.nativeElement.focus();
      }, 100);
    }
  }

  isLoadingReEnvoi: boolean = false;

  message = '';
  reEnvoiOtp() {
    this.isLoadingReEnvoi = true;
    this.email = localStorage.getItem('email_recu');

    this.otpRenvoiService.resentOTP(this.email).subscribe({
      next: (response) => {
        if (response?.status && response.status === 200) {
          this.isLoadingReEnvoi = false;
          this.otpValues = ['', '', '', ''];

          this.toastr.success(response.message, '', {
            positionClass: 'toast-custom-center',
          });

          if (this.otpInputs && this.otpInputs.first) {
            setTimeout(() => {
              this.otpInputs.first.nativeElement.focus();
            }, 100);
          }
        }
        console.log(response);
      },
      error: (err) => {
        this.isLoadingReEnvoi = false;
        console.log(err);

        this.toastr.success(err, '', {
          positionClass: 'toast-custom-center',
        });

        this.otpValues = ['', '', '', ''];
        if (this.otpInputs && this.otpInputs.first) {
          setTimeout(() => {
            this.otpInputs.first.nativeElement.focus();
          }, 100);
        }
      },
    });
  }

  email: string | null = null;

  submitOtp() {
    if (this.isLoading) return;

    if (!this.isOtpComplete()) {
      this.errorMessage = 'Veuillez remplir tous les champs OTP.';
      return;
    }

    const otp = this.otpValues.join('');
    this.isLoading = true;
    this.errorMessage = '';

    console.log('params envoyer otp : ', otp);

    this.email = localStorage.getItem('email_recu');

    // Appel au service de verification de l'email
    this.otpService.verifyOTP(otp, this.email).subscribe({
      next: (response) => {
        console.log('all respnse : ', response);

        this.isLoading = false;
        if (response?.status && response.status === 200) {
          console.log('res : ', response);

          // this.toastr.success('Numéro de téléphone vérifié avec succès', '', {
          //   positionClass: 'toast-custom-center',
          // });

          this.toastr.success(response?.message, '', {
            positionClass: 'toast-custom-center',
          });
          this.router.navigate(['/formulaireMotDePasse']);
          // localStorage.removeItem('userEmail');
        } else {
          // Apres 3 tentatives on bloque l'utilisateur et on lui redirige sur la page de connexion
          if (response?.status === 405 || response?.status === '405') {
            this.router.navigate(['/login']);
          }

          this.toastr.error(response.message, '', {
            positionClass: 'toast-custom-center',
          });
        }
        console.log(response);
      },
      error: (err) => {
        this.isLoading = false;
        console.log({ err });
        this.toastr.error(err?.message, '', {
          positionClass: 'toast-custom-center',
        });
      },
    });
  }

  // Fermer le modal d'expiration d'OTP
  closeModalOtpExpire() {
    this.showModalOTP_expire = false;
  }

  // Fermer le modal d'erreur
  closeModalError() {
    this.showModalError = false;
  }
}
