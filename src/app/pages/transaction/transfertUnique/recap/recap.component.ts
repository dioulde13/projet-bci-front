import {
  Component,
  OnInit,
  QueryList,
  ViewChildren,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranfertUniqueService } from '../../../../services/transfertUniqueService/tranfert-unique.service';
import { ToastrService } from 'ngx-toastr';
import { PaiementInterneExterneService } from '../../../../servicesNodes/paiementInterneExterne/paiement-interne-externe.service';
import { Location } from '@angular/common';
import { OtpLoginServiceService } from '../../../../services/otpLogin/otp-login-service.service';

@Component({
  selector: 'app-recap',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recap.component.html',
  styleUrl: './recap.component.css',
})
export class RecapComponent implements OnInit {
  constructor(
    private tranfertUniqueService: TranfertUniqueService,
    private toastr: ToastrService,
    private router: Router,
    private paiementInterneExterneService: PaiementInterneExterneService,
    private location: Location,
    private otpService: OtpLoginServiceService,
  ) {}

  /* =====================================================
     SECTION 1 — DONNÉES DU RÉCAPITULATIF
  ===================================================== */
  selectedBeneficiaire: any;
  infosCompteDebiteur: any;
  infosFormulaire: any;
  userInfo: any;

  /* =====================================================
     SECTION 2 — MODAL OTP
  ===================================================== */
  modalOtp = false;
  otpValues: string[] = ['', '', '', ''];
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  /* =====================================================
     SECTION 3 — TIMER & RENVOI OTP
  ===================================================== */
  countdown = 60;
  canResend = false;
  private timer: any;
  isLoading = false;
  isLoadingRenvoyez = false;
  errorMessage = '';

  vcPhoneNumber: any;

  /* =====================================================
     INITIALISATION
  ===================================================== */

  loginEmail: string | null = '';

  ngOnInit(): void {
    this.loginEmail = localStorage.getItem('loginEmail');
    this.selectedBeneficiaire = this.getFromStorage('selectedBeneficiaire');
    this.infosCompteDebiteur = this.getFromStorage('infosCompteDebiteur');
    this.infosFormulaire = this.getFromStorage('InfosSaisirDansFormulaire');
    this.userInfo = this.getFromStorage('userInfo');
    this.vcPhoneNumber = this.userInfo.vcPhoneNumber;
    console.log('this.vcPhoneNumber: ', this.vcPhoneNumber);
  }

