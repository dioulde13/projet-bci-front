import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  OnInit,
} from '@angular/core';
import flatpickr from 'flatpickr';
import { RouterLink } from '@angular/router';
import { French } from 'flatpickr/dist/l10n/fr.js';
import { CommonModule } from '@angular/common';
import { SelectedBeneficiairesService } from '../../../../services/selectedBeneficiaires/selected-beneficiaires.service';
import { DashboardService } from '../../../../services/dashboard/dashboard.service';
// import { BalanceService } from '../../../../servicesNodes/balance/balance.service';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../services/notification/notification.service';
import { TransfertMultipleService } from '../../../../services/transfertMultipleService/transfert-multiple.service';
import { TransfertMultipleServiceNode } from '../../../../servicesNodes/transfertMultipleServices/transfert-multiple.service';
import { GetAccountNameService } from '../../../../servicesNodes/verifierNomDebiteur/get-account-name.service';
import { TransfertMultipleSideMenuComponent } from '../side-menu/side-menu.component';

@Component({
  selector: 'app-calcul-paie',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, TransfertMultipleSideMenuComponent],
  templateUrl: './calcul-paie.component.html',
  styleUrl: './calcul-paie.component.css',
})
export class CalculPaieComponent implements OnInit, AfterViewInit {
  activeTabId: string = "v-pills-DetailsDesPaiements";

  handleTabChange(tabId: string) {
    this.activeTabId = tabId;
  }

  isTabActive(tabId: string): boolean {
    return this.activeTabId === tabId;
  }

  isNotTabActive(tabId: string): boolean {
    return this.activeTabId !== tabId;
  }

  // ─── Données reçues depuis PreparationPaie ─────────────────────
  beneficiaires: any[] = [];
  selectedIds: Set<string> = new Set();
  allChecked = false;

  // ─── Bénéficiaire ciblé pour retrait unitaire ─────────────────
  beneficiaireARetirer: any = null;

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

  // ========================
  // FILTRAGE + PAGINATION
  // ========================
  get filteredBeneficiaires() {
    let data = [...this.beneficiaires];
    if (this.searchText) {
      const term = this.searchText.toLowerCase();
      data = data.filter((b) =>
        Object.values(b).some((val) =>
          val?.toString().toLowerCase().includes(term),
        ),
      );
    }
    return data;
  }

