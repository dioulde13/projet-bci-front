import { Component, OnInit } from '@angular/core';
import { BeneficiaireService } from '../../../../services/beneficiaire/beneficiaire.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../../services/dashboard/dashboard.service';
import { GetAccountNameService } from '../../../../servicesNodes/verifierNomDebiteur/get-account-name.service';
import { BeneficiaireNodeService } from '../../../../servicesNodes/beneficiaireNode/beneficiaire-node.service';
import { BanqueNameVerifierService } from '../../../../servicesNodes/verifierBanqueName/banque-name-verifier.service';
import { PaiementInterneExterneService } from '../../../../servicesNodes/paiementInterneExterne/paiement-interne-externe.service';
import { GnfNumberFormatDirective } from '../../../../directives/gnf-number-format.directive';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../services/notification/notification.service';

@Component({
  selector: 'app-transfert-unique',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GnfNumberFormatDirective],
  templateUrl: './transfert-unique.component.html',
  styleUrls: ['./transfert-unique.component.css'],
})
export class TransfertUniqueComponent implements OnInit {
  loading = true;
  loadingFetch = false;
  errorMessage = '';

  userInfo: any;
  infosUser: any;
  idOrganisation!: number;
  iOrganisationID!: number;

  transferFormPaiementInterneExterne!: FormGroup;

  listeCompteClient: any[] = [];
  listeCompteClient1: any[] = [];
  listeCompteClient2: any[] = [];

  listeBeneficiaire: any[] = [];
  filteredBeneficiaire: any[] = [];
  filteredBeneficiaireOne: any[] = [];
  listeBanques: any[] = [];

  selectedTypeBeneficiaire = '';
  selectedBeneficiaire: any = null;
  selectedBeneficiaireId: any;
  selectedDebitAccount = '';
  selectedBicCode = '';

  nomDebiteur: any = '';
  soldeDebiteur: any = '';
  devise: any = '';
  nomBanque = '';
  typesCompte = '';

  constructor(
    private fb: FormBuilder,
    private getAccount: GetAccountNameService,
    private beneficiaireService: BeneficiaireService,
    private listeCompteCLientService: DashboardService,
    private beneficiaireNodeService: BeneficiaireNodeService,
    private banqueNameVerifierService: BanqueNameVerifierService,
    private paiementInterneExterneService: PaiementInterneExterneService,
    private router: Router,
    private notification: NotificationService,
  ) {}

  private getFromStorage(key: string) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  infosFormulaires: any;
  infosCompteDebiteur: any;

  ngOnInit(): void {
    // 1️⃣ Récupérer infos user
    const userJson = localStorage.getItem('userInfo');
    if (userJson) {
      try {
        this.infosUser = JSON.parse(userJson);
      } catch {
        this.infosUser = null;
      }
    }

    // 2️⃣ Charger liste comptes client
    if (this.infosUser?.iOrganisationID) {
      this.iOrganisationID = this.infosUser.iOrganisationID;
      this.getListeCompteClient();
    } else {
      console.warn('iOrganisationID non défini');
      this.loading = false;
    }

    this.getUserInfo();

    // 3️⃣ Init formulaire
    this.initFormPaiementInterneExterne();
    this.initTransfertEntreCompteForm(); // 🔥 ajouter ici

    // 4️⃣ Charger types bénéficiaires → patchFormWithSavedValues() appelé à la fin
    this.loadTypeBeneficiaires();

    // 5️⃣ Charger listes
    this.getListeBeneficiaire();
    this.getListeBanques();

    // 6️⃣ Restaurer données sauvegardées
    this.infosFormulaires = this.getFromStorage('InfosSaisirDansFormulaire');
    this.infosCompteDebiteur = this.getFromStorage('infosCompteDebiteur');

    // 7️⃣ Restaurer solde/nom débiteur directement sans rappel API
    if (this.infosCompteDebiteur?.name) {
      this.nomDebiteur = this.infosCompteDebiteur.name ?? null;
      this.soldeDebiteur = this.infosCompteDebiteur.soldeDisp ?? null;
      this.devise = this.infosCompteDebiteur.devise ?? null;
    }
  }

  // Ajouter ces propriétés
  listeCompteClient1Filtered: any[] = []; // pour Compte 1
  listeCompteClient2Filtered: any[] = []; // pour Compte 2

