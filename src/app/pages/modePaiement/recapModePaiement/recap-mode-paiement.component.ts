import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
// import { RouterLink } from '@angular/router';
// import { TranfertUniqueService } from '../../../services/transfertUniqueService/tranfert-unique.service';
// import { PaiementInterneExterneService } from '../../../servicesNodes/paiementInterneExterne/paiement-interne-externe.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModePaiementService } from '../../../services/modePaiementServices/mode-paiement.service';
import { MobileMoneyService } from '../../../servicesNodes/modePaiementOperateur/mobileMoney/mobile-money.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { TranfertUniqueService } from '../../../services/transfertUniqueService/tranfert-unique.service';
import { OtpLoginServiceService } from '../../../services/otpLogin/otp-login-service.service';

@Component({
  selector: 'app-recap-mode-paiement',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './recap-mode-paiement.component.html',
  styleUrl: './recap-mode-paiement.component.css',
})
export class RecapModePaiementComponent implements OnInit {
  constructor(
    private tranfertUniqueService: TranfertUniqueService,
    private toastr: ToastrService,
    private modePaiementService: ModePaiementService,
    private mobileMoneyService: MobileMoneyService,
    private router: Router,
    private location: Location,
    private otpService: OtpLoginServiceService,
    // private paiementInterneExterneService: PaiementInterneExterneService,
  ) {}

  /* =====================================================
     SECTION 1 — DONNÉES DU RÉCAPITULATIF
  ===================================================== */
  selectedBeneficiaire: any;
  infosCompteDebiteur: any;
  InfosFormulaireModePaiement: any;
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
  loginEmail: string | null = '';

  /* =====================================================
     INITIALISATION
  ===================================================== */
  ngOnInit(): void {
    this.loginEmail = localStorage.getItem('loginEmail');
    this.InfosFormulaireModePaiement = this.getFromStorage(
      'InfosFormulaireModePaiement',
    );
    this.userInfo = this.getFromStorage('userInfo');

    this.vcPhoneNumber = this.userInfo.vcPhoneNumber;
    console.log('this.vcPhoneNumber: ', this.vcPhoneNumber);

    console.log('InfosPaiement :', this.InfosFormulaireModePaiement);
    console.log('User Info :', this.userInfo);
  }

