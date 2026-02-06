import { Component, OnInit } from '@angular/core';
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
import { ActivatedRoute } from '@angular/router';

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
    private toastr: ToastrService,
    private route: ActivatedRoute,
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

  ngOnInit(): void {
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

  paymentFormPostpayerEDG!: FormGroup;

  afficherInfosPostpayer = false;
  loadingEDGPostpayer = false;
  compteurValidePostpayer = false;

  infosCompteurPostpayer: any = null;
  facturesCompteur: any[] = []; // pour stocker toutes les factures

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

    console.log('compteur:', compteur);

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

    const msisdn = '666421034';

    // 🔍 Vérifier le compteur + récupérer les factures
    this.marchandService.verifierCompteurPostpayer(compteur, msisdn).subscribe({
      next: (res) => {
        console.log('Réponse API brute:', res);

        const apiData = res?.data?.[0];

        if (!apiData?.APIResponse) {
          this.compteurValidePostpayer = false;
          this.loadingEDGPostpayer = false;
          return;
        }

        let parsed: any;
        try {
          parsed = JSON.parse(apiData.APIResponse);
        } catch (e) {
          console.error('Erreur JSON.parse', e);
          this.compteurValidePostpayer = false;
          this.loadingEDGPostpayer = false;
          return;
        }

        console.log('APIResponse parsée:', parsed);

        // ✅ SUCCESS = returnId === 0
        if (parsed.returnId === 0) {
          this.compteurValidePostpayer = true;
          this.infosCompteurPostpayer = parsed;

          if (Array.isArray(parsed.content)) {
            this.facturesCompteur = parsed.content;
          }
        } else {
          this.compteurValidePostpayer = false;
        }

        this.loadingEDGPostpayer = false;
      },

      error: (err) => {
        console.error('Erreur API:', err);
        this.compteurValidePostpayer = false;
        this.loadingEDGPostpayer = false;
      },
    });
  }

  //Debut code Prepayer EDG
  paymentFormPrepayerEDG!: FormGroup;

  afficherInfosPrepayer = false;
  loadingEDGPrepayer = false;
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

  onDebitAccountSelectEDG(event: Event): void {
    const value = (event.target as HTMLSelectElement)?.value;
    if (value) this.onDebitAccountChangeEDG(value);
  }

  onDebitAccountChangeEDG(accountNumber: string): void {
    console.log(accountNumber);
  }

  loadingPrepayerEDG: boolean = false;

  submitPayementPrepayerEDG() {
    if (this.paymentFormPrepayerEDG.invalid) {
      this.paymentFormPrepayerEDG.markAllAsTouched();
      return;
    }

    this.loadingPrepayerEDG = true;

    console.log('this.ligneSelectionner: ', this.ligneSelectionner);

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
      vcBenefName: this.nomFacture ?? '',
      vcBenefAccount: '',
      mAmount: this.montantTotalEDG,
      mFeesEcash: feesEcash,
      mFeesBCI: feesBCI,
      btFeesIncluded: feesIncluded ? 1 : 0,
      vcNotes: 'Recharment prepayer',
    };

    console.log('PAYLOAD ENVOYÉ 👉', payload);

    // this.marchandService
    //   .postPaiementMarchant(
    //     payload.vcPayerAccount,
    //     payload.vcBenefName,
    //     payload.vcBenefAccount,
    //     payload.mAmount,
    //     payload.mFeesEcash,
    //     payload.mFeesBCI,
    //     payload.vcNotes,
    //     payload.btFeesIncluded,
    //   )
    //   .subscribe({
    //     next: (response: any) => {
    //       console.log('Réponse API 👉', response);
    //       if (response.status === 200) {
    //         this.toastr.success('Le paiement a été effectué avec succès', '', {
    //           positionClass: 'toast-custom-center',
    //         });
    //         this.loadingPrepayerEDG = false;
    //         this.paymentForm.reset();
    //       }
    //     },
    //     error: (err) => {
    //       this.toastr.error(err.error.message, '', {
    //         positionClass: 'toast-custom-center',
    //       });
    //       this.loadingPrepayerEDG = false;
    //       console.error('Erreur API 👉', err);
    //     },
    //   });
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
    this.compteurValidePrepayer = false;
    this.infosCompteurPrepayer = null;

    const msisdn = '666421034';

    this.marchandService.verifierCompteurPrepayer(compteur, msisdn).subscribe({
      next: (res) => {
        const apiData = res?.data?.[0];

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

        this.loadingEDGPrepayer = false;
      },
      error: () => {
        this.compteurValidePrepayer = false;
        this.loadingEDGPrepayer = false;
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

  submitPostpayPayment() {
    if (this.postpayModalForm.invalid) return;
    console.log(
      ' facture: this.selectedPostpayFacture: ',
      this.selectedPostpayFacture,
    );

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
      vcBenefName: this.nomFacture ?? '',
      vcBenefAccount: '',
      mAmount: montantTotalPostPayerEDG,
      mFeesEcash: feesEcash,
      mFeesBCI: feesBCI,
      btFeesIncluded: feesIncluded ? 1 : 0,
      vcNotes: 'Recharment PostPayer',
    };

    console.log('PAYLOAD ENVOYÉ 👉', payload);

    if (montantTotalPostPayerEDG > this.selectedPostpayFacture.balance) {
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
        )
        .subscribe({
          next: (response: any) => {
            console.log('Réponse API 👉', response);
            if (response.status === 200) {
              this.toastr.success(
                'Le paiement a été effectué avec succès',
                '',
                {
                  positionClass: 'toast-custom-center',
                },
              );
              this.onCompteurBlurPostpayer();
              // this.loadingPrepayerEDG = false;
              this.postpayModalForm.reset();
            }
          },
          error: (err) => {
            this.toastr.error(err.error.message, '', {
              positionClass: 'toast-custom-center',
            });
            // this.loadingPrepayerEDG = false;
            console.error('Erreur API 👉', err);
          },
        });
    }

    // Fermer le modal
    const modalEl = document.getElementById('postpayModal');
    const modal = bootstrap.Modal.getInstance(modalEl!);
    modal?.hide();
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
          this.toastr.error(err.error.message, '', {
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
}