  formaterDate(date: string | number): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // 01-12
    const day = String(d.getDate()).padStart(2, '0'); // 01-31
    return `${year}-${month}-${day}`; // format ISO pour ton API
  }

  reference: any;
  transaction_id: any;

  envoyerTransaction() {
    const payload = {
      payer_name: this.infosCompteDebiteur.name,
      payment_date: this.formaterDate(this.infosFormulaire.dtPaymentDate),
      payer_account: this.infosFormulaire.vcPayerAccount,
      benef_name:
        this.selectedBeneficiaire.vcFirstName +
        ' ' +
        this.selectedBeneficiaire.vcLastName,
      benef_account: this.selectedBeneficiaire.vcAccountNumber,
      benef_bic_code: this.selectedBeneficiaire.vcBIC,
      amount: this.infosFormulaire.mAmount,
      benef_currency: this.selectedBeneficiaire.vcCurrency,
      type: this.selectedBeneficiaire.typaiementPaiement,
      organisation_id: this.userInfo.iOrganisationID,
      user_id: this.userInfo.id,
      payment_mode_id: this.selectedBeneficiaire.idTypePaiement,
    };

    // console.log('payload: ', payload);

    this.tranfertUniqueService.sendTransaction(payload).subscribe({
      next: (res) => {
        // console.log('res: ', res);
        if (res.data.reference && res.data.transaction_id) {
          this.reference = res.data.reference;
          this.transaction_id = res.data.transaction_id;
          this.submitFormPayementInterneExterne();
          // this.toastr.success(res.data.message);
        }
      },
      error: (err) => {
        this.toastr.error(err.message || 'Erreur lors de la transaction');
      },
    });
  }

  submitFormPayementInterneExterne(): void {
    const payload = {
      vcPayerName: this.infosCompteDebiteur.name,
      dtPaymentDate: this.formaterDate(this.infosFormulaire.dtPaymentDate),
      vcPaymentReference: this.reference,
      vcPayerAccount: this.infosFormulaire.vcPayerAccount,
      vcBenefName:
        this.selectedBeneficiaire.vcFirstName +
        ' ' +
        this.selectedBeneficiaire.vcLastName,
      mAmount: this.infosFormulaire.mAmount,
      vcBenefAccount: this.selectedBeneficiaire.vcAccountNumber,
      vcBenefBicCode: this.selectedBeneficiaire.vcBIC,
      vcCorrespBicCode: '',
      vcBenefCurrency: this.selectedBeneficiaire.vcCurrency,
      iTransactionID: this.transaction_id,
    };

    // console.log('Payload Mobile Money :', payload);

    this.paiementInterneExterneService
      .payementInterneExterne(payload)
      .subscribe({
        next: (res) => {
          // console.log('Paiement réussi :', res);
          if (res.status === 200) {
            this.modalOtp = false;
            this.toastr.success(res.message, '', {
              positionClass: 'toast-custom-center',
            });
            this.router.navigate(['/historiqueTransactions']);
            localStorage.removeItem('InfosSaisirDansFormulaire');
            localStorage.removeItem('selectedBeneficiaire');
            localStorage.removeItem('infosCompteDebiteur');
          } else {
            this.modalOtp = false;
            this.toastr.error(res.message, '', {
              positionClass: 'toast-custom-center',
            });
          }
        },
        error: (err) => {
          this.modalOtp = false;
          // console.error('Erreur paiement :', err);
          this.toastr.error(
            'Une erreur interne est survenu',
            '',
            {
              positionClass: 'toast-custom-center',
            },
          );
        },
      });
  }

  retour() {
    this.location.back();
    localStorage.removeItem('InfosSaisirDansFormulaire');
    localStorage.removeItem('selectedBeneficiaire');
    localStorage.removeItem('infosCompteDebiteur');
  }

  private getFromStorage(key: string) {
    return JSON.parse(localStorage.getItem(key) || '{}');
  }

  /* =====================================================
     OUVERTURE / FERMETURE MODAL
  ===================================================== */
  loadiongConfirmeOtp: boolean = false;
  openModalOtp(): void {
    this.loadiongConfirmeOtp = true;
    this.startCountdown();

    // Envoi OTP via service
    this.tranfertUniqueService
      .sendOtpTransaction(this.vcPhoneNumber)
      .subscribe({
        next: (response: any) => {
          if (response.status === 200) {
            this.loadiongConfirmeOtp = false;
            this.modalOtp = true;
            this.toastr.success('OTP envoyé avec succès', '', {
              positionClass: 'toast-custom-center',
            });
          } else {
            this.toastr.error(response.message, '', {
              positionClass: 'toast-custom-center',
            });
          }
        },
        error: (err) => {
          this.toastr.error('Erreur lors de l’envoi de l’OTP', '', {
            positionClass: 'toast-custom-center',
          });
          console.error(err);
        },
      });

    // Focus sur le premier input OTP
    setTimeout(() => {
      this.otpInputs.first?.nativeElement.focus();
    }, 100);
  }

  verifyOtp(): void {
    this.isLoading = true;
    const otpCode = this.otpValues.join('');

    if (otpCode.length !== 4) {
      this.errorMessage = 'Code OTP incomplet.';
      return;
    }

    // Envoi OTP via service
    this.tranfertUniqueService
      .verifyOTPConfirmmeTransaction(otpCode, this.vcPhoneNumber)
      .subscribe({
        next: (response: any) => {
          if (response.status === 200) {
            this.isLoading = false;
            // this.toastr.success('OTP envoyé avec succès', '', {
            //   positionClass: 'toast-custom-center',
            // });
              this.otpValues = ['', '', '', ''];
            this.envoyerTransaction();
          } else {
            this.isLoading = false;
            this.toastr.error(response.message, '', {
              positionClass: 'toast-custom-center',
            });
             this.otpValues = ['', '', '', ''];
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error('Erreur lors de l’envoi de l’OTP', '', {
            positionClass: 'toast-custom-center',
          });
          console.error(err);
        },
      });

    // this.isLoading = true;
    // this.errorMessage = '';
  }

  closeModalOtp(): void {
    this.modalOtp = false;
    this.resetOtp();
    clearInterval(this.timer);
  }

  private resetOtp(): void {
    this.otpValues = ['', '', '', ''];
  }

  /* =====================================================
     GESTION SAISIE OTP
  ===================================================== */
  moveToNext(event: any, index: number): void {
    const value = event.target.value;

    if (value.length === 1 && index < this.otpInputs.length - 1) {
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
    }

    if (value.length === 0 && index > 0) {
      this.otpInputs.toArray()[index - 1].nativeElement.focus();
    }
  }

  isOtpComplete(): boolean {
    return this.otpValues.every((v) => v.trim() !== '');
  }

  /* =====================================================
     COUNTDOWN & RENVOI OTP
  ===================================================== */
  startCountdown(): void {
    this.canResend = false;
    this.countdown = 60;

    this.timer = setInterval(() => {
      this.countdown--;

      if (this.countdown <= 0) {
        clearInterval(this.timer);
        this.canResend = true;
      }
    }, 1000);
  }

 reEnvoiOtp(): void {
     this.isLoadingRenvoyez = true;
    // if (!this.canResend) return;
    this.otpService.reenvoiOtp(this.loginEmail).subscribe({
      next: (response) => {
        this.isLoadingRenvoyez = false;
        this.otpValues = ['', '', '', ''];
        if (response.status === 200) {
          this.toastr.success(response.message, '', {
            positionClass: 'toast-custom-center',
          });
        }else{
          this.toastr.error(response.message, '', {
            positionClass: 'toast-custom-center',
          });
          // console.log(response);
        }
      },
      error: (err) => {
        this.isLoadingRenvoyez = false;
        this.toastr.error(err.error.message, '', {
          positionClass: 'toast-custom-center',
        });
      },
    });
  }
}
