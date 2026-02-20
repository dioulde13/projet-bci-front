import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { MarchandService } from '../../../servicesNodes/paiementsMarchandEGD/marchand.service';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { GnfNumberFormatDirective } from '../../../directives/gnf-number-format.directive';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionsBillPendingService } from '../../../services/transactionsBillPendingServices/transactions-bill-pending.service';
import { TranfertUniqueService } from '../../../services/transfertUniqueService/tranfert-unique.service';
import { OtpLoginServiceService } from '../../../services/otpLogin/otp-login-service.service';
import { GetAccountNameService } from '../../../servicesNodes/verifierNomDebiteur/get-account-name.service';

declare var bootstrap: any;

@Component({
  selector: 'app-paiements-de-factures-edg',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GnfNumberFormatDirective,
  ],
  templateUrl: './paiements-de-factures-edg.component.html',
  styleUrl: './paiements-de-factures-edg.component.css',
})
export class PaiementsDeFacturesEDGComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private marchandService: MarchandService,
    private listeCompteCLientService: DashboardService,
    private transactionsBillPendingService: TransactionsBillPendingService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private tranfertUniqueService: TranfertUniqueService,
    private router: Router,
    private otpService: OtpLoginServiceService,
    private getAccount: GetAccountNameService,
  ) {}

  paymentForm!: FormGroup;

  facturiers: any[] = [];
  selectedFacturier: any = null;

  iOrganisationID!: number;
  infosUser: any;

  selectedDebitAccount = '';

  loading = true;
  errorMessage = '';
  typesCompte = '';
  listeCompteClient: any[] = [];

  nomFacture: string | null = null;
  loginEmail: string | null = '';

  ngOnInit(): void {
    this.loginEmail = localStorage.getItem('loginEmail');
    const rawNomFacture = this.route.snapshot.paramMap.get('nomFacture');

    this.nomFacture = rawNomFacture
      ? decodeURIComponent(rawNomFacture).trim().toUpperCase()
      : null;

    console.log('this.nomFacture: ', this.nomFacture);

    this.initForm();
    this.initialPrepayerEDG();
    this.initialPostPayer();
    this.initPostpayerForm();
    this.getAllFacturiers();

    const userJson = localStorage.getItem('userInfo');
    if (userJson) {
      try {
        this.infosUser = JSON.parse(userJson);
      } catch {
        this.infosUser = null;
      }
    }

    if (this.infosUser?.iOrganisationID) {
      this.iOrganisationID = this.infosUser.iOrganisationID;
      this.vcPhoneNumber = this.infosUser.vcPhoneNumber;
      this.getListeCompteClient();
    } else {
      console.warn('iOrganisationID non défini');
      this.loading = false;
    }

    this.loginAvoirTokenEdg();
  }

  loginAvoirTokenEdg() {
    this.marchandService.loginAvoirTokenEdg().subscribe({
      next: (response: any) => {
        this.marchandService.saveToken(response.token);
        console.log('response: ', response);
      },
    });
  }

  activeTab: string = 'tab1';

  selectedTab: string = 'prepaid'; // valeur par défaut

  onTabChange(tab: string) {
    this.selectedTab = tab;
    console.log('Onglet sélectionné:', this.selectedTab);
  }

  paymentFormPostpayerEDG!: FormGroup;

  afficherInfosPostpayer = false;
  loadingEDGPostpayer = false;
  loadingPostpayer = false;
  compteurValidePostpayer = false;

  infosCompteurPostpayer: any = null;
  facturesCompteur: any; // pour stocker toutes les factures

  initPostpayerForm(): void {
    this.paymentFormPostpayerEDG = this.fb.group({
      numeroCompteurPostpayer: [''],
    });
  }

  // 🔒 chiffres uniquement
  onlyNumbersPostpayer(event: any): void {
    const value = event.target.value.replace(/[^0-9]/g, '');
    this.paymentFormPostpayerEDG
      .get('numeroCompteurPostpayer')
      ?.setValue(value, { emitEvent: false });
  }

  // 🔥 appelé automatiquement quand l’input perd le focus
  onCompteurBlurPostpayer(): void {
    const compteur = this.paymentFormPostpayerEDG.get(
      'numeroCompteurPostpayer',
    )?.value;

    // console.log('compteur:', compteur);

    // Reset UI
    this.afficherInfosPostpayer = false;
    this.compteurValidePostpayer = false;
    this.infosCompteurPostpayer = null;
    this.facturesCompteur = [];

    // Vérification simple
    if (!compteur || compteur.length < 5) {
      return;
    }

    this.afficherInfosPostpayer = true;
    this.loadingEDGPostpayer = true;
    this.loadingPostpayer = true;

    const msisdn = '666421034';

    // 🔍 Vérifier le compteur + récupérer les factures
    this.marchandService.verifierCompteurPostpayer(compteur, msisdn).subscribe({
      next: (res) => {
        console.log('Réponse API brute:', res);

        const apiData = res?.data?.[0];

        if (!apiData?.APIResponse) {
          this.compteurValidePostpayer = false;
          this.loadingEDGPostpayer = false;
          this.loadingPostpayer = false;
          return;
        }

        let parsed: any;
        try {
          parsed = JSON.parse(apiData.APIResponse);
        } catch (e) {
          console.error('Erreur JSON.parse', e);
          this.compteurValidePostpayer = false;
          this.loadingEDGPostpayer = false;
          this.loadingPostpayer = false;
          return;
        }

        // console.log('APIResponse parsée:', parsed);

        // ✅ SUCCESS = returnId === 0
        if (parsed.returnId === 0) {
          this.compteurValidePostpayer = true;
          this.infosCompteurPostpayer = parsed;

          if (Array.isArray(parsed.content)) {
            this.facturesCompteur = parsed.content;
            console.log('this.facturesCompteur: ', this.facturesCompteur);
          }
        } else {
          this.compteurValidePostpayer = false;
        }

        this.loadingEDGPostpayer = false;
        this.loadingPostpayer = false;
      },

      error: (error: any) => {
        console.error('Erreur API:', error);
        // this.compteurValidePostpayer = false;
        // this.loadingEDGPostpayer = false;
        console.log('error: ', error);
        this.toastr.error(error.error.message, '', {
          positionClass: 'toast-custom-center',
          timeOut: 12000, // 12 secondes
          extendedTimeOut: 3000, // optionnel
          closeButton: true, // optionnel
        });
        this.loadingPostpayer = false;
      },
    });
  }

  //Debut code Prepayer EDG
  paymentFormPrepayerEDG!: FormGroup;

  afficherInfosPrepayer = false;
  loadingEDGPrepayer = false;
  loadingPrepayer = false;
  compteurValidePrepayer = false;

  infosCompteurPrepayer: any = null;

  montantEDG: number = 0;
  montantTotalEDG: number = 0;

  initialPrepayerEDG(): void {
    this.paymentFormPrepayerEDG = this.fb.group({
      debitAccountEDG: ['', Validators.required],
      numeroCompteurPrepayer: ['', Validators.required],
      montantEDG: ['', Validators.required],
      notesEDG: [''],
    });

    this.paymentFormPrepayerEDG
      .get('montantEDG')
      ?.valueChanges.subscribe((value) => {
        const montant = this.parseMontant(value);
        this.montantEDG = montant;
        this.calculerMontantTotal(montant);
      });
  }

  parseMontant(value: any): number {
    if (!value) return 0;

    return (
      Number(
        value
          .toString()
          .replace(/\s/g, '') // enlève les espaces
          .replace(/,/g, ''), // enlève les virgules
      ) || 0
    );
  }

  goBack() {
    window.history.back();
  }

  calculerMontantTotal(montant: number): void {
    let fraisEcash = 0;
    let fraisBank = 0;

    if (!montant || montant <= 0) {
      this.montantTotalEDG = 0;
      return;
    }

    if (this.btFeesIncluded) {
      // Ecash inclus → 0
      fraisEcash = 0;

      // Bank
      fraisBank = this.btFeesBankUsePercent
        ? (montant * Number(this.fraisNFeesBankEDG)) / 100
        : Number(this.fraisNFeesBankEDG);
    } else {
      // Ecash
      fraisEcash = this.btFeesUsePercent
        ? montant * Number(this.fraisNFeesEDG / 100)
        : Number(this.fraisNFeesEDG);

      // Bank
      fraisBank = this.btFeesBankUsePercent
        ? montant * Number(this.fraisNFeesBankEDG / 100)
        : Number(this.fraisNFeesBankEDG);
    }
    if (this.btFeesIncluded) {
      this.montantTotalEDG = montant;
    } else {
      this.montantTotalEDG = montant + fraisEcash + fraisBank;
    }
  }

  ligneSelectionner: any;
  fraisNFeesEDG: any;
  fraisNFeesBankEDG: any;
  btFeesUsePercent: boolean = false;
  btFeesBankUsePercent: boolean = false;
  btFeesIncluded: boolean = false;
  photoRecuperer: any;
  vcAccountName: any;
  vcAccountType: any;

  getAllFacturiers(): void {
    this.marchandService.getAllFacturiers().subscribe({
      next: (res) => {
        this.facturiers = res?.data ?? [];

        // Filtrer les facturiers dont le nom correspond à this.nomFacture
        this.ligneSelectionner = this.facturiers.filter((l: any) => {
          console.log('l.FacturierName: ', l.FacturierName);
          console.log('this.nomFacture: ', this.nomFacture);
          return l.FacturierName === this.nomFacture; // condition de filtrage
        });

        console.log('this.ligneSelectionner: ', this.ligneSelectionner[0]);
        this.vcAccountType = this.ligneSelectionner[0].vcAccountType;
        console.log('this.vcAccountType: ', this.vcAccountType);
        this.vcAccountName = this.ligneSelectionner[0].vcAccountName;
        this.photoRecuperer = this.ligneSelectionner[0].vcLogoPath;
        this.fraisNFeesEDG = this.ligneSelectionner[0].nFees;
        this.fraisNFeesBankEDG = this.ligneSelectionner[0].nFeesBank;
        this.btFeesUsePercent = this.ligneSelectionner[0].btFeesUsePercent;
        this.btFeesBankUsePercent =
          this.ligneSelectionner[0].btFeesBankUsePercent;
        this.btFeesIncluded = this.ligneSelectionner[0].btFeesIncluded;
        console.log('this.facturiers: ', this.facturiers);
      },
      error: (err) => {
        console.error('Erreur chargement facturiers', err);
      },
    });
  }

  onDebitAccountSelectEDGPost(event: Event): void {
    const value = (event.target as HTMLSelectElement)?.value;
    if (value) this.getAccountName(value);
  }

  onDebitAccountSelectEDG(event: Event): void {
    const value = (event.target as HTMLSelectElement)?.value;
    if (value) this.onDebitAccountChangeEDG(value);
  }

  onDebitAccountChangeEDG(accountNumber: string): void {
    console.log(accountNumber);
    this.getAccountName(accountNumber);
  }