  get paginatedBeneficiaires() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredBeneficiaires.slice(start, start + this.pageSize);
  }

  totalPages() {
    return Math.ceil(this.filteredBeneficiaires.length / this.pageSize);
  }

  startIndex() {
    return this.filteredBeneficiaires.length === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  endIndex() {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredBeneficiaires.length,
    );
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage = page;
    }
  }

  previousPage() {
    this.goToPage(this.currentPage - 1);
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  getPages(): (number | string)[] {
    const total = this.totalPages();
    const pages: (number | string)[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else if (this.currentPage <= 3) {
      pages.push(1, 2, 3, 4, 5, '...', total);
    } else if (this.currentPage >= total - 2) {
      pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
    } else {
      pages.push(
        1,
        '...',
        this.currentPage - 1,
        this.currentPage,
        this.currentPage + 1,
        '...',
        total,
      );
    }
    return pages;
  }

  onPageClick(page: number | string) {
    if (typeof page === 'number') this.goToPage(page);
  }

  get totalSelectionnes(): number {
    return this.beneficiaires
      .filter((b) => this.selectedIds.has(b.id))
      .reduce((sum, b) => sum + parseFloat(b.mAmount || '0'), 0);
  }

  get nombreSelectionnes(): number {
    return this.selectedIds.size;
  }

  // ─── Calendrier ────────────────────────────────────────────────
  @ViewChild('datepickerInput') datepickerInput!: ElementRef;
  calendarInstance: any;

  // ─── Formulaire Valider / Soumettre ───────────────────────────
  objetTransfert: string = '';
  descriptionTransfert: string = '';
  datePrevue: string = '';

  // ─── États de chargement / retour API ─────────────────────────
  loadingValider: boolean = false;
  successMessage: string = '';
  apiErrorMessage: string = '';

  // ─── Pagination & Filtrage ────────────────────────────────────
  pageSize = 5;
  currentPage = 1;
  searchText = '';

  constructor(
    private selectedService: SelectedBeneficiairesService,
    private listeCompteCLientService: DashboardService,
    // private balanceService: BalanceService,
    private transactionService: TransfertMultipleService,
    private notification: NotificationService,
    private transfertMultipleServiceNode: TransfertMultipleServiceNode,
    private getAccount: GetAccountNameService,
  ) { }

  iOrganisationID!: number;
  infosUser: any;
  userInfoConfig: any;
  VirementMultiAPI: any;
  ngOnInit(): void {
    this.beneficiaires = this.selectedService.getSelected();
    console.log('this.beneficiaires: ', this.beneficiaires);

    // Initialisation : aucune ligne cochée par défaut
    this.selectedIds.clear();
    this.allChecked = false;

    const userInfoConfig = localStorage.getItem('userInfoConfig');
    if (userInfoConfig) {
      try {
        this.userInfoConfig = JSON.parse(userInfoConfig);
        this.VirementMultiAPI = this.userInfoConfig?.VirementMultiAPI;
      } catch {
        this.userInfoConfig = null;
      }
    }

    console.log("userInfoConfig: ", userInfoConfig);
    console.log("VirementMultiAPI: ", this.VirementMultiAPI);

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
    }
  }

  selectedAccountNumber: string = '';
  vcPayerName: string = '';
  loading = true;
  errorMessage = '';
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
            this.vcPayerName = this.listeCompteClient[0].vcAccountName;
            console.log("this.vcPayerName: ", this.vcPayerName);
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
    this.getAccount.getNomDebiteur(accountNumber).subscribe({
      next: (res) => {
        console.log("res: ", res);
        if (res && res.data) {
          this.loadingGetBalance = false;
          this.soldeDebiteur = this.formatSolde(res?.data?.soldeDisp);
          this.deviseDebiteur = res?.data?.devise;
          this.vcPayerName = res?.data?.name;
          console.log("this.soldeDebiteur: ", this.soldeDebiteur);
          console.log("this.deviseDebiteur: ", this.deviseDebiteur);
          console.log("this.vcPayerName: ", this.vcPayerName);
        } else {
          this.loadingGetBalance = false;
          this.soldeDebiteur = 0;
          this.deviseDebiteur = '';
          this.vcPayerName = '';
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

  ngAfterViewInit(): void {
    this.calendarInstance = flatpickr(this.datepickerInput.nativeElement, {
      mode: 'range',
      locale: French,
    });
  }

  openCalendar(): void {
    if (this.calendarInstance) {
      this.calendarInstance.open();
    }
  }

  // ─── Gestion des cases à cocher ───────────────────────────────
  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.allChecked = checked;
    if (checked) {
      this.beneficiaires.forEach((b) => this.selectedIds.add(b.id));
    } else {
      this.selectedIds.clear();
    }
  }

  toggleOne(id: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedIds.add(id);
    } else {
      this.selectedIds.delete(id);
    }
    this.allChecked = this.selectedIds.size === this.beneficiaires.length;
  }

  isChecked(id: string): boolean {
    return this.selectedIds.has(id);
  }

  // ─── Retirer un bénéficiaire (unitaire) ───────────────────────
  confirmerRetrait(b: any): void {
    this.beneficiaireARetirer = b;
  }

  retirerBeneficiaire(): void {
    if (this.beneficiaireARetirer) {
      this.beneficiaires = this.beneficiaires.filter(
        (b) => b.id !== this.beneficiaireARetirer.id,
      );
      this.selectedIds.delete(this.beneficiaireARetirer.id);
      this.selectedService.setSelected(this.beneficiaires);
      this.beneficiaireARetirer = null;
      this.allChecked = this.selectedIds.size === this.beneficiaires.length;
    }
  }

  // ─── Retirer tous les bénéficiaires cochés ────────────────────
  retirerSelectionnes(): void {
    this.beneficiaires = this.beneficiaires.filter(
      (b) => !this.selectedIds.has(b.id),
    );
    this.selectedIds.clear();
    this.allChecked = false;
    this.selectedService.setSelected(this.beneficiaires);
  }

  // ─── Réinitialiser les messages avant ouverture de modal ──────
  resetMessages(): void {
    this.successMessage = '';
    this.apiErrorMessage = '';
    this.objetTransfert = '';
    this.descriptionTransfert = '';
    this.datePrevue = '';
  }

  // ─── Mapper les bénéficiaires pour l'API ──────────────────────
  private buildBeneficiariesPayload(): any[] {
    return this.beneficiaires.map((b, index) => ({
      vcReceiverName: b.vcFullName,
      // vcReceiverAccount: b.vcAccountNumber,
      vcReceiverAccount: b.vcIBAN,
      vcReceiverBICCode: b.vcBIC ?? '',
      mAmount: parseFloat(b.mAmount || '0'),
      ImportID: b.id,
    }));
  }

  reference: any;
  transaction_id: any;

  // ─── Appel API : Valider Tous les Paiements ───────────────────
  validerPaiements(): void {
    if (!this.descriptionTransfert) {
      this.apiErrorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    this.loadingValider = true;
    this.successMessage = '';
    this.apiErrorMessage = '';

    const payload = {
      payment_date: new Date().toISOString().split('T')[0],
      vcPayerName: this.vcPayerName,
      payer_account: this.selectedAccountNumber,
      montantTotal: this.totalPaiements,
      iOrganisationID: this.iOrganisationID,
      iUserID: this.infosUser?.iUserID ?? this.infosUser?.id,
      vcCurrency: this.deviseDebiteur || 'GNF',
      vcDescription: this.descriptionTransfert,
      beneficiaries: this.buildBeneficiariesPayload(),
      isValidatedViaApi: this.VirementMultiAPI == '0' ? 0 : 1,
    };

    console.log('💡 validerPaiements payload:', payload);

    this.transactionService
      .addTransactionMultiple(
        payload.payment_date,
        payload.vcPayerName,
        payload.payer_account,
        payload.montantTotal,
        payload.iOrganisationID,
        payload.iUserID,
        payload.vcCurrency,
        payload.vcDescription,
        payload.beneficiaries,
        payload.isValidatedViaApi,
      )
      .subscribe({
        next: (res) => {
          if (res.status === 200) {
            console.log("res: ", res);
            // this.loadingValider = false;
            if (res.data.reference && res.data.transaction_id) {
              this.reference = res.data.reference;
              this.transaction_id = res.data.transaction_id;
              // this.notification.success(res.message);
              if (this.VirementMultiAPI == '1') {
                console.log("Passage API");
                this.validerPaiementsNodes();
              } else {
                this.notification.success(res.message);

                console.log("Passage Manuel");
                // ✅ Fermer le modal
                const modalEl = document.getElementById(
                  'validerTouslesPaiements-2',
                );
                if (modalEl) {
                  const modal = (window as any).bootstrap.Modal.getInstance(
                    modalEl,
                  );
                  if (modal) modal.hide();
                }
                this.loadingValider = false;
              }
            } else {
              this.loadingValider = false;
            }
          } else {
            this.loadingValider = false;

            this.notification.error(res.message);
          }
          console.log('✅ Paiements validés :', res);
          // this.successMessage = 'Les paiements ont été validés avec succès.';
        },
        error: (err) => {
          this.loadingValider = false;
          console.error('❌ Erreur validation paiements :', err);
          this.notification.error(
            'Une erreur est survenue. Veuillez réessayer.',
          );
        },
      });
  }

  // ─── Appel API : Valider Tous les Paiements ───────────────────
  validerPaiementsNodes(): void {
    const payload = {
      vcPayerName: this.vcPayerName,
      dtPaymentDate: new Date().toISOString().split('T')[0],
      vcPaymentReference: this.reference,
      vcPayerAccount: this.selectedAccountNumber,
      iTransactionID: this.transaction_id,
    };

    console.log('💡 validerPaiements payload Nodes:', payload);

    this.transfertMultipleServiceNode
      .addTransactionMultipleNodes(
        payload.vcPayerName,
        payload.dtPaymentDate,
        payload.vcPaymentReference,
        payload.vcPayerAccount,
        payload.iTransactionID,
      )
      .subscribe({
        next: (res) => {
          if (res.status === 200) {
            this.loadingValider = false;

            this.notification.success(res.message);
            // ✅ Fermer le modal
            const modalEl = document.getElementById(
              'validerTouslesPaiements-2',
            );
            if (modalEl) {
              const modal = (window as any).bootstrap.Modal.getInstance(
                modalEl,
              );
              if (modal) modal.hide();
            }
          } else {
            this.loadingValider = false;

            this.notification.error(res.message);
          }
        },
        error: (err) => {
          this.loadingValider = false;
          console.error('❌ Erreur validation paiements :', err);
          this.notification.error(
            'Une erreur est survenue. Veuillez réessayer.',
          );
        },
      });
  }

  // ─── Appel API : Soumettre pour Approbation ───────────────────
  soumettreApprobation(): void {
    if (
      !this.objetTransfert ||
      !this.descriptionTransfert ||
      !this.datePrevue
    ) {
      this.apiErrorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    this.loadingValider = true;
    this.successMessage = '';
    this.apiErrorMessage = '';
    console.log("this.buildBeneficiariesPayload: ", this.buildBeneficiariesPayload());

    const payload = {
      payment_date: this.datePrevue,
      vcPayerName: this.infosUser?.vcFullName ?? this.infosUser?.vcName ?? '',
      payer_account: this.selectedAccountNumber,
      montantTotal: this.totalPaiements,
      iOrganisationID: this.iOrganisationID,
      iUserID: this.infosUser?.iUserID ?? this.infosUser?.id,
      vcCurrency: this.deviseDebiteur || 'GNF',
      vcDescription: this.descriptionTransfert,
      beneficiaries: this.buildBeneficiariesPayload(),
      isValidatedViaApi: this.VirementMultiAPI === 0 ? 0 : 1,
    };

    console.log('💡 soumettreApprobation payload:', payload);

    this.transactionService
      .addTransactionMultiple(
        payload.payment_date,
        payload.vcPayerName,
        payload.payer_account,
        payload.montantTotal,
        payload.iOrganisationID,
        payload.iUserID,
        payload.vcCurrency,
        payload.vcDescription,
        payload.beneficiaries,
        payload.isValidatedViaApi,
      )
      .subscribe({
        next: (res) => {
          this.loadingValider = false;
          console.log('✅ Soumis pour approbation :', res);
          this.successMessage =
            'Les paiements ont été soumis pour approbation.';
        },
        error: (err) => {
          this.loadingValider = false;
          console.error('❌ Erreur soumission :', err);
          this.apiErrorMessage =
            err?.error?.message ??
            'Une erreur est survenue. Veuillez réessayer.';
        },
      });
  }
}
