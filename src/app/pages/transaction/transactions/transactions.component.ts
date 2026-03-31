import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { TransactionService } from '../../../servicesNodes/transactionService/transaction.service';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CurrencyRateService } from '../../../servicesNodes/currencyRate/currency-rate.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-transactions',
  imports: [FormsModule, CommonModule, RouterLink],
  standalone: true,
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css',
})
export class TransactionsComponent implements OnInit {
  constructor(
    private listeCompteCLientService: DashboardService,
    private TransactionServiceNode: TransactionService,
    private currencyRateService: CurrencyRateService,
  ) { }

  iOrganisationID!: number;
  infosUser: any;
  listeCompteClient: any[] = [];

  dateDebut: string = '';
  dateFin: string = '';
  selectedAccountNumber: string = '';

  loading = true;
  errorMessage = '';

  listeHistoriqueTransactions: any[] = [];

  // Convertisseur
  amount: number | null = null;
  fromCurrency: string = 'USD';
  toCurrency: string = 'GNF';
  conversionResult: string = 'Taux de change :';
  loadingCalculation = false;

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.dateDebut = today;
    this.dateFin = today;

    const userJson = localStorage.getItem('userInfo');
    if (userJson) {
      try {
        this.infosUser = JSON.parse(userJson);
        this.iOrganisationID = this.infosUser?.iOrganisationID;
      } catch (e) {
        console.error('Erreur parsing userInfo', e);
      }
    }

    if (!this.iOrganisationID) {
      console.warn('iOrganisationID non trouvé');
      return;
    }

