import { Component, OnInit } from '@angular/core';
import Papa from 'papaparse';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { TransactionService } from '../../servicesNodes/transactionService/transaction.service';
import { FormsModule } from '@angular/forms';
import { BalanceService } from '../../servicesNodes/balance/balance.service';
// import { GnfFormatPipe } from '../gnfFormat/gnf-format.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule,
    // GnfFormatPipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  csvData: any[] = [];
  headers: string[] = [];
  selectedFile: File | null = null;
  listeCompteClient: any[] = [];

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

  constructor(
    private listeCompteCLientService: DashboardService,
    private dixTransactionServiceNode: TransactionService,
    private balanceService: BalanceService,
  ) {}

  // totalSolde: any;

  // processAccounts(): void {
  //   console.log('this.listeCompteClient: ', this.listeCompteClient);
  //   if (!this.listeCompteClient || this.listeCompteClient.length === 0) {
  //     console.log('Aucun compte à traiter');
  //     return;
  //   }

  //   this.listeCompteClient.forEach((compte: any) => {
  //     const accountNumber = compte.vcAccountNumber;

  //     if (!accountNumber) {
  //       console.warn('Compte sans numéro:', compte);
  //       return;
  //     }

  //     console.log('Traitement du compte:', accountNumber);

  //     this.balanceService.getBalance(accountNumber).subscribe({
  //       next: (response) => {
  //         console.log('Réponse complète pour', accountNumber, ':', response);

  //         if (response?.data) {
  //           console.log('Balance pour', accountNumber, ':', response.data);
  //           this.totalSolde = response.data.soldeDisp;
  //           console.log('Total Solde: ', this.totalSolde);
  //         }
  //       },
  //       error: (error) => {
  //         console.error('Erreur pour', accountNumber, ':', error);
  //       },
  //     });
  //   });
  // }

  // processAccounts() {
  //   this.accountNumbers.forEach((accNum: string) => {
  //     this.balanceService.getBalance(accNum).subscribe({
  //       next: (response) => {
  //         console.log('Réponse pour', accNum, ':', response.data);
  //       },
  //       error: (error) => {
  //         console.error('Erreur pour', accNum, ':', error);
  //       },
  //     });
  //   });
  // }

  selectedAccountNumber: string = '';
  loading = true;
  errorMessage = '';
  typesCompte: string = '';

  getListeCompteClient(): void {
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
          this.listeCompteClient = response.data?.[0]?.comptes ?? [];
          this.loading = false;

          console.log('Liste des comptes client :', this.listeCompteClient);

          // Extraire les types
          const types = [
            ...new Set(this.listeCompteClient.map((c: any) => c.vcAccountType)),
          ];
          this.typesCompte = types.join(' - ');

          // 🔥 Sélection automatique du premier compte
          if (this.listeCompteClient.length > 0) {
            this.selectedAccountNumber =
              this.listeCompteClient[0].vcAccountNumber;
            console.log('selectedAccountNumber :', this.selectedAccountNumber);

            this.dixTransactionsRecentsListe();
            // ✅ ICI SEULEMENT
            // this.processAccounts();
          }
        },
        error: (err: any) => {
          this.errorMessage = err.message;
          this.loading = false;
          console.error('Erreur getListeCompteClient', err);
        },
      });
  }

  loadingDixPremiereTransactions: boolean = false;

  listeDixPremiereTransactions: any[] = [];

  dixTransactionsRecentsListe() {
    this.loadingDixPremiereTransactions = true;

    this.dixTransactionServiceNode
      .dixTransactionsRecents(this.selectedAccountNumber)
      .subscribe({
        next: (response) => {
          this.listeDixPremiereTransactions = response.data.statement;
          this.loadingDixPremiereTransactions = false;
        },
        error: (error) => {
          console.error(error);
          this.loadingDixPremiereTransactions = false;
        },
      });
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

    // this.dixTransactionsRecentsListe();
    // this.processAccounts();
  }
}
