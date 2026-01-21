import { Component, OnInit } from '@angular/core';
import { BeneficiaireService } from '../../../../services/beneficiaire/beneficiaire.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BalanceService } from '../../../../servicesNodes/balance/balance.service';

@Component({
  selector: 'app-transfert-unique',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './transfert-unique.component.html',
  styleUrls: ['./transfert-unique.component.css'],
})
export class TransfertUniqueComponent implements OnInit {
  userInfo: any;
  idOrganisation!: number;

  // Listes et sélections
  listeTypeBeneficiaire: any[] = [];
  listeBeneficiaire: any[] = [];
  filteredBeneficiaire: any[] = [];
  filteredBeneficiaireOne: any[] = [];

  selectedTypeBeneficiaire: string = '';
  selectedBeneficiaire: any = null;

  loadingFetch = false; // correction typo

  constructor(
    private beneficiaireService: BeneficiaireService,
    private balanceService: BalanceService,
  ) {}

  ngOnInit(): void {
    this.getUserInfo();
    this.loadTypeBeneficiaires();
    this.getListeBeneficiaire();
    this.getBalance();
  }

   getBalance() {
    

    this.balanceService.getBalance("1000730002").subscribe({
      next: (response: any) => {
        console.log('response:', response);
        if (response?.data) {
            console.log('Balance pour', response.data);
          }
        // this.responseData = response;
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }

  private getUserInfo(): void {
    const user = localStorage.getItem('userInfo');
    if (!user) return;

    this.userInfo = JSON.parse(user);
    this.idOrganisation = this.userInfo?.iOrganisationID;
  }

  private loadTypeBeneficiaires(): void {
    this.beneficiaireService.getListeTypeBeneficiaire().subscribe({
      next: (res) => {
        this.listeTypeBeneficiaire = res?.data ?? [];
      },
      error: (err) => console.error('Erreur type bénéficiaire', err),
    });
  }

  private getListeBeneficiaire(): void {
    if (!this.idOrganisation) return;

    this.loadingFetch = true;

    this.beneficiaireService
      .getListeBeneficiaire(this.idOrganisation)
      .subscribe({
        next: (res: any) => {
          this.listeBeneficiaire = res?.data ?? [];
          this.filteredBeneficiaire = [...this.listeBeneficiaire];
          this.loadingFetch = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des bénéficiaires :', err);
          this.loadingFetch = false;
        },
      });
  }

  /** Filtre par type de bénéficiaire */
  testChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;

    console.log('🔥 change déclenché');
    console.log('🔹 Valeur sélectionnée =', value);

    if (!value) {
      console.log('↩ Reset liste complète');
      this.filteredBeneficiaire = [...this.listeBeneficiaire];
      this.selectedBeneficiaire = null;
      return;
    }

    const selected = value.trim().toLowerCase();

    this.filteredBeneficiaire = this.listeBeneficiaire.filter((b) => {
      const typeB = (b?.BeneficiaryTypeName ?? '')
        .toString()
        .trim()
        .toLowerCase();

      console.log('comparaison :', typeB, '===', selected);
      return typeB === selected;
    });

    console.log('✅ Résultat filtre =', this.filteredBeneficiaire);
    this.selectedBeneficiaire = null;
  }

  //   onBeneficiaireChange(event: Event): void {
  //   const select = event.target as HTMLSelectElement;
  //   const value = select.value;

  //   console.log('🔥 change déclenché');
  //   console.log('🔹 Valeur sélectionnée =', value);

  //   if (!value) {
  //     this.filteredBeneficiaireOne = [...this.filteredBeneficiaire];
  //     this.selectedBeneficiaire = null;
  //     return;
  //   }

  //   const selected = value.trim();

  //   // 🔥 Supprimé setTimeout pour affichage instantané
  //   this.filteredBeneficiaireOne = this.filteredBeneficiaire.filter((b) => {
  //     return b?.BeneficiaryID?.toString() === selected;
  //   });

  //   this.selectedBeneficiaire = this.filteredBeneficiaireOne[0] ?? null;

  //   console.log('✅ Bénéficiaire sélectionné =', this.selectedBeneficiaire);
  // }

  selectedBeneficiaireId: string = ''; // variable temporaire pour l'ID

  onBeneficiaireChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedBeneficiaireId = select.value;

    console.log('🔥 change déclenché');
    console.log('🔹 Valeur sélectionnée =', this.selectedBeneficiaireId);

    if (!this.selectedBeneficiaireId) {
      this.filteredBeneficiaireOne = [...this.filteredBeneficiaire];
      this.selectedBeneficiaire = null;
      return;
    }

    const selected = this.selectedBeneficiaireId.trim();

    this.filteredBeneficiaireOne = this.filteredBeneficiaire.filter((b) => {
      return b?.BeneficiaryID?.toString() === selected;
    });

    this.selectedBeneficiaire = this.filteredBeneficiaireOne[0] ?? null;

    console.log('✅ Bénéficiaire sélectionné =', this.selectedBeneficiaire);
  }
}
