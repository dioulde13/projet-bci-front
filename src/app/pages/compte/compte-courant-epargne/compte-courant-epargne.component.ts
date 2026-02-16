import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { BalanceService } from '../../../servicesNodes/balance/balance.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-compte-courant-epargne',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './compte-courant-epargne.component.html',
  styleUrl: './compte-courant-epargne.component.css',
})
export class CompteCourantEpargneComponent implements OnInit {
  constructor(
    private listeCompteCLientService: DashboardService,
    private balanceService: BalanceService,
    private toastr: ToastrService,
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
      this.getListeCompteClient();
    } else {
      console.warn('iOrganisationID non défini');
      this.loading = false;
    }
  }

  selectedAccountNumber: string = '';
  loading = true;
  errorMessage = '';
  typesCompte: string = '';
  listeCompteClient: any[] = [];
  countNombreComptes: any;

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
          this.countNombreComptes = this.listeCompteClient.length;
          // console.log('Liste des comptes client :', this.listeCompteClient);

          // Extraire les types
          const types = [
            ...new Set(this.listeCompteClient.map((c: any) => c.vcAccountType)),
          ];
          this.typesCompte = types.join(' - ');

          // 🔥 Sélection automatique du premier compte
          if (this.listeCompteClient.length > 0) {
            this.selectedAccountNumber =
              this.listeCompteClient[0].vcAccountNumber;
            // console.log('selectedAccountNumber :', this.selectedAccountNumber);

            this.onDebitAccountChange(this.selectedAccountNumber);
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

  onDebitAccountSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement)?.value;
    if (value) this.onDebitAccountChange(value);
  }

  soldeDebiteur: any = '';
  deviseDebiteur: any = '';

  onDebitAccountChange(accountNumber: string): void {
    this.getBalance(accountNumber);
  }

  getBalance(accountNumber: string): void {
    this.balanceService.getBalance(accountNumber).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.soldeDebiteur = this.formatSolde(res?.data?.soldeDisp);
          this.deviseDebiteur = res?.data?.devise;
        } else {
          this.soldeDebiteur = 0;
          this.deviseDebiteur = '';
        }
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du solde :', error);
        this.soldeDebiteur = 0;
      },
    });
  }

  formatSolde(solde: any): number {
    if (solde === null || solde === undefined) return 0;

    // Si c'est déjà un number
    if (typeof solde === 'number') return solde;

    // Si c'est une string avec virgule (ex: "2416,51")
    if (typeof solde === 'string') {
      return Number(solde.replace(',', '.')) || 0;
    }

    return 0;
  }
}
