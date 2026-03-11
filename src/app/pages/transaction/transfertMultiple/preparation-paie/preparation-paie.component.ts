import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  OnInit,
} from '@angular/core';
import * as Papa from 'papaparse';
import flatpickr from 'flatpickr';
import { Router, RouterLink } from '@angular/router';
import { French } from 'flatpickr/dist/l10n/fr.js';
import { CommonModule } from '@angular/common';
import { TransfertMultipleService } from '../../../../services/transfertMultipleService/transfert-multiple.service';
import { SelectedBeneficiairesService } from '../../../../services/selectedBeneficiaires/selected-beneficiaires.service';
import { DashboardService } from '../../../../services/dashboard/dashboard.service';
import { BalanceService } from '../../../../servicesNodes/balance/balance.service';
import { FormsModule } from '@angular/forms';
import { GenericFileImportComponent } from '../../../generic-file-import/generic-file-import.component';
import { SaveFichierCSVService } from '../../../../servicesNodes/saveFichierCSVTransaction/save-fichier-csv.service';
import { NotificationService } from '../../../../services/notification/notification.service';

@Component({
  selector: 'app-preparation-paie',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, GenericFileImportComponent],
  templateUrl: './preparation-paie.component.html',
  styleUrls: ['./preparation-paie.component.css'],
})
export class PreparationPaieComponent implements OnInit, AfterViewInit {
  // ─── Données API ───────────────────────────────────────────────
  beneficiaires: any[] = [];
  isLoading = false;
  errorMessage = '';

  // ─── Sélection des cases à cocher ─────────────────────────────
  selectedIds: Set<string> = new Set();
  allChecked = false;

  // ─── Totaux calculés dynamiquement ────────────────────────────
  get totalPaiements(): number {
    return this.beneficiaires.reduce(
      (sum, b) => sum + parseFloat(b.mAmount || '0'),
      0,
    );
  }

  get nombreBeneficiaires(): number {
    return this.beneficiaires.length;
  }

  // ─── CSV ───────────────────────────────────────────────────────
  csvData: any[] = [];
  headers: string[] = [];
  selectedFile: File | null = null;

  @ViewChild('datepickerInput') datepickerInput!: ElementRef;
  calendarInstance: any;

  constructor(
    private transfertService: TransfertMultipleService,
    private selectedService: SelectedBeneficiairesService,
    private router: Router,
    private listeCompteCLientService: DashboardService,
    private balanceService: BalanceService,
    private saveFichierCSVService: SaveFichierCSVService,
    private notification: NotificationService,
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
      this.loadBeneficiaires();
      this.getListeCompteClient();
    } else {
      console.warn('iOrganisationID non défini');
    }
  }

  selectedAccountNumber: string = '';
  loading = true;
  typesCompte: string = '';
  countNombreComptes: any;
  loadingListeCompteClient: boolean = false;
  listeCompteClient: any[] = [];

  getListeCompteClient(): void {
    this.loadingListeCompteClient = true;
    if (!this.iOrganisationID) {
      console.warn(
        'Impossible de récupérer la liste : iOrganisationID non défini',
      );
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
            this.selectedAccountNumber =
              this.listeCompteClient[0].vcAccountNumber;
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

  loadBeneficiaires(): void {
    this.isLoading = true;
    this.transfertService
      .getAllBeneficiaireImport(this.iOrganisationID)
      .subscribe({
        next: (response) => {
          if (response?.status === 200) {
            this.beneficiaires = response.data;

            // ── Restaurer les IDs précédemment cochés ──────────────
            const savedIds = this.selectedService.getSelectedIds();
            if (savedIds.size > 0) {
              this.selectedIds = savedIds;
            }
            this.allChecked =
              this.selectedIds.size === this.beneficiaires.length &&
              this.beneficiaires.length > 0;
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur chargement bénéficiaires', err);
          this.errorMessage = 'Impossible de charger les bénéficiaires.';
          this.isLoading = false;
        },
      });
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.allChecked = checked;
    if (checked) {
      this.beneficiaires.forEach((b) => this.selectedIds.add(b.id));
    } else {
      this.selectedIds.clear();
    }
    this.selectedService.setSelectedIds(this.selectedIds); // ← PERSIST
  }

  toggleOne(id: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedIds.add(id);
    } else {
      this.selectedIds.delete(id);
    }
    this.allChecked = this.selectedIds.size === this.beneficiaires.length;
    this.selectedService.setSelectedIds(this.selectedIds); // ← PERSIST
  }

  ngAfterViewInit(): void {
    this.calendarInstance = flatpickr(this.datepickerInput.nativeElement, {
      mode: 'range',
      locale: French,
    });
  }

  isChecked(id: string): boolean {
    return this.selectedIds.has(id);
  }

  // ─── Naviguer vers Calcul de la Paie avec les sélectionnés ────
  onCalculerLaPaie(): void {
    const selected = this.beneficiaires.filter((b) =>
      this.selectedIds.has(b.id),
    );
    this.selectedService.setSelected(selected);
    this.router.navigate(['/calculPaie']);
  }

  // ─── Calendrier ────────────────────────────────────────────────
  openCalendar(): void {
    if (this.calendarInstance) {
      this.calendarInstance.open();
    }
  }

  // ─── CSV ───────────────────────────────────────────────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onFormSubmit(event: Event): void {
    event.preventDefault();
    if (this.selectedFile) {
      this.parseCSV(this.selectedFile);
    } else {
      alert('Veuillez sélectionner un fichier CSV avant de charger.');
    }
  }

  parseCSV(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const csv = reader.result as string;
      Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          this.csvData = result.data;
          if (this.csvData.length > 0) {
            this.headers = Object.keys(this.csvData[0]);
          }
        },
      });
    };
    reader.readAsText(file);
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

    // Compatibilité : EventEmitter Angular (event direct ou event.file)
    // et CustomEvent DOM natif (event.detail.file)
    const file: File = event?.detail?.file ?? event?.file ?? event;

    if (!(file instanceof File)) {
      console.error('Le fichier CSV est invalide ou non trouvé', event);
      this.loadingValidation = false;
      return;
    }

    this.saveFichierCSVService
      .saveFichierCSVTransaction(file, this.iOrganisationID, '0')
      .subscribe({
        next: (res) => {
          this.notification.success(res.message);
          this.openModal = false;
          this.loadingValidation = false;
        },
        error: (err) => {
          console.error('Erreur import', err);
          this.loadingValidation = false;
        },
      });
  }

  notificationEnCoursDeveloppement() {
    this.notification.error(
      'Cette fonctionnalité est en cours de développement.',
    );
  }
}
