import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { TransactionService } from '../../../servicesNodes/transactionService/transaction.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transactions',
  imports: [FormsModule, CommonModule],
  standalone: true,
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css',
})
export class TransactionsComponent implements OnInit {
  constructor(
    private listeCompteCLientService: DashboardService,
    private TransactionServiceNode: TransactionService
  ) {}

  iOrganisationID!: number;
  infosUser: any;
  listeCompteClient: any[] = [];

  dateDebut: string = '';
  dateFin: string = '';
  selectedAccountNumber: string = '';

  loading = true;
  errorMessage = '';

  listeHistoriqueTransactions: any[] = [];

  ngOnInit(): void {
    // Dates par défaut
    const today = new Date().toISOString().split('T')[0];
    this.dateDebut = today;
    this.dateFin = today;

    // Récupération infos user
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

  getListeCompteClient(): void {
    this.listeCompteCLientService
      .getListeCompteClient(this.iOrganisationID)
      .subscribe({
        next: (response) => {
          this.listeCompteClient = response.data?.[0]?.comptes ?? [];

          // Si comptes trouvés → sélection automatique du 1er
          if (this.listeCompteClient.length > 0) {
            this.selectedAccountNumber =
              this.listeCompteClient[0].vcAccountNumber;

            console.log(
              'Compte sélectionné par défaut :',
              this.selectedAccountNumber
            );

            // Charger les transactions du premier compte
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

  historiqueTransactionsListe(): void {
    if (!this.selectedAccountNumber) return;

    this.TransactionServiceNode.historiqueTransactions(
      this.selectedAccountNumber,
      this.dateDebut,
      this.dateFin
    ).subscribe({
      next: (response) => {
        this.listeHistoriqueTransactions = response.data.statement;
        console.log(this.listeHistoriqueTransactions);
      },
      error: (error) => {
        console.error('Erreur historique', error);
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
    const signe = t.sigOper === 'D' ? '-' : '+';

    const sign = t.devise;

    return `${signe} ${montant.toLocaleString('fr-FR')} ${sign}`;
  }
}
