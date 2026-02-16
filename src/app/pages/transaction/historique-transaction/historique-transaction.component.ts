import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { HistoriqueTransactionService } from '../../../services/historiques/historique-transaction.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-historique-transaction',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './historique-transaction.component.html',
  styleUrl: './historique-transaction.component.css',
})
export class HistoriqueTransactionComponent implements OnInit {
  constructor(
    private historiqueTransactionService: HistoriqueTransactionService,
    private toastr: ToastrService,
  ) {}

  iOrganisationID!: number;
  infosUser: any;

  dateDebut: string = '';
  dateFin: string = '';
  paymentModeName: string = '';

  listeHistoriqueTransactions: any[] = [];
  listePaymentModes: string[] = [];

  isLoadingUser: boolean = false;

  pageSize = 5;
  currentPage = 1;
  searchText = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.dateDebut = today;
    this.dateFin = today;

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

    this.historiqueTransactionService
      .getAllTransactions(this.iOrganisationID)
      .subscribe({
        next: (response) => {
          this.listeHistoriqueTransactions = response?.data || [];
          console.log(
            'this.listeHistoriqueTransactions: ',
            this.listeHistoriqueTransactions,
          );
          // Extraire les modes uniques
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
        },
      });
  }

  // ========================
  // FILTRAGE + TRI
  // ========================
  get filteredData() {
    let data = [...this.listeHistoriqueTransactions];

    // Filtre date début
    if (this.dateDebut) {
      const debut = new Date(this.dateDebut);
      data = data.filter((d) => new Date(d.dtCreated) >= debut);
    }

    // Filtre date fin
    if (this.dateFin) {
      const fin = new Date(this.dateFin);
      fin.setHours(23, 59, 59, 999);
      data = data.filter((d) => new Date(d.dtCreated) <= fin);
    }

    // Filtre mode paiement
    if (this.paymentModeName) {
      data = data.filter((d) => d.PaymentModeName === this.paymentModeName);
    }

    // Recherche texte
    if (this.searchText) {
      const term = this.searchText.toLowerCase();
      data = data.filter((d) =>
        Object.values(d).some((val) =>
          val?.toString().toLowerCase().includes(term),
        ),
      );
    }

    // Tri
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
    return Math.min(this.currentPage * this.pageSize, this.filteredData.length);
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

  formatMontant(t: any): string {
    const montant = Number(t.Amount ?? 0);

    return montant.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // ========================
  // EXPORT EXCEL
  // ========================
  exportExcel() {
    if (this.filteredData.length === 0) return;

    const dataForExcel = this.filteredData.map((d) => ({
      Date: new Date(d.dtCreated).toLocaleString(),
      Reference: d.Reference,
      Nom: d.UserFullName,
      Mode: d.PaymentModeName,
      Montant: d.Amount,
    }));

    const ws = XLSX.utils.json_to_sheet(dataForExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(wb, 'transactions.xlsx');
  }

  // ========================
  // EXPORT PDF
  // ========================
  exportPdf() {
    if (this.filteredData.length === 0) return;

    const doc = new jsPDF('l', 'mm', 'a4');
    doc.text('Liste des transactions', 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [['Date', 'Reference', 'Nom', 'Mode', 'Montant']],
      body: this.filteredData.map((d) => [
        new Date(d.dtCreated).toLocaleString(),
        d.Reference,
        d.UserFullName,
        d.PaymentModeName,
        d.Amount,
      ]),
      styles: { fontSize: 9 },
    });

    doc.save('transactions.pdf');
  }

  selectedTransaction: any = null;
  isCancelling: boolean = false;

  openCancelModal(transaction: any) {
    this.selectedTransaction = transaction;
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

  confirmCancel() {
    if (!this.selectedTransaction) return;

    // console.log('this.selectedTransaction: ', this.selectedTransaction);

    this.isCancelling = true;

    this.historiqueTransactionService
      .cancelTransaction(this.selectedTransaction.iRequestID) // adapte si besoin
      .subscribe({
        next: (response: any) => {
          if (response.status === 200) {
            this.toastr.success(response.message, '', {
              positionClass: 'toast-custom-center',
            });
          } else {
            this.toastr.error(this.decodeMessage(response.message), '', {
              positionClass: 'toast-custom-center',
            });
          }
          // Retirer la transaction de la liste
          // this.listeHistoriqueTransactions =
          //   this.listeHistoriqueTransactions.filter(
          //     (t) => t.Reference !== this.selectedTransaction.Reference,
          //   );
          this.historiqueTransactionsListe();
          this.selectedTransaction = null;
          this.isCancelling = false;
        },
        error: () => {
          this.isCancelling = false;
        },
      });
  }
  closeModal() {
    this.selectedTransaction = null;
  }
}
