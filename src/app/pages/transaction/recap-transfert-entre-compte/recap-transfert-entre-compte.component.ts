import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { TranfertUniqueService } from '../../../services/transfertUniqueService/tranfert-unique.service';
import { OtpLoginServiceService } from '../../../services/otpLogin/otp-login-service.service';
import { CurrencyRateService } from '../../../servicesNodes/currencyRate/currency-rate.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { PaiementInterneExterneService } from '../../../servicesNodes/paiementInterneExterne/paiement-interne-externe.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recap-transfert-entre-compte',
  imports: [CommonModule, FormsModule],
  templateUrl: './recap-transfert-entre-compte.component.html',
  styleUrl: './recap-transfert-entre-compte.component.css',
})
export class RecapTransfertEntreCompteComponent implements OnInit {
  constructor(
    private tranfertUniqueService: TranfertUniqueService,
    private location: Location,
    private otpService: OtpLoginServiceService,
    private currencyRateService: CurrencyRateService,
    private notification: NotificationService,
    // private toastr: ToastrService,
    private paiementInterneExterneService: PaiementInterneExterneService,
    private router: Router,
  ) {}

  /* =====================================================
     SECTION 1 — DONNÉES DU RÉCAPITULATIF
  ===================================================== */
  infosCompte1: any = null;
  infosCompte2: any = null;
  payload: any = null;
  userInfo: any = null;

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
     TAUX & CONVERSION
  ===================================================== */
  currencyRate: any = null;
  montantBenConverti: any = null;
  tauxConversion: any = null;
  InfosTransfertEntreCompte: any = null;

  /* =====================================================
     INITIALISATION
  ===================================================== */
  ngOnInit(): void {
    this.loginEmail = localStorage.getItem('loginEmail');
    this.userInfo = this.getFromStorage('userInfo');
    this.vcPhoneNumber = this.userInfo?.vcPhoneNumber;

    // 🔥 Clés exactes du localStorage (visibles dans la capture)
    this.InfosTransfertEntreCompte = this.getFromStorage(
      'InfosTransfertEntreCompte',
    );
    // this.infosCompte1 = this.getFromStorage('infosCompte1');
    // this.infosCompte2 = this.getFromStorage('infosCompte2');
    // this.payload = this.getFromStorage('payload');

    console.log('InfosTransfertEntreCompte :', this.InfosTransfertEntreCompte);
    this.infosCompte1 = this.InfosTransfertEntreCompte.infosCompte1;
    this.infosCompte2 = this.InfosTransfertEntreCompte.infosCompte2;
    this.payload = this.InfosTransfertEntreCompte.payload;

    // console.log('infosCompte1 :', this.infosCompte1);
    // console.log('infosCompte2 :', this.infosCompte2);
    // console.log('payload      :', this.payload);

    this.getTauxEchange();
  }

  /* =====================================================
     TAUX D'ÉCHANGE
  ===================================================== */
  getTauxEchange(): void {
    const deviseCompte1 = this.infosCompte1?.devise;
    const deviseCompte2 = this.infosCompte2?.devise;

    if (!deviseCompte1 || !deviseCompte2) return;

    this.currencyRateService
      .getCurrencyRate(deviseCompte1, deviseCompte2)
      .subscribe({
        next: (response: any) => {
          this.currencyRate = response.data;
          this.calculerConversion();
        },
        error: (err) => {
          console.error('Erreur taux échange :', err);
        },
      });
  }

  calculerConversion(): void {
    const montantDeb = this.payload?.mAmount;
    if (!montantDeb) return;

    const taux = this.currencyRate?.nRate ?? 1;
    this.tauxConversion = taux;
    this.montantBenConverti = montantDeb * taux;
  }

  /* =====================================================
     UTILITAIRES
  ===================================================== */
  formaterDate(date: string | number): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  retour(): void {
    this.location.back();
  }