  // =============================================
  // LISTE COMPTES CLIENT
  // =============================================
  getListeCompteClient(): void {
    if (!this.iOrganisationID) return;

    this.listeCompteCLientService
      .getListeCompteClient(this.iOrganisationID)
      .subscribe({
        next: (response: any) => {
          this.listeCompteClient = response?.data?.[0]?.comptes ?? [];

          this.listeCompteClient1Filtered = [...this.listeCompteClient]; // 🔥
          this.listeCompteClient2Filtered = [...this.listeCompteClient]; // 🔥
          this.loading = false;

          this.typesCompte = [
            ...new Set(this.listeCompteClient.map((c) => c.vcAccountType)),
          ].join(' - ');

          // Vérifier si un compte est déjà sauvegardé dans localStorage
          const savedFormulaire = this.getFromStorage(
            'InfosSaisirDansFormulaire',
          );
          const savedAccount = savedFormulaire?.vcPayerAccount;

          if (savedAccount) {
            // 🔥 Utiliser le compte sauvegardé
            this.selectedDebitAccount = savedAccount;
          } else if (this.listeCompteClient.length > 0) {
            // Sinon, prendre le premier compte par défaut
            const firstAccount = this.listeCompteClient[0].vcAccountNumber;
            this.selectedDebitAccount = firstAccount;
            this.onDebitAccountChange(firstAccount);
          }
        },
        error: (err) => {
          this.errorMessage = err.message;
          this.loading = false;
        },
      });
  }

  onDebitAccountSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement)?.value;
    if (value) this.onDebitAccountChange(value);
  }

  onDebitAccountChange(accountNumber: string): void {
    this.getAccountName(accountNumber);
    this.transferFormPaiementInterneExterne.patchValue({
      vcPayerAccount: accountNumber,
    });
  }

  // =============================================
  // DECODE MESSAGE
  // =============================================
  decodeMessage(encoded: string): string {
    if (!encoded) return encoded;
    return encoded
      .replace(/\+á/g, 'à')
      .replace(/\+é/g, 'é')
      .replace(/\+è/g, 'è')
      .replace(/\+®/g, 'é')
      .replace(/\+ç/g, 'ç')
      .replace(/\+ô/g, 'ô')
      .replace(/\+°/g, 'ô')
      .replace(/\+ù/g, 'ù')
      .replace(/\+/g, ' ')
      .trim();
  }

  messageErreur: string | null = null;
  status: boolean = false;
  loadingGetBalance: boolean = false;

  // =============================================
  // GET ACCOUNT NAME / SOLDE
  // =============================================
  getAccountName(accountNumber: string): void {
    if (!accountNumber) return;

    this.loadingGetBalance = true;
    this.status = false;
    this.messageErreur = null;

    this.getAccount.getNomDebiteur(accountNumber).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.infosCompteDebiteur = res?.data ?? null;
          this.nomDebiteur = res?.data?.name ?? null;
          this.soldeDebiteur = res?.data?.soldeDisp ?? null;
          this.devise = res?.data?.devise ?? null;
          this.loadingGetBalance = false;
        } else {
          this.loadingGetBalance = false;
          this.nomDebiteur = null;
          this.soldeDebiteur = null;
          this.devise = null;
          this.notification.error(this.decodeMessage(res.message));
        }
      },
      error: (err: any) => {
        this.loadingGetBalance = false;
        this.nomDebiteur = null;
        this.soldeDebiteur = null;
        this.devise = null;

        if (err?.error?.status === 404) {
          this.messageErreur = this.decodeMessage(err?.error?.message);
          this.status = true;
        } else {
          this.messageErreur = 'Une erreur est survenue.';
          this.status = true;
        }
      },
    });
  }

  // =============================================
  // LISTE BANQUES
  // =============================================
  getListeBanques(): void {
    this.beneficiaireNodeService.getListeBanque().subscribe({
      next: (res) => {
        this.listeBanques = res?.data ?? [];
        if (this.listeBanques.length > 0) {
          this.selectedBicCode = this.listeBanques[0].vcBICCode;
          this.onBicCodeChange(this.selectedBicCode);
        }
      },
    });
  }

  onBicCodeSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement)?.value;
    if (value) this.onBicCodeChange(value);
  }

  onBicCodeChange(bicCode: string): void {
    this.getNomBanque(bicCode);
    this.transferFormPaiementInterneExterne.patchValue({
      vcBenefBicCode: bicCode,
    });
  }

  getNomBanque(bicCode: string): void {
    this.banqueNameVerifierService.getNomBanque(bicCode).subscribe({
      next: (res) => (this.nomBanque = res?.data?.name ?? ''),
      error: () => (this.nomBanque = ''),
    });
  }

  // =============================================
  // USER INFO
  // =============================================
  private getUserInfo(): void {
    const user = localStorage.getItem('userInfo');
    if (!user) return;
    this.userInfo = JSON.parse(user);
    this.idOrganisation = this.userInfo?.iOrganisationID;
  }

  // =============================================
  // TYPES BÉNÉFICIAIRES
  // =============================================
  listeTypeBeneficiaire: any[] = [];

  private loadTypeBeneficiaires(): void {
    this.beneficiaireService.getListeTypeBeneficiaire().subscribe({
      next: (res) => {
        this.listeTypeBeneficiaire = res?.data ?? [];
        // 🔥 Patch APRÈS que listeTypeBeneficiaire soit chargée
        this.patchFormWithSavedValues();
      },
      error: (err) => console.error(err),
    });
  }

  // =============================================
  // LISTE BÉNÉFICIAIRES
  // =============================================
  private getListeBeneficiaire(): void {
    if (!this.idOrganisation) return;
    this.loadingFetch = true;
    this.beneficiaireService
      .getListeBeneficiaire(this.idOrganisation)
      .subscribe({
        next: (res: any) => {
          this.listeBeneficiaire = res?.data ?? [];
          this.filteredBeneficiaire = [...this.listeBeneficiaire];
          this.loadingFetch = false;
        },
        error: () => (this.loadingFetch = false),
      });
  }

  selectedBeneficiaireName = '';
  listeBeneficiaires: any[] = [];

  // =============================================
  // CHANGEMENT CATÉGORIE
  // =============================================
  onCategoryChange(event: Event) {
    const selectedType = this.transferFormPaiementInterneExterne.get(
      'beneficiaryCategory',
    )?.value;

    this.selectedBeneficiaireId = selectedType?.id;
    this.selectedBeneficiaireName = selectedType?.vcName;
    this.getListeBeneficiaireByCategorie();
  }

  getListeBeneficiaireByCategorie(): void {
    if (!this.selectedBeneficiaireId) return;
    this.paiementInterneExterneService
      .getListeBeneficiaireByCategorie(this.selectedBeneficiaireId)
      .subscribe({
        next: (response: any) => {
          this.listeBeneficiaires = response?.data.filter(
            (l: any) => l.btEnabled === '1',
          );
        },
        error: () => {
          this.listeBeneficiaires = [];
        },
      });
  }

  idBenef: any;

  // =============================================
  // CHANGEMENT BÉNÉFICIAIRE
  // =============================================
  onBeneficiaireChange(event: Event): void {
    this.idBenef = (event.target as HTMLSelectElement).value;
    if (!this.idBenef) {
      this.selectedBeneficiaire = null;
      return;
    }
    this.selectedBeneficiaire = this.listeBeneficiaires.find(
      (b) => b?.BeneficiaryID?.toString() === this.idBenef,
    );
    if (this.selectedBeneficiaire) {
      this.transferFormPaiementInterneExterne.patchValue({
        vcBenefName: `${this.selectedBeneficiaire.vcFirstName} ${this.selectedBeneficiaire.vcLastName}`,
        vcBenefAccount: this.selectedBeneficiaire.vcAccountNumber,
      });
    }
  }

  // =============================================
  // INIT FORMULAIRE
  // =============================================
  initFormPaiementInterneExterne(): void {
    this.transferFormPaiementInterneExterne = this.fb.group({
      dtPaymentDate: [''],
      vcPayerAccount: ['', Validators.required],
      beneficiaryCategory: ['', Validators.required],
      vcBenefName: [''],
      vcBenefAccount: [''],
      mAmount: ['', Validators.required],
    });
  }

  // =============================================
  // 🔥 PATCH FORMULAIRE DEPUIS LOCALSTORAGE
  // =============================================
  patchFormWithSavedValues(): void {
    const infosFormulaires = this.getFromStorage('InfosSaisirDansFormulaire');
    const savedIdBenef = this.getFromStorage('idBenef');
    const savedBeneficiaire = this.getFromStorage('selectedBeneficiaire');
    const savedCompteDebiteur = this.getFromStorage('infosCompteDebiteur');

    // Rien à restaurer
    if (!infosFormulaires?.vcPayerAccount) return;

    // 1️⃣ Trouver la catégorie correspondante
    const selectedCategory =
      this.listeTypeBeneficiaire.find(
        (type: any) =>
          type.vcName?.trim().toLowerCase() ===
          infosFormulaires.vcBenefName?.trim().toLowerCase(),
      ) ?? null;

    // 2️⃣ Patcher tous les champs du formulaire
    this.transferFormPaiementInterneExterne.patchValue({
      dtPaymentDate: infosFormulaires.dtPaymentDate ?? '',
      vcPayerAccount: infosFormulaires.vcPayerAccount ?? '',
      mAmount: infosFormulaires.mAmount ?? '',
      vcBenefAccount: infosFormulaires.vcBenefAccount ?? '',
      beneficiaryCategory: selectedCategory,
    });

    // 3️⃣ Restaurer le bénéficiaire sélectionné (affichage des infos)
    if (savedBeneficiaire?.BeneficiaryID) {
      this.selectedBeneficiaire = savedBeneficiaire;
    }

    // 4️⃣ Restaurer idBenef
    if (savedIdBenef?.idBenef) {
      this.idBenef = savedIdBenef.idBenef;
    }

    // 5️⃣ Charger la liste bénéficiaires de la catégorie sauvegardée
    if (selectedCategory?.id) {
      this.selectedBeneficiaireId = selectedCategory.id;
      this.selectedBeneficiaireName = selectedCategory.vcName;
      this.getListeBeneficiaireByCategorie();
    }

    // 6️⃣ Restaurer solde/nom débiteur sans rappel API
    if (savedCompteDebiteur?.name) {
      this.infosCompteDebiteur = savedCompteDebiteur;
      this.nomDebiteur = savedCompteDebiteur.name ?? null;
      this.soldeDebiteur = savedCompteDebiteur.soldeDisp ?? null;
      this.devise = savedCompteDebiteur.devise ?? null;
    }
  }

  // =============================================
  // SUBMIT
  // =============================================
  submitAttempt = false;
  loadingPaiementInterneExterne: boolean = false;

  submitFormPayementInterneExterne(): void {
    this.submitAttempt = true;
    this.transferFormPaiementInterneExterne.markAllAsTouched();
    this.loadingPaiementInterneExterne = true;

    const formValue = this.transferFormPaiementInterneExterne.value;

    // Vérifier solde nul ou indisponible
    if (this.soldeDebiteur === null || this.soldeDebiteur <= 0) {
      this.loadingPaiementInterneExterne = false;
      this.notification.error(
        this.decodeMessage(
          'Votre solde est nul ou indisponible, vous ne pouvez pas effectuer de transaction.',
        ),
      );
      return;
    }

    // Vérifier montant > solde
    if (formValue.mAmount > this.soldeDebiteur) {
      this.loadingPaiementInterneExterne = false;
      this.notification.error(
        'Le montant saisi doit être inférieur ou égal au solde.',
      );
      return;
    }

    // Préparer le payload
    const payload = {
      vcPayerName: this.nomDebiteur,
      dtPaymentDate: formValue.dtPaymentDate,
      vcPaymentReference: 'REF123',
      vcPayerAccount: formValue.vcPayerAccount,
      vcBenefName: this.selectedBeneficiaireName,
      mAmount: formValue.mAmount,
      vcBenefAccount: this.selectedBeneficiaire.vcAccountNumber,
      vcBenefBicCode: this.selectedBeneficiaire.vcBIC,
      vcCorrespBicCode: '',
      vcBenefCurrency: this.selectedBeneficiaire.vcCurrency,
    };

    // 🔥 Sauvegarder dans localStorage
    localStorage.setItem('InfosSaisirDansFormulaire', JSON.stringify(payload));
    localStorage.setItem('idBenef', JSON.stringify({ idBenef: this.idBenef }));
    localStorage.setItem(
      'selectedBeneficiaire',
      JSON.stringify(this.selectedBeneficiaire),
    );
    localStorage.setItem(
      'infosCompteDebiteur',
      JSON.stringify(this.infosCompteDebiteur),
    );

    // this.loadingPaiementInterneExterne = false;

    setTimeout(() => {
      this.router.navigate(['/recap']);
    }, 1000);
  }

  //code Transfert entre compte

  // =============================================
  // TAB ACTIF
  // =============================================
  activeTab: 'transfertUnique' | 'transfertEntreCompte' = 'transfertUnique';

  // =============================================
  // FORMULAIRE TRANSFERT ENTRE COMPTES
  // =============================================
  transfertEntreCompteForm!: FormGroup;

  infosCompte1: any = null;
  infosCompte2: any = null;
  loadingCompte1: boolean = false;
  loadingCompte2: boolean = false;
  loadingEntreCompte: boolean = false;

  initTransfertEntreCompteForm(): void {
    // 1️⃣ Récupérer les données sauvegardées
    const saved = localStorage.getItem('InfosTransfertEntreCompte');
    const savedData = saved ? JSON.parse(saved) : null;
    const payload = savedData?.payload;

    this.transfertEntreCompteForm = this.fb.group({
      compte1: [payload?.compteDebiteur ?? '', Validators.required],
      compte2: [payload?.compteBeneficiaire ?? '', Validators.required],
      montant: [
        payload?.mAmount ?? '',
        [Validators.required, Validators.min(1)],
      ],
      dtPaymentDate: [payload?.dtPaymentDate ?? ''],
      description: [payload?.vcNotes ?? ''],
    });

    // 2️⃣ Restaurer infosCompte1 et infosCompte2 sans rappel API
    if (savedData?.infosCompte1) {
      this.infosCompte1 = savedData.infosCompte1;
    }
    if (savedData?.infosCompte2) {
      this.infosCompte2 = savedData.infosCompte2;
    }
  }

  onCompte1Change(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    // 🔥 Filtrer Compte 2 : exclure le compte sélectionné dans Compte 1
    this.listeCompteClient2Filtered = this.listeCompteClient.filter(
      (c) => c.vcAccountNumber !== value,
    );

    // Réinitialiser Compte 2 si c'est le même
    const compte2 = this.transfertEntreCompteForm.get('compte2')?.value;
    if (compte2 === value) {
      this.transfertEntreCompteForm.patchValue({ compte2: '' });
      this.infosCompte2 = null;
    }

    if (!value) {
      this.infosCompte1 = null;
      return;
    }

    this.loadingCompte1 = true;
    this.getAccount.getNomDebiteur(value).subscribe({
      next: (res) => {
        this.infosCompte1 = res?.data ?? null;
        this.loadingCompte1 = false;
      },
      error: () => {
        this.infosCompte1 = null;
        this.loadingCompte1 = false;
      },
    });
  }

  onCompte2Change(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    // 🔥 Filtrer Compte 1 : exclure le compte sélectionné dans Compte 2
    this.listeCompteClient1Filtered = this.listeCompteClient.filter(
      (c) => c.vcAccountNumber !== value,
    );

    // Réinitialiser Compte 1 si c'est le même
    const compte1 = this.transfertEntreCompteForm.get('compte1')?.value;
    if (compte1 === value) {
      this.transfertEntreCompteForm.patchValue({ compte1: '' });
      this.infosCompte1 = null;
    }

    if (!value) {
      this.infosCompte2 = null;
      return;
    }

    this.loadingCompte2 = true;
    this.getAccount.getNomDebiteur(value).subscribe({
      next: (res) => {
        this.infosCompte2 = res?.data ?? null;
        this.loadingCompte2 = false;
      },
      error: () => {
        this.infosCompte2 = null;
        this.loadingCompte2 = false;
      },
    });
  }

  submitTransfertEntreCompte(): void {
    this.transfertEntreCompteForm.markAllAsTouched();
    if (this.transfertEntreCompteForm.invalid) return;

    const formValue = this.transfertEntreCompteForm.value;

    if (this.infosCompte1?.soldeDisp < Number(formValue.montant)) {
      this.notification.error(
        'Le montant saisi dépasse le solde disponible du Compte 1.',
      );
      return;
    }

    if (formValue.compte1 === formValue.compte2) {
      this.notification.error(
        'Le compte débiteur et le compte bénéficiaire doivent être différents.',
      );
      return;
    }

    this.loadingEntreCompte = true;

    const payload = {
      vcPayerAccount: formValue.compte1, // 🔥 clé cohérente avec le recap
      vcBenefAccount: formValue.compte2, // 🔥 clé cohérente avec le recap
      mAmount: Number(formValue.montant),
      dtPaymentDate: formValue.dtPaymentDate,
      vcNotes: formValue.description,
    };

    // 🔥 Sauvegarder avec les clés attendues par le recap
    localStorage.setItem('payload', JSON.stringify(payload));
    localStorage.setItem('infosCompte1', JSON.stringify(this.infosCompte1));
    localStorage.setItem('infosCompte2', JSON.stringify(this.infosCompte2));

    // 🔥 Sauvegarder aussi pour le pré-remplissage au retour
    localStorage.setItem(
      'InfosTransfertEntreCompte',
      JSON.stringify({
        payload: {
          compteDebiteur: formValue.compte1,
          compteBeneficiaire: formValue.compte2,
          mAmount: Number(formValue.montant),
          dtPaymentDate: formValue.dtPaymentDate,
          vcNotes: formValue.description,
        },
        infosCompte1: this.infosCompte1,
        infosCompte2: this.infosCompte2,
      }),
    );

    localStorage.setItem(
      'activeTab',
      JSON.stringify({ activeTab: this.activeTab }),
    );

    setTimeout(() => {
      this.loadingEntreCompte = false;
      this.router.navigate(['/recapTransfertEntreCompte']);
    }, 1000);
  }
}
