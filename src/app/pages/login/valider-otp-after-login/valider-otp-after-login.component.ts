import {
  Component,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { OtpLoginServiceService } from '../../../services/otpLogin/otp-login-service.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/authServices/auth.service';

import { ToastrService } from 'ngx-toastr';
import { AuthServicesNodes } from '../../../servicesNodes/authServices/auth.service';

@Component({
  selector: 'app-valider-otp-after-login',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './valider-otp-after-login.component.html',
  styleUrls: ['./valider-otp-after-login.component.css'],
})
export class ValiderOtpAfterLoginComponent implements AfterViewInit, OnInit {
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;
  otpValues: string[] = ['', '', '', ''];
  isLoading = false;
  isLoadingReEnvoi: boolean = false;
  errorMessage = '';
  message = '';

  loginEmail: string | null = '';

  ngOnInit() {
    this.loginEmail = localStorage.getItem('loginEmail');

    this.authServiceNode.login(String(this.loginEmail)).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {},
    });
  }

  // Modals
  showModalSuccess: boolean = false;
  showModalError: boolean = false;
  showModalOTP_expire: boolean = false;

  constructor(
    private otpService: OtpLoginServiceService,
    private router: Router,
    private authService: AuthService,
    private authServiceNode: AuthServicesNodes,
    private toastr: ToastrService
  ) {}

  moveToNext(event: any, index: number) {
    const input = event.target;
    const value = input.value;

    // Sauvegarde la valeur
    this.otpValues[index] = value.slice(-1);

    // Déplacement du focus
    if (value.length === 1 && index < this.otpInputs.length - 1) {
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
    } else if (value.length === 0 && index > 0) {
      this.otpInputs.toArray()[index - 1].nativeElement.focus();
    }

    // Si toutes les cases sont remplies => soumettre automatiquement
    if (this.isOtpComplete()) {
      setTimeout(() => {
        this.submitOtp();
      }, 200);
    }
  }

  submitOtp() {
    if (this.isLoading) return; // Empêche double envoi

    if (!this.isOtpComplete()) {
      this.errorMessage = 'Veuillez remplir tous les champs OTP.';
      return;
    }

    const otp = this.otpValues.join('');
    this.isLoading = true;
    this.errorMessage = '';

    this.otpService.verifierOtp(otp, this.loginEmail).subscribe({
      next: (response) => {
        this.isLoading = false;
                  console.log("retour api:",response);
                  console.log("status api:",response.status);

        if (response?.status && response.status === 200) {
          console.log("success api:",response);
          this.authService.setUserInfo(response.data);
          this.authService.setUserInfoConfig(response.config);
          this.toastr.success('Connexion réussie avec succès...', '', {
            positionClass: 'toast-custom-center',
          });
          this.router.navigate(['/dashboard']);
        } else {
          // apres  3 tantative d'envoi d'otp l'utilisateur est bloquer.
          if(response.status === 405){
            this.router.navigate(['/login']);
          }
          this.toastr.error(response.message, '', {
            positionClass: 'toast-custom-center',
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error(err.message, '', {
          positionClass: 'toast-custom-center',
        });
      },
    });
  }

  isOtpComplete(): boolean {
    return this.otpValues.every((value) => value.trim() !== '');
  }

  // 🔹 Après que les inputs soient initialisés
  ngAfterViewInit() {
    // Focus sur le premier input OTP
    if (this.otpInputs && this.otpInputs.first) {
      setTimeout(() => {
        this.otpInputs.first.nativeElement.focus();
      }, 100); // délai pour s'assurer que la vue est rendue
    }
  }

  reEnvoiOtp() {
    this.isLoadingReEnvoi = true;
    this.otpService.reenvoiOtp(this.loginEmail).subscribe({
      next: (response) => {
        this.isLoadingReEnvoi = false;
        this.otpValues = ['', '', '', ''];
        if (response.status === 200) {
          this.toastr.success(response.message, '', {
            positionClass: 'toast-custom-center',
          });
        }else{
          this.toastr.error(response.message, '', {
            positionClass: 'toast-custom-center',
          });
          console.log(response);
        }
      },
      error: (err) => {
        this.isLoadingReEnvoi = false;
        this.toastr.error(err.error.message, '', {
          positionClass: 'toast-custom-center',
        });
      },
    });
  }

  closeModalOtpExpire() {
    this.showModalOTP_expire = false;
  }

  closeModalError() {
    this.showModalError = false;
  }
}
