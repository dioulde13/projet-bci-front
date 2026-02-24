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
  NavigationStart,
  Router,
  RouterLink,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { TransactionService } from '../../servicesNodes/transactionService/transaction.service';
import { FormsModule } from '@angular/forms';
import { BalanceService } from '../../servicesNodes/balance/balance.service';
import { BciLoaderService } from '../../servicesNodes/bciLoader/bci-loader.service';
import { SaveFichierCSVService } from '../../servicesNodes/saveFichierCSVTransaction/save-fichier-csv.service';
import { OrdreTransfertInternationalComponent } from '../transfertInternationale/ordre-transfert-international/ordre-transfert-international.component';
import { BeneficiaireEnAttenteService } from '../../servicesNodes/beneficiaireEnAttente/beneficiaire-en-attente.service';
import { NotificationService } from '../../services/notification/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule,
    OrdreTransfertInternationalComponent,
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

  listeCompteClient: any[] = [];

  // ===== LOADER NAVIGATION =====
  isLoading = false;
  private navigationSubscription!: Subscription;

  showLoader() {
    if (this.isLoading) return; // bloque double-clic

    this.isLoading = true;

    // Se désabonner si déjà abonné pour éviter les fuites mémoire
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
    private saveFichierCSVService: SaveFichierCSVService,
    private bciLoaderService: BciLoaderService,
    private router: Router,
    private beneficiaireEnAttente: BeneficiaireEnAttenteService,
    private notification: NotificationService,
  ) {}

  iOrganisationID!: number;
  infosUser: any;

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

  openModal = false;
  fields: any[] = [
    { key: 'prenom', label: 'Prénom', required: true },
    { key: 'nom', label: 'Nom', required: true },
    { key: 'typeBeneficiaire', label: 'Type de bénéficiaire', required: true },
    { key: 'numeroCompte', label: 'Numéro de compte', required: true },
    { key: 'bic', label: 'BIC', required: true },
    { key: 'montant', label: 'Montant', required: true, type: 'number' },
    { key: 'devise', label: 'Devise', required: true },
    { key: 'modePaiement', label: 'Mode paiement', required: true },
    { key: 'nomBanque', label: 'Nom de la banque du bénéficiaire' },
    { key: 'adresseBanque', label: 'Adresse de la banque du bénéficiaire' },
    { key: 'objetPaiement', label: 'Objet du paiement' },
  ];

  loadingValidation: boolean = false;

  onImportedData(event: any) {
    this.loadingValidation = true;

    const file: File = event?.detail?.file;

    if (!(file instanceof File)) {
      console.error('Le fichier CSV est invalide ou non trouvé');
      return;
    }

    this.saveFichierCSVService
      .saveFichierCSVTransaction(file, 1, this.iOrganisationID)
      .subscribe({
        next: (res) => {
          this.notification.success(res.message);
          this.openModal = false;
          this.loadingValidation = false;
        },
        error: (err) => {
          console.error('Erreur import', err);
        },
      });
  }

  notificationEnCoursDeveloppement() {
    this.notification.error('Cette fonctionnalité est en cours de développement.');
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