  formaterDate(date: string | number): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // 01-12
    const day = String(d.getDate()).padStart(2, '0'); // 01-31
    return `${year}-${month}-${day}`; // format ISO pour ton API
  }

  decodeMessage(encoded: string): string {
    if (!encoded) return encoded;

    return (
      encoded
        // replacement des séquences courantes
        .replace(/\+á/g, 'à')
        .replace(/\+é/g, 'é')
        .replace(/\+è/g, 'è')
        .replace(/\+®/g, 'é')
        .replace(/\+ç/g, 'ç')
        .replace(/\+ô/g, 'ô')
        .replace(/\+°/g, 'ô')
        .replace(/\+ù/g, 'ù')
        .replace(/\+/g, ' ') // transformer les + restants en espaces
        .trim()
    );
  }


  reference: any;
  transaction_id: any;

  // 🔥 SUBMIT MOBILE
  addMobileMoneyTransaction(): void {
    const payload = {
      vcPayerAccount: this.InfosFormulaireModePaiement?.payload.vcPayerAccount,
      vcBenefAccount: this.InfosFormulaireModePaiement?.payload.vcBenefAccount,
      mAmount: this.InfosFormulaireModePaiement?.payload.mAmount,
      vcOperatorAccount:
        this.InfosFormulaireModePaiement?.payload.vcOperatorAccount,
      mFees: this.InfosFormulaireModePaiement?.payload.mFees,
      vcNotes: this.InfosFormulaireModePaiement?.payload.vcNotes,
      vcOperationType:
        this.InfosFormulaireModePaiement?.payload.vcOperationType,
      iTransactionID: this.transaction_id,
    };

    console.log('Payload Mobile Money sow :', payload);

    this.mobileMoneyService.payerMobileMoney(payload).subscribe({
      next: (res) => {
        console.log("res: ", res);
        if(res.status === 200){
        this.toastr.success("Transaction effectuée avec succès ✅", '', {
          positionClass: 'toast-custom-center',
        });
        this.isLoading = false;
        this.router.navigate(['/historiqueTransactions']);
        localStorage.removeItem('InfosFormulaireModePaiement');
        } else{
          this.isLoading = false;
          this.toastr.success(this.decodeMessage(res.message), '', {
          positionClass: 'toast-custom-center',
        });
        }
      },
      error: (err) => {
        this.toastr.error('Une erreur interne est survenu', '', {
          positionClass: 'toast-custom-center',
        });
        console.error('Erreur paiement :', err);
        // toast erreur ic
      },
    });
  }

  submitMobileMoney(): void {
    const payload = {
      payer_account: this.InfosFormulaireModePaiement?.payload.vcPayerAccount,
      benef_account: this.InfosFormulaireModePaiement?.payload.vcBenefAccount,
      amount: this.InfosFormulaireModePaiement?.payload.mAmount,
      operator_account:
        this.InfosFormulaireModePaiement?.payload.vcOperatorAccount,
      fees: this.InfosFormulaireModePaiement?.payload.mFees,
      notes: this.InfosFormulaireModePaiement?.payload.vcNotes,
      operation_type: this.InfosFormulaireModePaiement?.payload.vcOperationType,
      organisation_id: this.userInfo.iOrganisationID,
      user_id: this.userInfo.id,
    };

    // console.log('Payload Mobile Money :', payload);

    this.modePaiementService.addMobileMoneyTransaction(payload).subscribe({
      next: (res) => {
        // console.log('Paiement réussi :', res);
        if (
          res.data.reference &&
          res.data.transaction_id &&
          res.status === 200
        ) {
          // this.toastr.success(res.message, '', {
          //   positionClass: 'toast-custom-center',
          // });
          this.reference = res.data.reference;
          this.transaction_id = res.data.transaction_id;
          this.addMobileMoneyTransaction();
        } else{
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error('Une erreur interne est survenue.', '', {
          positionClass: 'toast-custom-center',
        });
        console.error('Erreur paiement :', err);
        // toast erreur ic
      },
    });
  }

  private getFromStorage(key: string) {
    return JSON.parse(localStorage.getItem(key) || '{}');
  }

  // /* =====================================================
  //    OUVERTURE / FERMETURE MODAL
  // ===================================================== */
  // loadiongConfirmeOtp: boolean = false;
  // confirmer(): void {
  //   this.loadiongConfirmeOtp = true;

  //   // Envoi OTP via service
  // }

  /* =====================================================
     OUVERTURE / FERMETURE MODAL
  ===================================================== */
  loadiongConfirmeOtp: boolean = false;
  openModalOtp(): void {
    this.loadiongConfirmeOtp = true;
    this.startCountdown();

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
            // this.toastr.success('OTP envoyé avec succès', '', {
            //   positionClass: 'toast-custom-center',
            // });
            this.submitMobileMoney();
          } else {
            this.isLoading = false;
            this.toastr.error(response.message, '', {
              positionClass: 'toast-custom-center',
            });
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
    console.log('this.loginEmail: ', this.loginEmail);
    // if (!this.canResend) return;
    this.otpService.reenvoiOtp(this.loginEmail).subscribe({
      next: (response) => {
        this.isLoadingRenvoyez = false;
        this.otpValues = ['', '', '', ''];
        if (response.status === 200) {
          this.toastr.success(response.message, '', {
            positionClass: 'toast-custom-center',
          });
        } else {
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

  retour() {
    this.location.back();
    localStorage.removeItem('InfosFormulaireModePaiement');
  }
}
