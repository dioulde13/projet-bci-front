import { Component, OnInit } from '@angular/core';
import { BeneficiaireService } from '../../../../services/beneficiaire/beneficiaire.service';
import {
  FormBuilder,
  FormGroup,
  // Validators,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
// import { RouterLink } from '@angular/router';
import { BalanceService } from '../../../../servicesNodes/balance/balance.service';
import { DashboardService } from '../../../../services/dashboard/dashboard.service';
import { GetAccountNameService } from '../../../../servicesNodes/verifierNomDebiteur/get-account-name.service';
import { BeneficiaireNodeService } from '../../../../servicesNodes/beneficiaireNode/beneficiaire-node.service';
import { BanqueNameVerifierService } from '../../../../servicesNodes/verifierBanqueName/banque-name-verifier.service';
import { MarchandService } from '../../../../servicesNodes/paiementsMarchandEGD/marchand.service';

@Component({
  selector: 'app-transfert-unique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transfert-unique.component.html',
  styleUrls: ['./transfert-unique.component.css'],
})
export class TransfertUniqueComponent implements OnInit {
  userInfo: any;
  idOrganisation!: number;

  listeCompteClient: any[] = [];
  transferForm!: FormGroup;

  // Listes et sélections
  listeTypeBeneficiaire: any[] = [];
  listeBeneficiaire: any[] = [];
  filteredBeneficiaire: any[] = [];
  filteredBeneficiaireOne: any[] = [];

  selectedTypeBeneficiaire: string = '';
  selectedBeneficiaire: any = null;

  loadingFetch = false; // correction typo

  constructor(
    private fb: FormBuilder,
    private getAccount: GetAccountNameService,
    private beneficiaireService: BeneficiaireService,
    private balanceService: BalanceService,
    private listeCompteCLientService: DashboardService,
    private beneficiaireNodeService: BeneficiaireNodeService,
    private BanqueNameVerifierService: BanqueNameVerifierService,
    private MarchandService: MarchandService,
  ) {}

  iOrganisationID!: number;
  infosUser: any;

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
    this.loadTypeBeneficiaires();
    this.getListeBeneficiaire();
    this.getListeBanques();
  }

  // =====================
  // VARIABLES
  // =====================
  // listeCompteClient: any[] = [];
  listeBanques: any[] = [];

  selectedDebitAccount = '';
  selectedBalanceAccount = '';
  selectedBicCode = '';

  nomDebiteur = '';
  soldeDebiteur: any = '';
  nomBanque = '';

  loading = true;
  errorMessage = '';
  typesCompte = '';

  // =====================
  // CHARGEMENT DES COMPTES
  // =====================
  getListeCompteClient(): void {
    if (!this.iOrganisationID) return;

    this.listeCompteCLientService
      .getListeCompteClient(this.iOrganisationID)
      .subscribe({
        next: (response: any) => {
          this.listeCompteClient = response?.data?.[0]?.comptes ?? [];
          this.loading = false;

          // Types de comptes
          this.typesCompte = [
            ...new Set(this.listeCompteClient.map((c) => c.vcAccountType)),
          ].join(' - ');

          // Sélection auto
          if (this.listeCompteClient.length > 0) {
            const firstAccount = this.listeCompteClient[0].vcAccountNumber;

            this.selectedDebitAccount = firstAccount;
            this.selectedBalanceAccount = firstAccount;

            this.onDebitAccountChange(firstAccount);
            this.onBalanceAccountChange(firstAccount);
          }
        },
        error: (err) => {
          this.errorMessage = err.message;
          this.loading = false;
        },
      });
  }

  // =====================
  // COMPTE DÉBITEUR
  // =====================
  onDebitAccountSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement)?.value;
    if (value) this.onDebitAccountChange(value);
  }

  onDebitAccountChange(accountNumber: string): void {
    this.getAccountName(accountNumber);
  }

  getAccountName(accountNumber: string): void {
    this.getAccount.getNomDebiteur(accountNumber).subscribe({
      next: (res) => (this.nomDebiteur = res?.data?.name ?? ''),
      error: () => (this.nomDebiteur = ''),
    });
  }

  // =====================
  // SOLDE DÉBITEUR
  // =====================
  onBalanceAccountSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement)?.value;
    if (value) this.onBalanceAccountChange(value);
  }

  onBalanceAccountChange(accountNumber: string): void {
    this.getBalance(accountNumber);
  }

  getBalance(accountNumber: string): void {
    this.balanceService.getBalance(accountNumber).subscribe({
      next: (res) => (this.soldeDebiteur = res?.data?.soldeDisp ?? ''),
      error: () => (this.soldeDebiteur = ''),
    });
  }

  // =====================
  // BANQUES
  // =====================
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
  }

  getNomBanque(bicCode: string): void {
    this.BanqueNameVerifierService.getNomBanque(bicCode).subscribe({
      next: (res) => (this.nomBanque = res?.data?.name ?? ''),
      error: () => (this.nomBanque = ''),
    });
  }

  // nomDebiteur: string = '';
  // selectedAccountNumber: string = '';
  // selectedAccountNumberSoldeDebiteur: string = '';
  // loading = true;
  // errorMessage = '';
  // typesCompte: string = '';

  // // 🔹 Chargement des comptes client
  // getListeCompteClient(): void {
  //   if (!this.iOrganisationID) return;

  //   this.listeCompteCLientService
  //     .getListeCompteClient(this.iOrganisationID)
  //     .subscribe({
  //       next: (response: any) => {
  //         this.listeCompteClient = response.data?.[0]?.comptes ?? [];
  //         this.loading = false;

  //         // Types de comptes
  //         const types = [
  //           ...new Set(this.listeCompteClient.map((c) => c.vcAccountType)),
  //         ];
  //         this.typesCompte = types.join(' - ');

  //         // ✅ Sélection automatique du premier compte
  //         if (this.listeCompteClient.length > 0) {
  //           this.selectedAccountNumber =
  //             this.listeCompteClient[0].vcAccountNumber;

  //           this.selectedAccountNumberSoldeDebiteur =
  //             this.listeCompteClient[0].vcAccountNumber;

  //           // 🔥 appel logique, PAS événement
  //           this.onAccountNumberChange(this.selectedAccountNumber);
  //           this.onAccountNumberChangesoldeDebiteur(
  //             this.selectedAccountNumberSoldeDebiteur,
  //           );
  //         }
  //       },
  //       error: (err: any) => {
  //         this.errorMessage = err.message;
  //         this.loading = false;
  //         console.error('Erreur getListeCompteClient', err);
  //       },
  //     });
  // }

  // // 🔹 Appelé depuis le HTML (Event)
  // onAccountChange(event: Event): void {
  //   console.log('event: ', event);
  //   const selectElement = event.target as HTMLSelectElement | null;
  //   if (!selectElement) return;

  //   this.onAccountNumberChange(selectElement.value);
  // }

  // // 🔹 Appelé avec une string (logique métier)
  // onAccountNumberChange(accountNumber: string): void {
  //   console.log('accountNumber:', accountNumber);

  //   if (!accountNumber) {
  //     this.nomDebiteur = '';
  //     return;
  //   }

  //   this.getAccountName(accountNumber);
  // }

  // // 🔹 Récupération du nom du débiteur
  // getAccountName(accountNumber: string): void {
  //   this.getAccount.getNomDebiteur(accountNumber).subscribe({
  //     next: (response: any) => {
  //       console.log('response debiteur: ', response.data);
  //       this.nomDebiteur = response?.data?.name ?? '';
  //       console.log('Nom débiteur:', this.nomDebiteur);
  //     },
  //     error: () => {
  //       this.nomDebiteur = '';
  //     },
  //   });
  // }

  // listeBanques: any[] = [];
  // selectedNomBanque: string = '';

  // private listeDesBanques(): void {
  //   this.beneficiaireNodeService.getListeBanque().subscribe({
  //     next: (res) => {
  //       console.log('Réponse API liste des banques :', res);
  //       console.log('Données result :', res.data);

  //       this.listeBanques = res.data;
  //       console.log('listeBanques après affectation :', this.listeBanques);

  //       // ✅ Sélection automatique du premier compte
  //         if (this.listeBanques.length > 0) {
  //           this.selectedNomBanque =
  //             this.listeBanques[0].vcBIC;

  //           // 🔥 appel logique, PAS événement
  //           this.onNumberChangeSelectBanque(this.selectedNomBanque);
  //         }
  //     },
  //     error: (err) => {
  //       console.error('Erreur de la récupération des banques :', err);
  //     },
  //     complete: () => {
  //       console.log('Récupération de la liste des banques terminée');
  //     },
  //   });
  // }

  // // 🔹 Appelé depuis le HTML (Event)
  // onSelectValueBICCode(event: Event): void {
  //   console.log('event: ', event);
  //   const selectElement = event.target as HTMLSelectElement | null;
  //   if (!selectElement) return;

  //   this.onNumberChangeSelectBanque(selectElement.value);
  // }

  // // 🔹 Appelé avec une string (logique métier)
  // onNumberChangeSelectBanque(accountNumber: string): void {
  //   console.log('accountNumber:', accountNumber);

  //   if (!accountNumber) {
  //     this.nomBanque = '';
  //     return;
  //   }

  //   this.getSelectBeneficiaireName(accountNumber);
  // }

  // nomBanque: any;

  // // 🔹 Récupération du nom du débiteur
  // getSelectBeneficiaireName(accountNumber: string): void {
  //   this.BanqueNameVerifierService.getNomBanque(accountNumber).subscribe({
  //     next: (response: any) => {
  //       console.log('response debiteur: ', response.data);
  //       this.nomBanque = response?.data?.name ?? '';
  //       console.log('Nom débiteur:', this.nomBanque);
  //     },
  //     error: () => {
  //       this.nomBanque = '';
  //     },
  //   });
  // }

  // // 🔹 Appelé depuis le HTML (Event)
  // onAccountChangesoldeDebiteur(event: Event): void {
  //   console.log('event: ', event);
  //   const selectElement = event.target as HTMLSelectElement | null;
  //   if (!selectElement) return;

  //   this.onAccountNumberChangesoldeDebiteur(selectElement.value);
  // }

  // // 🔹 Appelé avec une string (logique métier)
  // onAccountNumberChangesoldeDebiteur(accountNumber: string): void {
  //   console.log('accountNumber:', accountNumber);

  //   if (!accountNumber) {
  //     this.nomDebiteur = '';
  //     return;
  //   }

  //   this.getBalance(accountNumber);
  // }

  // soldeDebiteur: any;

  // getBalance(accountNumber: string) {
  //   this.balanceService.getBalance(accountNumber).subscribe({
  //     next: (response: any) => {
  //       console.log('response:', response);
  //       if (response?.data) {
  //         console.log('Balance pour: ', response.data);
  //         this.soldeDebiteur = response?.data?.soldeDisp ?? '';
  //       }
  //       // this.responseData = response;
  //     },
  //     error: (err) => {
  //       console.error('Erreur:', err);
  //     },
  //   });
  // }

  private getUserInfo(): void {
    const user = localStorage.getItem('userInfo');
    if (!user) return;

    this.userInfo = JSON.parse(user);
    this.idOrganisation = this.userInfo?.iOrganisationID;
  }

  private loadTypeBeneficiaires(): void {
    this.beneficiaireService.getListeTypeBeneficiaire().subscribe({
      next: (res) => {
        this.listeTypeBeneficiaire = res?.data ?? [];
      },
      error: (err) => console.error('Erreur type bénéficiaire', err),
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
        error: (err) => {
          console.error('Erreur lors du chargement des bénéficiaires :', err);
          this.loadingFetch = false;
        },
      });
  }

  /** Filtre par type de bénéficiaire */
  testChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;

    console.log('🔥 change déclenché');
    console.log('🔹 Valeur sélectionnée =', value);

    if (!value) {
      console.log('↩ Reset liste complète');
      this.filteredBeneficiaire = [...this.listeBeneficiaire];
      this.selectedBeneficiaire = null;
      return;
    }

    const selected = value.trim().toLowerCase();

    this.filteredBeneficiaire = this.listeBeneficiaire.filter((b) => {
      const typeB = (b?.BeneficiaryTypeName ?? '')
        .toString()
        .trim()
        .toLowerCase();

      console.log('comparaison :', typeB, '===', selected);
      return typeB === selected;
    });

    console.log('✅ Résultat filtre =', this.filteredBeneficiaire);
    this.selectedBeneficiaire = null;
  }

  selectedBeneficiaireId: string = ''; // variable temporaire pour l'ID

  onBeneficiaireChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedBeneficiaireId = select.value;

    console.log('🔥 change déclenché');
    console.log('🔹 Valeur sélectionnée =', this.selectedBeneficiaireId);

    if (!this.selectedBeneficiaireId) {
      this.filteredBeneficiaireOne = [...this.filteredBeneficiaire];
      this.selectedBeneficiaire = null;
      return;
    }

    const selected = this.selectedBeneficiaireId.trim();

    this.filteredBeneficiaireOne = this.filteredBeneficiaire.filter((b) => {
      return b?.BeneficiaryID?.toString() === selected;
    });

    this.selectedBeneficiaire = this.filteredBeneficiaireOne[0] ?? null;

    console.log('✅ Bénéficiaire sélectionné =', this.selectedBeneficiaire);
  }

  montant: number | null = null;
  vcNotes: string = '';

  submitForm(form: any) {
    if (!form.valid) {
      console.log('Formulaire invalide');
      return;
    }

    if (!this.selectedBeneficiaire) {
      console.error('Bénéficiaire non sélectionné');
      return;
    }

    const vcPayerAccount = this.selectedDebitAccount;
    const vcBenefName =
      this.selectedBeneficiaire.vcFirstName +
      ' ' +
      this.selectedBeneficiaire.vcLastName;
    const vcBenefAccount = this.selectedBeneficiaire.vcAccountNumber;
    const mAmount = this.montant;
    const mFeesEcash = 0; // ajuster selon ton contexte
    const mFeesBCI = 0; // ajuster selon ton contexte
    const btFeesIncluded = false; // ajuster selon ton contexte
    const vcNotes = this.vcNotes;

    // this.MarchandService.postPaiementMarchant(
    //   vcPayerAccount,
    //   vcBenefName,
    //   vcBenefAccount,
    //   mAmount,
    //   mFeesEcash,
    //   mFeesBCI,
    //   btFeesIncluded,
    //   vcNotes,
    // ).subscribe({
    //   next: (res) => {
    //     console.log('Paiement réussi', res);
    //     // tu peux naviguer vers /recap si nécessaire
    //   },
    //   error: (err) => {
    //     console.error('Erreur paiement', err);
    //   },
    // });
  }
}
