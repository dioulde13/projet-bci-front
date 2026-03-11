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
import { BalanceService } from '../../../../servicesNodes/balance/balance.service';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../services/notification/notification.service';
import { TransfertMultipleService } from '../../../../services/transfertMultipleService/transfert-multiple.service';
import { TransfertMultipleServiceNode } from '../../../../servicesNodes/transfertMultipleServices/transfert-multiple.service';
import { GetAccountNameService } from '../../../../servicesNodes/verifierNomDebiteur/get-account-name.service';

@Component({
  selector: 'app-calcul-paie',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './calcul-paie.component.html',
  styleUrl: './calcul-paie.component.css',
})
export class CalculPaieComponent implements OnInit, AfterViewInit {
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

  constructor(
    private selectedService: SelectedBeneficiairesService,
    private listeCompteCLientService: DashboardService,
    private balanceService: BalanceService,
    private transactionService: TransfertMultipleService,
    private notification: NotificationService,
    private transfertMultipleServiceNode: TransfertMultipleServiceNode,
    private getAccount: GetAccountNameService,
  ) {}

  iOrganisationID!: number;
  infosUser: any;

  ngOnInit(): void {
    this.beneficiaires = this.selectedService.getSelected();
    console.log('this.beneficiaires: ', this.beneficiaires);
    this.beneficiaires.forEach((b) => this.selectedIds.add(b.id));
    this.allChecked = true;

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
      vcReceiverAccount: b.vcAccountNumber,
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
              this.validerPaiementsNodes();
            } else {
              this.loadingValider = false;
            }
            // // ✅ Fermer le modal
            // const modalEl = document.getElementById(
            //   'validerTouslesPaiements-2',
            // );
            // if (modalEl) {
            //   const modal = (window as any).bootstrap.Modal.getInstance(
            //     modalEl,
            //   );
            //   if (modal) modal.hide();
            // }
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
          // console.log('✅ Paiements validés :', res);
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
