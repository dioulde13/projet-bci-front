import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { BalanceService } from '../../../servicesNodes/balance/balance.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyRateService } from '../../../servicesNodes/currencyRate/currency-rate.service';
import { GnfNumberFormatDirective } from '../../../directives/gnf-number-format.directive';

@Component({
  selector: 'app-compte-courant-epargne',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, GnfNumberFormatDirective],
  templateUrl: './compte-courant-epargne.component.html',
  styleUrl: './compte-courant-epargne.component.css',
})
export class CompteCourantEpargneComponent implements OnInit {
  constructor(
    private listeCompteCLientService: DashboardService,
    private balanceService: BalanceService,
    private currencyRateService: CurrencyRateService,
  ) { }

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
  loading = true;           // chargement de la liste des comptes
  loadingBalance = true;    // chargement du solde (card bleue)
  errorMessage = '';
  typesCompte: string = '';
  listeCompteClient: any[] = [];
  countNombreComptes: any;
  // Convertisseur
  amount: number | null = null;
  fromCurrency: string = 'USD';
  toCurrency: string = 'GNF';
  conversionResult: string = 'Taux de change :';
  loadingCalculation = false;

  getListeCompteClient(): void {
    if (!this.iOrganisationID) {
      console.warn('Impossible de récupérer la liste : iOrganisationID non défini');
      return;
    }

    this.listeCompteCLientService
      .getListeCompteClient(this.iOrganisationID)
      .subscribe({
        next: (response) => {
          this.listeCompteClient = response.data?.[0]?.comptes ?? [];
          this.loading = false;
          this.countNombreComptes = this.listeCompteClient.length;

          // Extraire les types
          const types = [
            ...new Set(this.listeCompteClient.map((c: any) => c.vcAccountType)),
          ];
          this.typesCompte = types.join(' - ');

          // Sélection automatique du premier compte
          if (this.listeCompteClient.length > 0) {
            this.selectedAccountNumber = this.listeCompteClient[0].vcAccountNumber;
            this.onDebitAccountChange(this.selectedAccountNumber);
          } else {
            this.loadingBalance = false; // aucun compte, pas de solde à charger
          }
        },
        error: (err: any) => {
          this.errorMessage = err.message;
          this.loading = false;
          this.loadingBalance = false;
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
    this.loadingBalance = true; // ← skeleton solde activé à chaque changement de compte
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
        this.loadingBalance = false; // ← skeleton solde désactivé
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du solde :', error);
        this.soldeDebiteur = 0;
        this.loadingBalance = false; // ← skeleton solde désactivé même en erreur
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