soldeDebiteur: any = null;
devise: any = null;
loadingGetBalance: boolean = false;

getAccountName(accountNumber: string): void {
  this.loadingGetBalance = true;

  this.getAccount.getNomDebiteur(accountNumber).subscribe({
    next: (res) => {
      this.soldeDebiteur = res?.data?.soldeDisp ?? null;
      this.devise = res?.data?.devise ?? null;
      this.loadingGetBalance = false;

      console.log('this.soldeDebiteur: ', this.soldeDebiteur);
    },
    error: () => {
      this.soldeDebiteur = null;
      this.devise = null;
      this.loadingGetBalance = false;
    },
  });
}


  // reference: any;
  transaction_id: any;

  loadingPrepayerEDG: boolean = false;

  submitPayementPrepayerEDGBillPending() {
    // if (this.paymentFormPrepayerEDG.invalid) {
    //   this.paymentFormPrepayerEDG.markAllAsTouched();
    //   return;
    // }
    console.log('this.selectedTab: ', this.selectedTab);

    this.loadingPrepayerEDG = true;

    // console.log('this.ligneSelectionner: ', this.ligneSelectionner);

    const v = this.paymentFormPrepayerEDG.value;
    const post = this.postpayModalForm.value;

    console.log('post: ', post);

    // Détermine si les frais sont inclus
    const feesIncluded = this.btFeesIncluded;

    // Calcul des frais
    const feesEcash = feesIncluded ? 0 : Number(this.fraisNFeesBankEDG);

    // Si nFeesBank est un pourcentage (ex: 0.025 pour 2.5%)
    const feesBCI = this.fraisNFeesBankEDG;

    // Total envoyé dans l’API
    const payload = {
      payer_account:
        this.vcAccountType === 'PREPAID'
          ? v.debitAccountEDG
          : post.modalDebitAccountPost,
      benef_name: this.vcAccountName ?? '',
      benef_account: 'BeneficiaireGN98-7654-3210-9876',
      amount:
        this.vcAccountType === 'PREPAID'
          ? this.montantTotalEDG
          : post.modalMontantPost,
      fees_ecash: feesEcash,
      fees_bci: feesBCI,
      fees_included: feesIncluded ? 1 : 0,
      notes:
        this.vcAccountType === 'PREPAID' ? 'Prépaiement' : 'Poste de paiement',
      organisation_id: this.iOrganisationID,
      user_id: this.infosUser.id,
    };
    // infosCompteurPostpayer
    console.log('PAYLOAD ENVOYÉ 👉', payload);

    this.transactionsBillPendingService
      .transactionsBillPending(payload)
      .subscribe({
        next: (response: any) => {
          if (
            response.status === 200 &&
            response.data.reference &&
            response.data.transaction_id
          ) {
            this.transaction_id = response.data.transaction_id;
            if (this.vcAccountType === 'PREPAID') {
              console.log('prepaid');
              this.submitPayementPrepayerEDG();
            } else if (this.vcAccountType === 'POSTPAID') {
              console.log('postpaid');
              this.submitPostpayPayment();
            }
            this.loadingPrepayerEDG = false;
            this.paymentForm.reset();
            //  this.reference = response.data.reference;
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error('Une erreur interne est survenue.', '', {
            positionClass: 'toast-custom-center',
          });
          this.loadingPrepayerEDG = false;
          console.error('Erreur API 👉', err);
        },
      });
  }

  // loadingPrepayerEDG: boolean = false;

  submitPayementPrepayerEDG() {
    if (this.paymentFormPrepayerEDG.invalid) {
      this.paymentFormPrepayerEDG.markAllAsTouched();
      return;
    }

    // this.loadingPrepayerEDG = true;

    // console.log('this.ligneSelectionner: ', this.ligneSelectionner);

    const v = this.paymentFormPrepayerEDG.value;

    // Détermine si les frais sont inclus
    const feesIncluded = this.btFeesIncluded;

    // Calcul des frais
    const feesEcash = feesIncluded ? 0 : Number(this.fraisNFeesBankEDG);

    // Si nFeesBank est un pourcentage (ex: 0.025 pour 2.5%)
    const feesBCI = this.fraisNFeesBankEDG;

    // Total envoyé dans l’API
    const payload = {
      vcPayerAccount: v.debitAccountEDG,
      vcBenefName: this.vcAccountName ?? '',
      vcBenefAccount: '',
      mAmount: this.montantTotalEDG,
      mFeesEcash: feesEcash,
      mFeesBCI: feesBCI,
      btFeesIncluded: feesIncluded ? 1 : 0,
      vcNotes: 'Recharment prepayer',
      iTransactionID: this.transaction_id,
    };

    console.log('PAYLOAD ENVOYÉ 👉', payload);

    this.marchandService
      .postPaiementMarchant(
        payload.vcPayerAccount,
        payload.vcBenefName,
        payload.vcBenefAccount,
        payload.mAmount,
        payload.mFeesEcash,
        payload.mFeesBCI,
        payload.vcNotes,
        payload.btFeesIncluded,
        payload.iTransactionID,
      )
      .subscribe({
        next: (response: any) => {
          console.log('Réponse API 👉', response);
          if (response.status === 200) {
            this.toastr.success('Transaction effectuée avec succès ✅', '', {
              positionClass: 'toast-custom-center',
            });
            this.isLoading = false;
            this.modalOtp = false;
            this.router.navigate(['/historiqueTransactions']);
            // this.loadingPrepayerEDG = false;
            this.paymentForm.reset();
          } else {
            this.toastr.error(response.message, '', {
              positionClass: 'toast-custom-center',
            });
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error('Une erreur interne est survenue.', '', {
            positionClass: 'toast-custom-center',
          });
          // this.loadingPrepayerEDG = false;
          console.error('Erreur API 👉', err);
        },
      });
  }

  // 🔒 chiffres uniquement
  onlyNumbersPrepayer(event: any): void {
    const value = event.target.value.replace(/[^0-9]/g, '');
    this.paymentFormPrepayerEDG
      .get('numeroCompteurPrepayer')
      ?.setValue(value, { emitEvent: false });
  }

  // 🔥 appelé automatiquement quand l’input perd le focus
  onCompteurBlurPrepayer(): void {
    const compteur = this.paymentFormPrepayerEDG.get(
      'numeroCompteurPrepayer',
    )?.value;

    // if (!compteur || compteur.length !== 11) {
    //   this.afficherInfos = false;
    //   return;
    // }

    this.afficherInfosPrepayer = true;
    this.loadingEDGPrepayer = true;
    this.loadingPrepayer = true;
    this.compteurValidePrepayer = false;
    this.infosCompteurPrepayer = null;

    const msisdn = '666421034';

    this.marchandService.verifierCompteurPrepayer(compteur, msisdn).subscribe({
      next: (res) => {
        const apiData = res?.data?.[0];

        console.log('apiData: ', apiData);

        if (apiData?.APIResponse) {
          const parsed = JSON.parse(apiData.APIResponse);

          if (parsed.status === 'OK') {
            this.compteurValidePrepayer = true;
            this.infosCompteurPrepayer = parsed;
          } else {
            this.compteurValidePrepayer = false;
          }
        } else {
          this.compteurValidePrepayer = false;
        }
        this.loadingPrepayer = false;
        this.loadingEDGPrepayer = false;
      },
      error: (error: any) => {
        console.log('error: ', error);
        this.toastr.error(error.error.message, '', {
          positionClass: 'toast-custom-center',
        });
        this.loadingPrepayer = false;
        // this.compteurValidePrepayer = false;
        // this.loadingEDGPrepayer = false;
      },
    });
  }

  //Fin code facture Prepayer

  //debut code facture PostPayer

  postpayModalForm!: FormGroup;
  selectedPostpayFacture: any;

  initialPostPayer(): void {
    this.postpayModalForm = this.fb.group({
      modalDebitAccountPost: ['', Validators.required],
      modalMontantPost: ['', Validators.required],
    });
  }

  openPostpayModal(facture: any) {
    this.selectedPostpayFacture = facture;

    // Pré-remplir le montant par défaut avec le solde de la facture
    this.postpayModalForm.patchValue({
      modalMontantPost: facture.balance,
    });

    // Ouvrir le modal Bootstrap
    const modalEl = document.getElementById('postpayModal');
    const modal = new bootstrap.Modal(modalEl!);
    modal.show();
  }

  loadingVerificationMontant: boolean = false;

  verificationMontant() {
    if (this.postpayModalForm.invalid) return;
    this.loadingVerificationMontant = true;
    // console.log(
    //   ' facture: this.selectedPostpayFacture: ',
    //   this.selectedPostpayFacture,
    // );

    // Détermine si les frais sont inclus
    const feesIncluded = this.btFeesIncluded;

    // Calcul des frais
    const feesEcash = feesIncluded ? 0 : Number(this.fraisNFeesBankEDG);

    // Si nFeesBank est un pourcentage (ex: 0.025 pour 2.5%)
    const feesBCI = this.fraisNFeesBankEDG;

    let fraisEcash = 0;
    let fraisBank = 0;
    let montantTotalPostPayerEDG = 0;

    if (this.btFeesIncluded) {
      // Ecash inclus → 0
      fraisEcash = 0;

      // Bank
      fraisBank = this.btFeesBankUsePercent
        ? (this.postpayModalForm.value.modalMontantPost *
            Number(this.fraisNFeesBankEDG)) /
          100
        : Number(this.fraisNFeesBankEDG);
    } else {
      // Ecash
      fraisEcash = this.btFeesUsePercent
        ? this.postpayModalForm.value.modalMontantPost *
          Number(this.fraisNFeesEDG / 100)
        : Number(this.fraisNFeesEDG);

      // Bank
      fraisBank = this.btFeesBankUsePercent
        ? this.postpayModalForm.value.modalMontantPost *
          Number(this.fraisNFeesBankEDG / 100)
        : Number(this.fraisNFeesBankEDG);
    }
    if (this.btFeesIncluded) {
      montantTotalPostPayerEDG = this.postpayModalForm.value.modalMontantPost;
    } else {
      montantTotalPostPayerEDG =
        this.postpayModalForm.value.modalMontantPost + fraisEcash + fraisBank;
    }

    // Total envoyé dans l’API
    const payload = {
      vcPayerAccount: this.postpayModalForm.value.modalDebitAccountPost,
      vcBenefName: this.vcAccountName ?? '',
      vcBenefAccount: '',
      mAmount: montantTotalPostPayerEDG,
      mFeesEcash: feesEcash,
      mFeesBCI: feesBCI,
      btFeesIncluded: feesIncluded ? 1 : 0,
      vcNotes: 'Recharment PostPayer',
      iTransactionID: this.transaction_id,
    };

    if (this.btFeesIncluded) {
      if (fraisBank <= 0) {
        this.loadingVerificationMontant = false;
        this.toastr.error('Le frais de banque doit être supérieur à 0', '', {
          positionClass: 'toast-custom-center',
        });
      }
    } else {
      if (fraisBank <= 0 && fraisEcash <= 0) {
        this.loadingVerificationMontant = false;
        this.toastr.error(
          "Les frais de la banque et d'Ecash doivent être supérieurs à 0",
          '',
          { positionClass: 'toast-custom-center' },
        );
      }
    }

    // console.log('PAYLOAD ENVOYÉ 👉', payload);

    if (montantTotalPostPayerEDG > this.selectedPostpayFacture.balance) {
      this.loadingVerificationMontant = false;
      this.toastr.error(
        'Le montant payer plus frais ne doit pas depasser le solde restant',
        '',
        {
          positionClass: 'toast-custom-center',
        },
      );
      // console.log('montantTotalPostPayerEDG: ', montantTotalPostPayerEDG);
      // console.log(
      //   'this.selectedPostpayFacture.balance: ',
      //   this.selectedPostpayFacture.balance,
      // );
    } else if (
      this.postpayModalForm.value.modalMontantPost > this.soldeDebiteur
    ) {
      this.loadingVerificationMontant = false;

      this.toastr.error(
        'Le montant saisi doit être inférieur ou égal au solde.',
        '',
        {
          positionClass: 'toast-custom-center',
        },
      );
    } else {
      console.log('montantTotalPostPayerEDG: ', montantTotalPostPayerEDG);
      console.log(
        'this.selectedPostpayFacture.balance: ',
        this.selectedPostpayFacture.balance,
      );
      this.loadingVerificationMontant = false;

      if (this.loadingVerificationMontant === false) {
        const modalEl = document.getElementById('postpayModal');
        const modal = bootstrap.Modal.getInstance(modalEl!);
        modal?.hide();
        this.modalOtp = true;
        this.openModalOtp();
      }
    }
  }

  submitPostpayPayment() {
    if (this.postpayModalForm.invalid) return;
    // console.log(
    //   ' facture: this.selectedPostpayFacture: ',
    //   this.selectedPostpayFacture,
    // );

    // Détermine si les frais sont inclus
    const feesIncluded = this.btFeesIncluded;

    // Calcul des frais
    const feesEcash = feesIncluded ? 0 : Number(this.fraisNFeesBankEDG);

    // Si nFeesBank est un pourcentage (ex: 0.025 pour 2.5%)
    const feesBCI = this.fraisNFeesBankEDG;

    let fraisEcash = 0;
    let fraisBank = 0;
    let montantTotalPostPayerEDG = 0;

    if (this.btFeesIncluded) {
      // Ecash inclus → 0
      fraisEcash = 0;

      // Bank
      fraisBank = this.btFeesBankUsePercent
        ? (this.postpayModalForm.value.modalMontantPost *
            Number(this.fraisNFeesBankEDG)) /
          100
        : Number(this.fraisNFeesBankEDG);
    } else {
      // Ecash
      fraisEcash = this.btFeesUsePercent
        ? this.postpayModalForm.value.modalMontantPost *
          Number(this.fraisNFeesEDG / 100)
        : Number(this.fraisNFeesEDG);

      // Bank
      fraisBank = this.btFeesBankUsePercent
        ? this.postpayModalForm.value.modalMontantPost *
          Number(this.fraisNFeesBankEDG / 100)
        : Number(this.fraisNFeesBankEDG);
    }
    if (this.btFeesIncluded) {
      montantTotalPostPayerEDG = this.postpayModalForm.value.modalMontantPost;
    } else {
      montantTotalPostPayerEDG =
        this.postpayModalForm.value.modalMontantPost + fraisEcash + fraisBank;
    }

    // Total envoyé dans l’API
    const payload = {
      vcPayerAccount: this.postpayModalForm.value.modalDebitAccountPost,
      vcBenefName: this.vcAccountName ?? '',
      vcBenefAccount: '',
      mAmount: montantTotalPostPayerEDG,
      mFeesEcash: feesEcash,
      mFeesBCI: feesBCI,
      btFeesIncluded: feesIncluded ? 1 : 0,
      vcNotes: 'Recharment PostPayer',
      iTransactionID: this.transaction_id,
    };

    if (this.btFeesIncluded) {
      if (fraisBank <= 0) {
        this.toastr.error('Le frais de banque doit être supérieur à 0', '', {
          positionClass: 'toast-custom-center',
        });
      }
    } else {
      if (fraisBank <= 0 && fraisEcash <= 0) {
        this.toastr.error(
          "Les frais de la banque et d'Ecash doivent être supérieurs à 0",
          '',
          { positionClass: 'toast-custom-center' },
        );
      }
    }

    console.log('PAYLOAD ENVOYÉ 👉', payload);

    if (montantTotalPostPayerEDG > this.selectedPostpayFacture.balance) {
      this.loadingVerificationMontant = false;
      this.toastr.error(
        'Le montant payer plus frais ne doit pas depasser le solde restant',
        '',
        {
          positionClass: 'toast-custom-center',
        },
      );
      console.log('montantTotalPostPayerEDG: ', montantTotalPostPayerEDG);
      console.log(
        'this.selectedPostpayFacture.balance: ',
        this.selectedPostpayFacture.balance,
      );
    } else {
      console.log('montantTotalPostPayerEDG: ', montantTotalPostPayerEDG);
      console.log(
        'this.selectedPostpayFacture.balance: ',
        this.selectedPostpayFacture.balance,
      );

      // Fermer le modal

      this.marchandService
        .postPaiementMarchant(
          payload.vcPayerAccount,
          payload.vcBenefName,
          payload.vcBenefAccount,
          payload.mAmount,
          payload.mFeesEcash,
          payload.mFeesBCI,
          payload.vcNotes,
          payload.btFeesIncluded,
          payload.iTransactionID,
        )
        .subscribe({
          next: (response: any) => {
            console.log('Réponse API 👉', response);
            // if (response.status === 200) {
            this.toastr.success('Le paiement a été effectué avec succès', '', {
              positionClass: 'toast-custom-center',
            });
            this.isLoading = false;
            this.modalOtp = false;
            this.router.navigate(['/historiqueTransactions']);
            this.onCompteurBlurPostpayer();
            // this.loadingPrepayerEDG = false;
            this.postpayModalForm.reset();
            // }
          },
          error: (err) => {
            this.isLoading = false;
            this.toastr.error('Une erreur interne est survenue.', '', {
              positionClass: 'toast-custom-center',
            });
            // this.loadingPrepayerEDG = false;
            console.error('Erreur API 👉', err);
          },
        });
    }
  }

  formatDateOper(dateOper: string): string {
    if (!dateOper || dateOper.length !== 6) return dateOper;

    const year = 2000 + Number(dateOper.substring(0, 2));
    const month = Number(dateOper.substring(2, 4)) - 1;
    const day = Number(dateOper.substring(4, 6));

    const date = new Date(year, month, day);

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  // =====================
  initForm(): void {
    this.paymentForm = this.fb.group({
      debitAccount: ['', Validators.required],
      facturier: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      // feesBCI: [200, Validators.required],
      // feesIncluded: [1, Validators.required],
      notes: ['', Validators.required],
    });
  }

  // =====================

  loadingEdg: boolean = false;

  // =====================
  submitPaiement(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.loadingEdg = true;

    const v = this.paymentForm.value;

    // Montant de base
    const montant = Number(v.amount);

    // Détermine si les frais sont inclus
    const feesIncluded = v.facturier?.btFeesIncluded;

    // Calcul des frais
    const feesEcash = feesIncluded ? 0 : Number(v.facturier?.nFees ?? 0);

    // Si nFeesBank est un pourcentage (ex: 0.025 pour 2.5%)
    const feesBCI = (Number(v.facturier?.nFeesBank ?? 0) * montant) / 100;

    // Total envoyé dans l’API
    const payload = {
      vcPayerAccount: v.debitAccount,
      vcBenefName: v.facturier?.FacturierName ?? '',
      vcBenefAccount: v.facturier?.vcAccountNumber ?? '',
      mAmount: feesIncluded ? montant : montant,
      mFeesEcash: feesEcash,
      mFeesBCI: feesBCI,
      btFeesIncluded: feesIncluded ? 1 : 0,
      vcNotes: v.notes ?? '',
      iTransactionID: this.transaction_id,
    };

    console.log('PAYLOAD ENVOYÉ 👉', payload);

    this.marchandService
      .postPaiementMarchant(
        payload.vcPayerAccount,
        payload.vcBenefName,
        payload.vcBenefAccount,
        payload.mAmount,
        payload.mFeesEcash,
        payload.mFeesBCI,
        payload.vcNotes,
        payload.btFeesIncluded,
        payload.iTransactionID,
      )
      .subscribe({
        next: (response: any) => {
          console.log('Réponse API 👉', response);
          if (response.status === 200) {
            this.toastr.success('Le paiement a été effectué avec succès', '', {
              positionClass: 'toast-custom-center',
            });
            this.loadingEdg = false;
            this.paymentForm.reset();
          }
        },
        error: (err) => {
          this.toastr.error('Une erreur interne est survenue.', '', {
            positionClass: 'toast-custom-center',
          });
          this.loadingEdg = false;
          console.error('Erreur API 👉', err);
        },
      });
  }

  onDebitAccountSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement)?.value;
    if (value) this.onDebitAccountChange(value);
  }

  onDebitAccountChange(accountNumber: string): void {
    console.log(accountNumber);
  }

  // =====================
  getListeCompteClient(): void {
    if (!this.iOrganisationID) return;

    this.listeCompteCLientService
      .getListeCompteClient(this.iOrganisationID)
      .subscribe({
        next: (response: any) => {
          this.listeCompteClient = response?.data?.[0]?.comptes ?? [];
          this.loading = false;

          this.typesCompte = [
            ...new Set(this.listeCompteClient.map((c) => c.vcAccountType)),
          ].join(' - ');

          // ✅ sélection auto injectée dans le Reactive Form
          if (this.listeCompteClient.length > 0) {
            const firstAccount = this.listeCompteClient[0].vcAccountNumber;

            this.selectedDebitAccount = firstAccount;

            this.paymentForm.patchValue({
              debitAccount: firstAccount,
            });

            this.onDebitAccountChange(firstAccount);
          }
        },
        error: (err) => {
          this.errorMessage = err.message;
          this.loading = false;
        },
      });
  }

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

  vcPhoneNumber: any;

  /* =====================================================
     OUVERTURE / FERMETURE MODAL
  ===================================================== */
  loadiongConfirmeOtp: boolean = false;
  openModalOtp(): void {
    this.loadiongConfirmeOtp = true;
    this.startCountdown();
    console.log('this.montantEDG: ', this.montantEDG);

    if (this.montantEDG > this.soldeDebiteur) {
      this.loadiongConfirmeOtp = false;
      this.toastr.error(
        'Le montant saisi doit être inférieur ou égal au solde.',
        '',
        {
          positionClass: 'toast-custom-center',
        },
      );
    } else {
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
          console.log('this.selectedTab hors: ', this.selectedTab);
          if (response.status === 200) {
            console.log('dedans this.selectedTab: ', this.selectedTab);
            // this.toastr.success('OTP envoyé avec succès', '', {
            //   positionClass: 'toast-custom-center',
            // });
            this.submitPayementPrepayerEDGBillPending();
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
        this.toastr.error('Une erreur interne est survenue.', '', {
          positionClass: 'toast-custom-center',
        });
      },
    });
  }
}