  private getFromStorage(key: string): any {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  /* =====================================================
     MODAL OTP — OUVERTURE
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
            this.notification.success('OTP envoyé avec succès');
          } else {
            this.loadiongConfirmeOtp = false;
            this.notification.error(response.message);
          }
        },
        error: () => {
          this.loadiongConfirmeOtp = false;
          this.notification.error("Erreur lors de l'envoi de l'OTP");
        },
      });

    setTimeout(() => {
      this.otpInputs.first?.nativeElement.focus();
    }, 100);
  }

  reference: any;
  transaction_id: any;

  envoyerTransaction() {
    const payload = {
      payer_name: this.infosCompte1.name,
      payment_date: this.formaterDate(this.payload.dtPaymentDate),
      payer_account: this.payload.compteDebiteur,
      benef_name: this.infosCompte2.name,
      benef_account: this.payload.compteBeneficiaire,
      // benef_bic_code: this.selectedBeneficiaire.vcBIC,
      amount: this.payload.mAmount,
      benef_currency: this.infosCompte2.devise,
      // type: this.selectedBeneficiaire.typaiementPaiement,
      organisation_id: this.userInfo.iOrganisationID,
      user_id: this.userInfo.id,
      // payment_mode_id: this.selectedBeneficiaire.idTypePaiement,
      // receiverBankName: this.selectedBeneficiaire?.vcName,
      devise_debiteur: this.infosCompte1?.devise,
      montant_converti: this.montantBenConverti,
      rate: this.tauxConversion,
    };

    console.log('payload: ', payload);

    this.tranfertUniqueService.sendTransaction(payload).subscribe({
      next: (res) => {
        console.log('res: ', res);
        if (res.status === 200) {
          if (res.data.reference && res.data.transaction_id) {
            this.reference = res.data.reference;
            this.transaction_id = res.data.transaction_id;
            this.submitFormPayementInterneExterne();
          } else {
            this.isLoading = false;
          }
          // this.toastr.success(res.data.message);
        }
      },
      error: (err) => {
        this.notification.error('Une erreur interne est survenue.');
        // this.toastr.error('Une erreur interne est survenue.');
        this.isLoading = false;
      },
    });
  }

  submitFormPayementInterneExterne(): void {
    // console.log('DIoulde: ', this.selectedBeneficiaire.vcCurrency);
    const payload = {
      vcPayerName: this.infosCompte1.name,
      dtPaymentDate: this.formaterDate(this.payload.dtPaymentDate),
      vcPaymentReference: this.reference,
      vcPayerAccount: this.payload.compteDebiteur,
      vcBenefName: this.infosCompte2.name,
      mAmount: this.payload.mAmount,
      vcBenefAccount: this.payload.compteBeneficiaire,
      // vcBenefBicCode: this.selectedBeneficiaire.vcBIC,
      vcCorrespBicCode: '',
      vcBenefCurrency: this.infosCompte2.devise,
      iTransactionID: this.transaction_id,
    };

    console.log('Payload Mobile Money :', payload);

    this.paiementInterneExterneService
      .payementInterneExterne(payload)
      .subscribe({
        next: (res) => {
          // console.log('Paiement réussi :', res);
          if (res.status === 200) {
            this.modalOtp = false;
            this.notification.success(
              'La transaction a été effectuée avec succès',
            );

            this.isLoading = false;
            this.router.navigate(['/historiqueTransactions']);
            localStorage.removeItem('InfosSaisirDansFormulaire');
            localStorage.removeItem('selectedBeneficiaire');
            localStorage.removeItem('infosCompteDebiteur');
          } else {
            this.isLoading = false;
            this.modalOtp = false;
            this.notification.error(res.message);
            // this.toastr.error(res.message, '', {
            //   positionClass: 'toast-custom-center',
            // });
          }
        },
        error: (err) => {
          this.modalOtp = false;
          // console.error('Erreur paiement :', err);
          // this.toastr.error('Une erreur interne est survenu', '', {
          //   positionClass: 'toast-custom-center',
          // });
          this.notification.error('Une erreur interne est survenu');
        },
      });
  }

  /* =====================================================
     VÉRIFICATION OTP
  ===================================================== */
  verifyOtp(): void {
    this.isLoading = true;
    const otpCode = this.otpValues.join('');

    if (otpCode.length !== 4) {
      this.errorMessage = 'Code OTP incomplet.';
      this.isLoading = false;
      return;
    }

    this.tranfertUniqueService
      .verifyOTPConfirmmeTransaction(otpCode, this.vcPhoneNumber)
      .subscribe({
        next: (response: any) => {
          if (response.status === 200) {
            // 🔥 Appeler ici votre service de transfert entre comptes
            this.envoyerTransaction();
            this.isLoading = false;
          } else {
            this.isLoading = false;
            this.otpValues = ['', '', '', ''];
            this.notification.error(response.message);
          }
        },
        error: () => {
          this.isLoading = false;
          this.notification.error("Erreur lors de la vérification de l'OTP");
        },
      });
  }

  /* =====================================================
     MODAL OTP — FERMETURE
  ===================================================== */
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
    this.otpService.reenvoiOtp(this.loginEmail).subscribe({
      next: (response) => {
        this.isLoadingRenvoyez = false;
        this.otpValues = ['', '', '', ''];
        if (response.status === 200) {
          this.notification.success(response.message);
        } else {
          this.notification.error(response.message);
        }
      },
      error: () => {
        this.isLoadingRenvoyez = false;
        this.notification.error('Une erreur interne est survenue.');
      },
    });
  }
}
