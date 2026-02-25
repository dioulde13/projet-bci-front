import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NotificationService } from '../../../services/notification/notification.service';
import { TransactionInternationalService } from '../../../services/transactionInternational/transaction-international.service';
declare var bootstrap: any;

@Component({
  selector: 'app-transaction-international',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './transaction-international.component.html',
  styleUrl: './transaction-international.component.css',
})
export class TransactionInternationalComponent implements OnInit {
  constructor(
    private transactionInternationalService: TransactionInternationalService,
    private notification: NotificationService,
  ) {}

  iOrganisationID!: number;
  infosUser: any;

  dateDebut: string = '';
  dateFin: string = '';
  paymentModeName: string = '';

  listeHistoriqueTransactions: any[] = [];
  listePaymentModes: string[] = [];

  isLoadingUser: boolean = false;

  pageSize = 10;
  currentPage = 1;
  searchText = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  selectedRowId: number | null = null;

  ngOnInit(): void {
    // Par défaut : 30 derniers jours
    const today = new Date();
    const il30Jours = new Date();
    il30Jours.setDate(today.getDate() - 30);

    this.dateDebut = il30Jours.toISOString().split('T')[0];
    this.dateFin = today.toISOString().split('T')[0];

    const userJson = localStorage.getItem('userInfo');
    if (userJson) {
      this.infosUser = JSON.parse(userJson);
      this.iOrganisationID = this.infosUser?.iOrganisationID;
    }

    if (this.iOrganisationID) {
      this.historiqueTransactionsListe();
    }
  }

  historiqueTransactionsListe(): void {
    this.isLoadingUser = true;

    this.transactionInternationalService
      .getAllTransactions(this.iOrganisationID)
      .subscribe({
        next: (response) => {
          this.listeHistoriqueTransactions = response?.data || [];

          // Extraire les modes de paiement uniques
          this.listePaymentModes = [
            ...new Set(
              this.listeHistoriqueTransactions
                .map((t) => t.PaymentModeName)
                .filter((m) => !!m),
            ),
          ];

          this.currentPage = 1;
          this.isLoadingUser = false;
        },
        error: () => {
          this.isLoadingUser = false;
          this.notification.error('Erreur lors du chargement des transactions.');
        },
      });
  }

