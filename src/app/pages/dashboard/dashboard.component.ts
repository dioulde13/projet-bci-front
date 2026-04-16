import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';

import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  Router,
  RouterLink,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { TransactionService } from '../../servicesNodes/transactionService/transaction.service';
import { FormsModule } from '@angular/forms';
import { BalanceService } from '../../servicesNodes/balance/balance.service';
import { BciLoaderService } from '../../servicesNodes/bciLoader/bci-loader.service';
import { OrdreTransfertInternationalComponent } from '../transfertInternationale/ordre-transfert-international/ordre-transfert-international.component';
import { BeneficiaireEnAttenteService } from '../../servicesNodes/beneficiaireEnAttente/beneficiaire-en-attente.service';
import { NotificationService } from '../../services/notification/notification.service';
import { Subscription } from 'rxjs';
import { GenericFileImportComponent } from '../generic-file-import/generic-file-import.component';
import { ImportListeBeneficiaireService } from '../../services/importListeBeneficiaire/import-liste-beneficiaire.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule,
    OrdreTransfertInternationalComponent,
    GenericFileImportComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  dateDuJour: string = '';

  @ViewChild('financialChart', { static: false })
  financialChart!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    this.createChart();
  }

  createChart() {
    if (!this.financialChart) return;

    new Chart(this.financialChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Compte Courant', 'Epargne', 'Autres'],
        datasets: [
          {
            data: [45, 35, 20],
            backgroundColor: ['#ffd700', '#1abc9c', '#ff5733'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }

  // ===== LOADER NAVIGATION =====
  isLoading = false;
  private navigationSubscription!: Subscription;

  showLoader() {
    if (this.isLoading) return;

    this.isLoading = true;

    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }

    this.navigationSubscription = this.router.events.subscribe((event) => {
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.isLoading = false;
        this.navigationSubscription.unsubscribe();
      }
    });
  }
  // =============================

  constructor(
    private listeCompteCLientService: DashboardService,
    private dixTransactionServiceNode: TransactionService,
    private balanceService: BalanceService,
    private notification: NotificationService,
    private bciLoaderService: BciLoaderService,
    private router: Router,
    private beneficiaireEnAttente: BeneficiaireEnAttenteService,
    private importBeneficiaireService: ImportListeBeneficiaireService,
  ) { }

  iOrganisationID!: number;
  infosUser: any;
  userRoleId: string | number | null = null;

  ngOnInit(): void {
    const today = new Date();

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    this.dateDuJour = `À la date du ${today.toLocaleDateString('fr-FR', options)}`;

    this.getBciLoader();

    const userJson = localStorage.getItem('userInfo');

    if (userJson) {
      try {
        this.infosUser = JSON.parse(userJson);
        console.log('this.infosUser: ', this.infosUser);
        this.userRoleId = this.infosUser?.iRoleID;
        console.log('this.userRoleId: ', this.userRoleId);
      } catch {
        this.infosUser = null;
      }
    }

    if (this.infosUser?.iOrganisationID) {
      this.iOrganisationID = this.infosUser.iOrganisationID;
      this.getListeCompteClient();
      this.loadeDemandeSouscriptions();
    } else {
      console.warn('iOrganisationID non défini');
      this.loading = false;
    }
  }

  selectedAccountNumber: string = '';
  loading = true;
  errorMessage = '';
  typesCompte: string = '';
  countNombreComptes: any;
  loadingListeCompteClient: boolean = false;
  listeCompteClient: any[] = [];

  getListeCompteClient(): void {
    this.loadingListeCompteClient = true;
    if (!this.iOrganisationID) {
      console.warn('Impossible de récupérer la liste : iOrganisationID non défini');
      return;
    }

    this.listeCompteCLientService
      .getListeCompteClient(this.iOrganisationID)
      .subscribe({
        next: (response) => {
          this.loadingListeCompteClient = false;
          this.listeCompteClient = response.data?.[0]?.comptes ?? [];
          console.log('this.listeCompteClient: ', this.listeCompteClient);
          this.loading = false;
          this.countNombreComptes = this.listeCompteClient.length;

          const types = [
            ...new Set(this.listeCompteClient.map((c: any) => c.vcAccountType)),
          ];
          this.typesCompte = types.join(' - ');

          if (this.listeCompteClient.length > 0) {
            this.selectedAccountNumber = this.listeCompteClient[0].vcAccountNumber;
            this.dixTransactionsRecentsListe();
            this.onDebitAccountChange(this.selectedAccountNumber);
          }
        },
        error: (err: any) => {
          this.loadingListeCompteClient = false;
          this.errorMessage = err.message;
          this.loading = false;
          console.error('Erreur getListeCompteClient', err);
        },
      });
  }

  onDebitAccountSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement)?.value;
    if (value) this.onDebitAccountChange(value);
  }

  soldeDebiteur: any = '';
  deviseDebiteur: any = '';

  onDebitAccountChange(accountNumber: string): void {
    this.getBalance(accountNumber);
  }

  loadingGetBalance: boolean = false;

  getBalance(accountNumber: string): void {
    this.loadingGetBalance = true;
    this.balanceService.getBalance(accountNumber).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.loadingGetBalance = false;
          this.soldeDebiteur = this.formatSolde(res?.data?.soldeDisp);
          this.deviseDebiteur = res?.data?.devise;
        } else {
          this.loadingGetBalance = false;
          this.soldeDebiteur = 0;
          this.deviseDebiteur = '';
        }
      },
      error: (error) => {
        this.loadingGetBalance = false;
        console.error('Erreur lors de la récupération du solde :', error);
        this.soldeDebiteur = 0;
      },
    });
  }

  formatSolde(solde: any): number {
    if (solde === null || solde === undefined) return 0;
    if (typeof solde === 'number') return solde;
    if (typeof solde === 'string') {
      return Number(solde.replace(',', '.')) || 0;
    }
    return 0;
  }

  allTransactions: any[] = [];
  listeDixPremiereTransactions: any[] = [];
  page = 0;
  limit = 2;
  loadingMore = false;
  loadingDixPremiereTransactions: boolean = false;

  dixTransactionsRecentsListe() {
    this.loadingDixPremiereTransactions = true;

    this.dixTransactionServiceNode
      .dixTransactionsRecents(this.selectedAccountNumber)
      .subscribe({
        next: (response) => {
          this.allTransactions = response.data.statement ?? [];
          this.addItemsOnScroll();
          this.loadingDixPremiereTransactions = false;
        },
        error: (error) => {
          console.error(error);
          this.loadingDixPremiereTransactions = false;
        },
      });
  }

  get isDashboardLoading(): boolean {
    return (
      this.loadingListeCompteClient ||
      this.loadingGetBalance ||
      this.loadingDixPremiereTransactions
    );
  }

  addItemsOnScroll() {
    if (this.loadingMore) return;

    this.loadingMore = true;

    const nextBatch = this.allTransactions.slice(
      this.page * this.limit,
      (this.page + 1) * this.limit,
    );

    this.listeDixPremiereTransactions.push(...nextBatch);
    this.page++;
    this.loadingMore = false;
  }

  @HostListener('window:scroll', [])
  onScroll() {
    const pos = window.innerHeight + window.scrollY;
    const max = document.documentElement.scrollHeight;

    if (
      pos >= max - 100 &&
      this.page * this.limit < this.allTransactions.length
    ) {
      this.addItemsOnScroll();
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

  formatMontant(t: any): string {
    const montant = t.amountOper ?? t.AmountOper ?? 0;
    const sign = t.devise;
    return `${montant.toLocaleString('fr-FR')} ${sign}`;
  }

  getBciLoader() {
    this.bciLoaderService.load();
  }

  userInfo: any;
  idOrganisation!: number;

  isLoadingDemandes: boolean = false;
  demandes: any[] = [];
  traitedDemandes: any[] = [];
  rejectedDemandes: any[] = [];

  private loadeDemandeSouscriptions(): void {
    this.isLoadingDemandes = true;

    this.beneficiaireEnAttente
      .getListeBeneficiaireEnAttente(this.iOrganisationID)
      .subscribe({
        next: (res) => {
          if (res?.status === 200) {
            this.demandes = res?.data.filter(
              (d: any) => d.vcStatus === 'En traitement',
            );
            this.traitedDemandes = res?.data.filter(
              (d: any) => d.vcStatus === 'Valide',
            );
            this.rejectedDemandes = res?.data.filter(
              (d: any) => d.vcStatus === 'Rejete',
            );
          } else {
            if (res?.error?.message === 'Unauthenticated.') {
              this.notification.error('Votre session a expirée');
              this.router.navigate(['/login']);
            }
          }
          this.isLoadingDemandes = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des demandes :', err);
          this.notification.error('Une erreur interne est survenue.');
          this.isLoadingDemandes = false;
        },
      });
  }

  // ===== IMPORT BÉNÉFICIAIRES =====
  openModal = false;
  loadingValidation: boolean = false;

  fields: any[] = [
    { key: 'prenom', label: 'Prénom', required: true },
    { key: 'nom', label: 'Nom', required: true },
    { key: 'typeBeneficiaire', label: 'Type de bénéficiaire', required: true },
    { key: 'numeroCompte', label: 'Numéro de compte', required: true },
    { key: 'cleRib', label: 'Clé RIB', required: true },
    { key: 'bic', label: 'BIC', required: true },
    { key: 'montant', label: 'Montant', required: true, type: 'number' },
    { key: 'devise', label: 'Devise', required: true },
    { key: 'modePaiement', label: 'Mode paiement', required: true },
    { key: 'nomBanque', label: 'Nom de la banque du bénéficiaire' },
    { key: 'adresseBanque', label: 'Adresse de la banque du bénéficiaire' },
    { key: 'objetPaiement', label: 'Objet du paiement' },
  ];

  onImportDataCompleted(event: { data: any[]; file: File | null }): void {
    const importedRows = event?.data ?? [];

    if (importedRows.length > 0) {
      const colonnes = Object.keys(importedRows[0]);
      console.log('📋 Noms des colonnes du fichier importé :', colonnes);
      console.log('📋 Première ligne (données brutes) :', importedRows[0]);
    } else {
      console.warn('⚠️ Aucune ligne dans le fichier importé.');
    }

    const raw = localStorage.getItem('validationResults');
    const validationResults: any[] = raw ? JSON.parse(raw) : [];

    const hasInvalidLines = validationResults.some((r) => r.valid === false);

    if (hasInvalidLines) {
      const invalidCount = validationResults.filter(
        (r) => r.valid === false,
      ).length;
      this.notification.error(
        `Impossible de valider : ${invalidCount} ligne(s) invalide(s) détectée(s). Veuillez retirer toutes les lignes invalides avant de continuer.`,
      );
      return;
    }

    if (!importedRows || importedRows.length === 0) {
      this.notification.error('Aucune donnée à importer.');
      return;
    }

    const beneficiaires = importedRows.map((row, index) => {
      // Rechercher le résultat de validation correspondant à cette ligne (idtableau est 1-indexed)
      const validationResult = (validationResults || []).find(
        (r: any) => r.idtableau === index + 1
      );

      return {
        prenom: row['prenom'] ?? '',
        nom: row['nom'] ?? '',
        typeBeneficiaire: row['typeBeneficiaire'] ?? '',
        numeroCompte: row['numeroCompte'] ?? '',
        cleRib: row['cleRib'] ?? '',
        iban: validationResult?.iban ?? '', // On injecte l'IBAN retourné par l'API
        bic: row['bic'] ?? '',
        montant: Number(row['montant']) ?? 0,
        devise: row['devise'] ?? '',
        modePaiement: row['modePaiement'] ?? '',
        nomBanque: row['nomBanque'] ?? '',
        adresseBanque: row['adresseBanque'] ?? '',
        objetPaiement: row['objetPaiement'] ?? '',
      };
    });

    console.log('beneficiaires: ', beneficiaires);

    // Vérifier que tous les bénéficiaires ont un IBAN (généré par l'API de validation)
    const hasMissingIban = beneficiaires.some((b) => !b.iban || b.iban.trim() === '');
    if (hasMissingIban) {
      const missingCount = beneficiaires.filter((b) => !b.iban || b.iban.trim() === '').length;
      this.notification.error(
        `Impossible d'importer : ${missingCount} bénéficiaire(s) n'ont pas d'IBAN valide. Veuillez vériifer la validation.`
      );
      return;
    }

    this.loadingValidation = true;

    this.importBeneficiaireService
      .importBeneficiaires(this.iOrganisationID, beneficiaires)
      .subscribe({
        next: (res) => {
          this.loadingValidation = false;
          if (res?.status === 200 || res?.status === 201) {
            this.notification.success(
              `${beneficiaires.length} bénéficiaire(s) importé(s) avec succès.`,
            );
            this.openModal = false;
            this.router.navigate(['/preparationPaie']);
            localStorage.removeItem('validationResults');
          } else {
            this.notification.error(
              res?.message ?? "Erreur lors de l'importation.",
            );
          }
        },
        error: (err) => {
          this.loadingValidation = false;
          console.error('Erreur importBeneficiaires :', err);
          this.notification.error(
            "Une erreur est survenue lors de l'importation.",
          );
        },
      });
  }
  // ================================

  // ===== GRILLE LIENS RAPIDES =====
  get visibleLinksCount(): number {
    let count = 2; // Toujours visibles : "Transferts multiples" + "Gérer les bénéficiaires"
    if (this.userRoleId !== '15') count++;                                    // Chargement de fichier
    if (this.userRoleId !== '11') count++;                                    // Transfert unique
    if (this.userRoleId !== '13' && this.userRoleId !== '11' && this.userRoleId !== '12' && this.userRoleId !== '14') count += 3;    // Mobile + Factures + International
    return count;
  }


  get linksColClass(): string {
    return this.visibleLinksCount <= 4 ? 'col-6' : 'col-4';
  }
  // ================================

  notificationEnCoursDeveloppement() {
    this.notification.error(
      'Cette fonctionnalité est en cours de développement.',
    );
  }

  isModalOpen = false;

  openTransferModal() {
    this.isModalOpen = true;
  }

  closeTransferModal() {
    this.isModalOpen = false;
  }

  handleValidation(data: any) {
    console.log('Données reçues du formulaire :', data);
    this.isModalOpen = false;
  }
}