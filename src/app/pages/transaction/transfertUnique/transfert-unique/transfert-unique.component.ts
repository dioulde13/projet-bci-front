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
// import { ToastrService } from 'ngx-toastr';
import { GnfNumberFormatDirective } from '../../../../directives/gnf-number-format.directive';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

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
    private toastr: ToastrService,
    private router: Router,
    // private toastr: ToastrService,
  ) {}

  private getFromStorage(key: string) {
    return JSON.parse(localStorage.getItem(key) || '{}');
  }
  // selectedBeneficiaires: any;
  // infosCompteDebiteurs: any;
  infosFormulaires: any;

  ngOnInit(): void {
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

    this.getUserInfo();

    this.initFormPaiementInterneExterne();
    // this.patchFormWithSavedValues();
    this.loadTypeBeneficiaires();
    this.getListeBeneficiaire();
    this.getListeBanques();

    // this.selectedBeneficiaires = this.getFromStorage('selectedBeneficiaire');
    // this.infosCompteDebiteurs = this.getFromStorage('infosCompteDebiteur');
    this.infosFormulaires = this.getFromStorage('InfosSaisirDansFormulaire');
  }

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

          if (this.listeCompteClient.length > 0) {
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

  messageErreur: string | null = null;
  status: boolean = false;

  infosCompteDebiteur: any;
  // nomDebiteur: string | null = null;
  // soldeDebiteur: number | null = null;
  // devise: string | null = null;

  loadingGetBalance: boolean = false;

  getAccountName(accountNumber: string): void {
    if (!accountNumber) return;

    this.loadingGetBalance = true;
    this.status = false;
    this.messageErreur = null;

    this.getAccount.getNomDebiteur(accountNumber).subscribe({
      next: (res) => {
        console.log('res: ', res);
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
          this.toastr.error(this.decodeMessage(res.message), '', {
            positionClass: 'toast-custom-center',
          });
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

  private getUserInfo(): void {
    const user = localStorage.getItem('userInfo');
    if (!user) return;
    this.userInfo = JSON.parse(user);
    this.idOrganisation = this.userInfo?.iOrganisationID;
  }

  listeTypeBeneficiaire: any[] = [];

  private loadTypeBeneficiaires(): void {
    this.beneficiaireService.getListeTypeBeneficiaire().subscribe({
      next: (res) => {
        this.listeTypeBeneficiaire = res?.data ?? [];
        console.log('this.listeTypeBeneficiaire: ', this.listeTypeBeneficiaire);
        this.patchFormWithSavedValues();
      },
      error: (err) => console.error(err),
    });
  }

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
          console.log('this.listeBeneficiaires: ', this.listeBeneficiaires);
        },
        error: () => {
          this.listeBeneficiaires = [];
        },
      });
  }

  idBenef: any;

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

  initFormPaiementInterneExterne(): void {
    this.transferFormPaiementInterneExterne = this.fb.group({
      dtPaymentDate: ['', Validators.required],
      vcPayerAccount: ['', Validators.required],
      beneficiaryCategory: ['', Validators.required],
      vcBenefName: [''], // ajouté
      vcBenefAccount: [''], // ajouté
      mAmount: ['', Validators.required],
    });
  }

  // ===========================
  // Patch des valeurs stockées
  // ===========================
  patchFormWithSavedValues(): void {
    const infosFormulaires =
      this.getFromStorage('InfosSaisirDansFormulaire') || {};
    const idBenef = this.getFromStorage('idBenef') || {};

    // Debug
    console.log('Infos depuis localStorage:', infosFormulaires);
    console.log('Liste des types de bénéficiaire:', this.listeTypeBeneficiaire);

    // Étape 1 : chercher la catégorie correspondante (ignore espaces et casse)
    const selectedCategory =
      this.listeTypeBeneficiaire.find((type: any) => {
        console.log('Objet type:', type);
        console.log('type.vcName:', type.vcName);
        console.log('vcBenefName du formulaire:', infosFormulaires.vcBenefName);

        return (
          type.vcName?.trim().toLowerCase() ===
          infosFormulaires.vcBenefName?.trim().toLowerCase()
        );
      }) || null;

    console.log('Catégorie sélectionnée:', selectedCategory);

    // Étape 2 : chercher le bénéficiaire correspondant
    // const selectedBeneficiaire =
    //   this.listeBeneficiaires.find(
    //     (b) => b.vcAccountNumber === idBenef.idBenef
    //   ) || null;

    const selectedBeneficiaire = this.listeBeneficiaires.find(
      (b) => b?.BeneficiaryID?.toString() === idBenef.idBenef,
    );

    console.log('selectedBeneficiaire: ', selectedBeneficiaire);

    // Patcher le formulaire
    this.transferFormPaiementInterneExterne.patchValue({
      dtPaymentDate: infosFormulaires.dtPaymentDate || '',
      vcPayerAccount: infosFormulaires.vcPayerAccount || '',
      mAmount: infosFormulaires.mAmount || '',
      vcBenefAccount: infosFormulaires.vcBenefAccount || '',
      beneficiaryCategory: selectedCategory,
    });

    // Définir la sélection du bénéficiaire pour l'affichage des infos
    this.selectedBeneficiaire = selectedBeneficiaire;

    this.getListeBeneficiaire();
  }
  submitAttempt = false;
  loadingPaiementInterneExterne: boolean = false;

  submitFormPayementInterneExterne(): void {
    this.submitAttempt = true;
    this.transferFormPaiementInterneExterne.markAllAsTouched();

    this.loadingPaiementInterneExterne = true;

    const formValue = this.transferFormPaiementInterneExterne.value;

    console.log('formValue.mAmount: ', formValue.mAmount);
    console.log('this.soldeDebiteur: ', this.soldeDebiteur);

    // Vérifier d'abord si le solde est nul ou non disponible
    if (this.soldeDebiteur === null || this.soldeDebiteur <= 0) {
      this.loadingPaiementInterneExterne = false;
      this.toastr.error(
        'Votre solde est nul ou indisponible, vous ne pouvez pas effectuer de transaction.',
        '',
        { positionClass: 'toast-custom-center' },
      );
      return;
    }

    // Vérifier si le montant saisi dépasse le solde
    if (formValue.mAmount > this.soldeDebiteur) {
      this.loadingPaiementInterneExterne = false;
      this.toastr.error(
        'Le montant saisi doit être inférieur ou égal au solde.',
        '',
        { positionClass: 'toast-custom-center' },
      );
      return;
    }

    // Si tout est correct, préparer le payload
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

    // Enregistrer dans le localStorage
    localStorage.setItem('InfosSaisirDansFormulaire', JSON.stringify(payload));
    localStorage.setItem('idBenef', JSON.stringify(this.idBenef));
    localStorage.setItem(
      'selectedBeneficiaire',
      JSON.stringify(this.selectedBeneficiaire),
    );
    localStorage.setItem(
      'infosCompteDebiteur',
      JSON.stringify(this.infosCompteDebiteur),
    );

    this.loadingPaiementInterneExterne = false;

    // Optionnel : simuler un petit délai pour voir le loading
    setTimeout(() => {
      this.router.navigate(['/recap']);
    }, 1000);
  }
}