    this.getListeCompteClient();
  }

  nombreCompte: any;

  infosCompteSelectionner: any;

  getListeCompteClient(): void {
    this.listeCompteCLientService
      .getListeCompteClient(this.iOrganisationID)
      .subscribe({
        next: (response) => {
          this.listeCompteClient = response.data?.[0]?.comptes ?? [];
          console.log('this.listeCompteClient: ', this.listeCompteClient);

          this.nombreCompte = response.data?.[0]?.comptes.length;

          if (this.listeCompteClient.length > 0) {
            this.selectedAccountNumber =
              this.listeCompteClient[0].vcAccountNumber;
            console.log(
              'Compte sélectionné par défaut :',
              this.selectedAccountNumber,
            );
            this.historiqueTransactionsListe();
          }

          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = err.message;
          this.loading = false;
          console.error('Erreur getListeCompteClient', err);
        },
      });
  }

  isLoadingUser: boolean = false;
  NomCompte: any;
  dateCompte: any;

  historiqueTransactionsListe(): void {
    if (!this.selectedAccountNumber) return;

    this.infosCompteSelectionner = this.listeCompteClient.filter(
      (l: any) => l.vcAccountNumber === this.selectedAccountNumber,
    );

    console.log('this.infosCompte: ', this.infosCompteSelectionner[0]);
    this.NomCompte = this.infosCompteSelectionner[0].vcAccountName;
    this.dateCompte = this.infosCompteSelectionner[0].dtCreated;


    console.log(this.dateDebut);
    console.log(this.dateFin);

    this.isLoadingUser = true;

    this.TransactionServiceNode.historiqueTransactions(
      this.selectedAccountNumber,
      this.dateDebut,
      this.dateFin,
    ).subscribe({
      next: (response) => {
        this.listeHistoriqueTransactions = response.data.statement || [];
        this.isLoadingUser = false;
        console.log(this.listeHistoriqueTransactions);
      },
      error: (error) => {
        this.isLoadingUser = false;
        console.error('Erreur historique', error);
      },
    });
  }

  pageSize = 5;
  currentPage = 1;
  searchText = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Filtrer et trier
  get filteredData() {
    let data = [...this.listeHistoriqueTransactions];

    // Recherche
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
    if (page >= 1 && page <= this.totalPages()) this.currentPage = page;
  }

  previousPage() {
    this.goToPage(this.currentPage - 1);
  }
  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  // Pagination dynamique
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

  // Tri par colonne
  sort(col: string) {
    if (this.sortColumn === col) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = col;
      this.sortDirection = 'asc';
    }
  }

  exportExcel() {
    if (this.filteredData.length === 0) return;

    // Créer une copie des données et renommer les colonnes pour Excel
    const dataForExcel = this.filteredData.map((d) => ({
      Date: new Date(d.dateOper).toLocaleString(),
      Reference: d.bankReference,
      Signe: d.sigOper,
      Description: d.libelleOper,
      // Montant: d.AmountOper
    }));

    // Créer une feuille
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataForExcel);

    // Créer le classeur
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Beneficiaires');

    // Générer le fichier Excel
    XLSX.writeFile(wb, 'beneficiaires.xlsx');
  }

  exportPdf() {
    if (this.filteredData.length === 0) return;

    const doc = new jsPDF('l', 'mm', 'a4'); // paysage

    doc.setFontSize(14);
    doc.text('Liste des transactions', 14, 15);

    // Colonnes du tableau
    const columns = [
      { header: 'Date', dataKey: 'date' },
      { header: 'Référence', dataKey: 'reference' },
      { header: 'Signe', dataKey: 'signe' },
      { header: 'Description', dataKey: 'description' },
    ];

    // Données
    const rows = this.filteredData.map((d) => ({
      date: new Date(d.dateOper).toLocaleString(),
      reference: d.bankReference,
      signe: d.sigOper,
      description: d.libelleOper,
    }));

    autoTable(doc, {
      startY: 25,
      headStyles: { fillColor: [22, 160, 133] }, // vert stylé 😎
      columns: columns,
      body: rows,
      styles: {
        fontSize: 9,
      },
    });

    doc.save('beneficiaires.pdf');
  }

  onPageClick(page: number | string) {
    if (typeof page === 'number') this.goToPage(page);
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
    // const signe = t.sigOper === 'D' ? '-' : '+'; ${signe}

    const sign = t.devise;

    return `${montant.toLocaleString('fr-FR')} ${sign}`;
  }





  convertCurrency(): void {
    console.group('🔄 convertCurrency()');
    console.log('📥 Paramètres reçus :', {
      amount: this.amount,
      fromCurrency: this.fromCurrency,
      toCurrency: this.toCurrency,
    });

    if (!this.amount || !this.fromCurrency || !this.toCurrency) {
      console.warn('⚠️ Validation échouée — champ(s) manquant(s) :', {
        amount: this.amount ?? 'MANQUANT',
        fromCurrency: this.fromCurrency || 'MANQUANT',
        toCurrency: this.toCurrency || 'MANQUANT',
      });
      this.conversionResult = 'Veuillez remplir tous les champs.';
      console.groupEnd();
      return;
    }

    console.log('✅ Validation OK — lancement de la requête...');
    this.loadingCalculation = true;
    this.conversionResult = 'Calcul en cours...';

    console.log(`📡 Appel getCurrencyRate(${this.fromCurrency} → ${this.toCurrency})`);
    console.time('⏱️ Durée requête getCurrencyRate');

    this.currencyRateService
      .getCurrencyRate(this.fromCurrency, this.toCurrency)
      .subscribe({
        next: (res) => {
          console.timeEnd('⏱️ Durée requête getCurrencyRate');
          console.log('📦 Réponse brute reçue :', res);

          this.loadingCalculation = false;

          if (res && res.data && res.data.nRate) {
            const rate = res.data.nRate;
            const result = (this.amount || 0) * rate;

            console.log('💱 Taux extrait (nRate) :', rate);
            console.log('🧮 Calcul :', {
              amount: this.amount,
              rate,
              result,
              formula: `${this.amount} × ${rate} = ${result}`,
            });

            this.conversionResult = `Taux de change : ${rate} | Résultat : ${result.toLocaleString('fr-FR')} ${this.toCurrency}`;
            console.log('✅ conversionResult :', this.conversionResult);
          } else {
            console.warn('⚠️ Structure de réponse inattendue ou nRate absent :', {
              res,
              hasData: !!res?.data,
              hasNRate: !!res?.data?.nRate,
            });
            this.conversionResult = 'Taux non disponible pour cette paire.';
          }

          console.groupEnd();
        },
        error: (err) => {
          console.timeEnd('⏱️ Durée requête getCurrencyRate');
          this.loadingCalculation = false;
          console.error('❌ Erreur convertCurrency :', {
            status: err?.status,
            statusText: err?.statusText,
            message: err?.message,
            url: err?.url,
            error: err?.error,
          });
          this.conversionResult = 'Erreur lors du calcul du taux.';
          console.groupEnd();
        },
      });
  }




}