  // ========================
  // FILTRAGE + TRI
  // ========================
  get filteredData() {
    let data = [...this.listeHistoriqueTransactions];

    if (this.dateDebut) {
      const debut = new Date(this.dateDebut);
      debut.setHours(0, 0, 0, 0);
      data = data.filter((d) => new Date(d.dtCreated) >= debut);
    }

    if (this.dateFin) {
      const fin = new Date(this.dateFin);
      fin.setHours(23, 59, 59, 999);
      data = data.filter((d) => new Date(d.dtCreated) <= fin);
    }

    if (this.paymentModeName) {
      data = data.filter((d) => d.PaymentModeName === this.paymentModeName);
    }

    if (this.searchText) {
      const term = this.searchText.toLowerCase();
      data = data.filter((d) =>
        Object.values(d).some((val) =>
          val?.toString().toLowerCase().includes(term),
        ),
      );
    }

    if (this.sortColumn) {
      data.sort((a, b) => {
        const valA = a[this.sortColumn] ?? '';
        const valB = b[this.sortColumn] ?? '';
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }

  get paginedTransaction() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  totalPages() {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  startIndex() {
    return this.filteredData.length === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  endIndex() {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredData.length,
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
    const maxVisible = 5;

    if (total <= maxVisible) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (this.currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5, '...', total);
      } else if (this.currentPage >= total - 2) {
        pages.push(
          1,
          '...',
          total - 4,
          total - 3,
          total - 2,
          total - 1,
          total,
        );
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
    }
    return pages;
  }

  onPageClick(page: number | string) {
    if (typeof page === 'number') this.goToPage(page);
  }

  sort(col: string) {
    if (this.sortColumn === col) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = col;
      this.sortDirection = 'asc';
    }
  }

  getSortIcon(col: string): string {
    if (this.sortColumn !== col) return 'fas fa-sort text-muted';
    return this.sortDirection === 'asc'
      ? 'fas fa-sort-up text-primary'
      : 'fas fa-sort-down text-primary';
  }

  formatMontant(t: any): string {
    const montant = Number(t);
    if (isNaN(montant)) return '0,00';
    return montant.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  getStatusLabel(status: string): string {
    if (!status) return 'Inconnu';
    switch (status.toLowerCase()) {
      case 'success':   return 'Succès';
      case 'cancelled': return 'Annulé';
      case 'failed':    return 'Échoué';
      case 'pending':   return 'En attente';
      default:          return status;
    }
  }

  getStatusClass(status: string): string {
    if (!status) return 'badge bg-secondary';
    switch (status.toLowerCase()) {
      case 'success':   return 'badge bg-success';
      case 'cancelled': return 'badge bg-secondary';
      case 'failed':    return 'badge bg-danger';
      case 'pending':   return 'badge bg-warning text-dark';
      default:          return 'badge bg-secondary';
    }
  }

  // ========================
  // EXPORT EXCEL
  // ========================
  exportExcel() {
    if (this.filteredData.length === 0) {
      this.notification.error('Aucune donnée à exporter.');
      return;
    }

    const dataForExcel = this.filteredData.map((d) => ({
      'Date': new Date(d.dtCreated).toLocaleString('fr-FR'),
      'Référence': d.Reference,
      'Expéditeur': d.PayerName,
      'Compte expéditeur': d.PayerAccount,
      'Bénéficiaire': d.BenefName,
      'Compte bénéficiaire': d.BenefAccount,
      'BIC bénéficiaire': d.BenefBIC,
      'Banque expéditeur': d.vcSenderBankName,
      'Banque bénéficiaire': d.vcReceiverBankName,
      'Mode de paiement': d.PaymentModeName,
      'Montant': d.Amount,
      'Devise débiteur': d.debiteurCurrency,
      'Montant converti': d.mAmountConverted,
      'Devise bénéficiaire': d.BenefCurrency,
      'Taux de change': d.nRate,
      'Statut': this.getStatusLabel(d.Status),
      'Organisation': d.OrganisationName,
      'Utilisateur': d.UserFullName,
    }));

    const ws = XLSX.utils.json_to_sheet(dataForExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions Internationales');
    XLSX.writeFile(wb, 'transactions_internationales.xlsx');
  }

  // ========================
  // EXPORT PDF
  // ========================
  exportPdf() {
    if (this.filteredData.length === 0) {
      this.notification.error('Aucune donnée à exporter.');
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(14);
    doc.text('Transactions Internationales', 14, 15);
    doc.setFontSize(9);
    doc.text(`Généré le : ${new Date().toLocaleString('fr-FR')}`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [
        ['Date', 'Référence', 'Expéditeur', 'Bénéficiaire', 'Mode', 'Montant', 'Converti', 'Statut'],
      ],
      body: this.filteredData.map((d) => [
        new Date(d.dtCreated).toLocaleString('fr-FR'),
        d.Reference,
        d.PayerName,
        d.BenefName,
        d.PaymentModeName,
        `${this.formatMontant(d.Amount)} ${d.debiteurCurrency}`,
        `${this.formatMontant(d.mAmountConverted)} ${d.BenefCurrency}`,
        this.getStatusLabel(d.Status),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 60, 130] },
    });

    doc.save('transactions_internationales.pdf');
  }

  // ========================
  // IMPRESSION REÇU
  // ========================
  printRow(transaction: any) {
    this.selectedRowId = transaction.iRequestID;

    setTimeout(() => {
      const now = new Date();
      const dateRapport =
        now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR');

      const datePaiement = transaction.dtCreated
        ? new Date(transaction.dtCreated).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })
        : '';

      const badgeStyle =
        transaction.Status?.toLowerCase() === 'success'
          ? 'background:#d4edda;color:#155724;'
          : transaction.Status?.toLowerCase() === 'pending'
          ? 'background:#fff3cd;color:#856404;'
          : 'background:#f8d7da;color:#721c24;';

      const printWindow = window.open('', '_blank', 'width=900,height=700');
      if (!printWindow) return;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8"/>
          <title>Avis de Paiement – ${transaction.Reference || ''}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; font-size: 13px; color: #222; padding: 30px 40px; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 14px; border-bottom: 1.5px solid #aaa; }
            .header-left { display: flex; align-items: center; gap: 14px; }
            .logo-circle { width: 68px; height: 68px; border-radius: 50%; border: 3px solid #1e3c82; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; line-height: 1; }
            .letter-b { color: #c0392b; } .letter-c { color: #1e3c82; } .letter-i { color: #27ae60; }
            .bank-french { font-size: 11px; font-weight: bold; color: #1e3c82; text-transform: uppercase; margin-top: 4px; }
            .bank-arabic { font-size: 14px; font-weight: bold; direction: rtl; }
            .header-right { text-align: right; }
            .header-right .title { font-size: 26px; font-weight: bold; color: #1a1a1a; }
            .header-right .report-date { font-size: 11px; color: #555; margin-top: 4px; }
            .org-block { margin: 18px 0 6px 0; font-size: 12.5px; line-height: 1.9; }
            .intro { margin: 14px 0 18px 0; font-size: 12.5px; color: #333; }
            .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #1e3c82; background: #f0f4ff; padding: 5px 8px; letter-spacing: 0.5px; }
            table { width: 100%; border-collapse: collapse; }
            tr { border-bottom: 0.5px solid #ddd; }
            td { padding: 8px; font-size: 12.5px; vertical-align: top; }
            td:nth-child(1) { font-weight: bold; width: 240px; }
            td:nth-child(2) { width: 16px; font-weight: bold; text-align: center; padding: 8px 0; }
            .badge { display: inline-block; padding: 3px 14px; border-radius: 12px; font-size: 11px; font-weight: bold; }
            .footer { margin-top: 40px; border-top: 1px solid #aaa; padding-top: 8px; text-align: center; font-size: 9px; color: #999; font-style: italic; }
            @media print { body { padding: 15px 20px; } @page { margin: 10mm; size: A4 portrait; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-left">
              <div class="logo-circle">
                <span><span class="letter-b">B</span><span class="letter-c">C</span><span class="letter-i">I</span></span>
              </div>
              <div>
                <div class="bank-arabic">بنك التجـارة و الصنـاعة . غينيا</div>
                <div class="bank-french">Banque pour le Commerce et l'Industrie-Guinée</div>
              </div>
            </div>
            <div class="header-right">
              <div class="title">Avis de Paiement</div>
              <div class="report-date">Date / heure du rapport : ${dateRapport}</div>
            </div>
          </div>

          <div class="org-block">
            <div style="font-weight:bold">${transaction.OrganisationName || ''}</div>
            <div>${transaction.UserFullName || ''}</div>
            <div>Conakry, Guinée</div>
          </div>

          <p class="intro">Ceci est la confirmation d'un paiement effectué en votre nom :</p>

          <table>
            <tbody>
              <tr><td colspan="3" class="section-title">Informations générales</td></tr>
              <tr><td>Référence du Paiement</td><td>:</td><td>${transaction.Reference || ''}</td></tr>
              <tr><td>Type de Transaction</td><td>:</td><td>${transaction.TypeTransaction || ''}</td></tr>
              <tr><td>Mode de Paiement</td><td>:</td><td>${transaction.PaymentModeName || ''}</td></tr>
              <tr><td>Date de Paiement</td><td>:</td><td>${datePaiement}</td></tr>
              <tr><td>Statut</td><td>:</td><td><span class="badge" style="${badgeStyle}">${this.getStatusLabel(transaction.Status)}</span></td></tr>

              <tr><td colspan="3" class="section-title">Expéditeur</td></tr>
              <tr><td>Nom de l'Expéditeur</td><td>:</td><td>${transaction.PayerName || ''}</td></tr>
              <tr><td>Compte Expéditeur</td><td>:</td><td>${transaction.PayerAccount || ''}</td></tr>
              <tr><td>Devise Expéditeur</td><td>:</td><td>${transaction.debiteurCurrency || ''}</td></tr>
              <tr><td>Banque Expéditeur</td><td>:</td><td>${transaction.vcSenderBankName || ''}</td></tr>

              <tr><td colspan="3" class="section-title">Bénéficiaire</td></tr>
              <tr><td>Nom du Bénéficiaire</td><td>:</td><td>${transaction.BenefName || ''}</td></tr>
              <tr><td>Compte Bénéficiaire</td><td>:</td><td>${transaction.BenefAccount || ''}</td></tr>
              <tr><td>Devise Bénéficiaire</td><td>:</td><td>${transaction.BenefCurrency || ''}</td></tr>
              <tr><td>Banque Bénéficiaire</td><td>:</td><td>${transaction.vcReceiverBankName || ''}</td></tr>
              <tr><td>BIC Bénéficiaire</td><td>:</td><td>${transaction.BenefBIC || ''}</td></tr>

              <tr><td colspan="3" class="section-title">Montants & Taux</td></tr>
              <tr><td>Montant du Paiement</td><td>:</td><td><strong>${transaction.debiteurCurrency || ''} ${this.formatMontant(transaction.Amount)}</strong></td></tr>
              <tr><td>Montant Converti</td><td>:</td><td>${transaction.BenefCurrency || ''} ${this.formatMontant(transaction.mAmountConverted)}</td></tr>
              <tr><td>Taux de Change</td><td>:</td><td>${this.formatMontant(transaction.nRate)}</td></tr>
            </tbody>
          </table>

          <div class="footer">
            Ceci est un avis de paiement généré par ordinateur et ne nécessite pas une signature autorisée.
            En cas de divergence, veuillez contacter votre organisation.
          </div>
        </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };

      this.selectedRowId = null;
    }, 100);
  }

  // ========================
  // MODALS
  // ========================
  selectedTransaction: any = null;
  isCancelling: boolean = false;
  isVerifying: boolean = false;

  cancelModalInstance: any;
  verifierModalInstance: any;

  openCancelModal(transaction: any) {
    this.selectedTransaction = transaction;
    const modalEl: any = document.getElementById('cancelModal');
    this.cancelModalInstance = new bootstrap.Modal(modalEl);
    this.cancelModalInstance.show();
  }

  closeCancelModal() {
    if (this.cancelModalInstance) this.cancelModalInstance.hide();
    this.selectedTransaction = null;
  }

  openVerifierModal(transaction: any) {
    this.selectedTransaction = transaction;
    const modalEl: any = document.getElementById('verifierModal');
    this.verifierModalInstance = new bootstrap.Modal(modalEl);
    this.verifierModalInstance.show();
  }

  closeVerifierModal() {
    if (this.verifierModalInstance) this.verifierModalInstance.hide();
    this.selectedTransaction = null;
  }

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

  closeModal() {
    this.selectedTransaction = null;
  }
}