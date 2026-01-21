import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, NgClass, NgForOf, NgIf } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';
import * as XLSX from 'xlsx';

import type { Config } from 'datatables.net';
import { BeneficiaireEnAttenteService } from '../../servicesNodes/beneficiaireEnAttente/beneficiaire-en-attente.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-beneficiaire-en-attente',
  standalone: true,
  imports: [NgClass, NgForOf, NgIf, DataTablesModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './beneficiaire-en-attente.component.html',
  styleUrl: './beneficiaire-en-attente.component.css',
})
export class BeneficiaireEnAttenteComponent implements OnInit, OnDestroy {
  // === GESTION MULTI-TABLES ===
  dtOptions: Config[] = [];
  dtTriggers: Subject<any>[] = [];

  // ========================================
  // ====== Gestion des tabulations =========
  // ========================================
  activeTab: string = 'attente';

  // Ajouter la classe active
  setActiveTab(tabName: string) {
    this.activeTab = tabName;
  }

  // Savoir si c'est la tab est active
  isActive(tabName: string) {
    return this.activeTab === tabName;
  }

  // ========================================
  isLoadingDemandes: boolean = false;
  demandes: any[] = [];
  traitedDemandes: any[] = [];
  rejectedDemandes: any[] = [];

  // constructeur
  constructor(
    private beneficiaireEnAttente: BeneficiaireEnAttenteService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  // A l'initialisation
  ngOnInit() {
    this.getUserInfo();
  }

  userInfo: any;
  idOrganisation!: number;

  /** Récupération infos utilisateur */
  private getUserInfo(): void {
    const user = localStorage.getItem('userInfo');
    if (user) {
      this.userInfo = JSON.parse(user);
      this.idOrganisation = this.userInfo.iOrganisationID;
      this.loadeDemandeSouscriptions();

      console.log('this.idOrganisation: ', this.idOrganisation);
    }
  }

  // Chargement de demandes de souscriptions
  private loadeDemandeSouscriptions(): void {
    console.log('📥 Début du chargement des demandes de souscription');
    this.isLoadingDemandes = true;

    console.log('Number(this.idOrganisation)', this.idOrganisation);

    this.beneficiaireEnAttente
      .getListeBeneficiaireEnAttente(this.idOrganisation)
      .subscribe({
        next: (res) => {
          // console.log('✅ Réponse reçue du serveur :', res);

          if (res?.status === 200) {
            this.demandes = res?.data.filter(
              (d: any) => d.vcStatus === 'En traitement'
            );
            this.traitedDemandes = res?.data.filter(
              (d: any) => d.vcStatus === 'Valide'
            );
            this.rejectedDemandes = res?.data.filter(
              (d: any) => d.vcStatus === 'Rejete'
            );

            console.log('demandes: ', this.demandes);

            console.log(
              `📊 Total demandes en traitement : ${this.demandes.length}`
            );
            console.log(
              `✅ Total demandes validées : ${this.traitedDemandes.length}`
            );
            console.log(
              `❌ Total demandes rejetées : ${this.rejectedDemandes.length}`
            );

            // Initialiser toutes les tables après chargement
            this.dtTriggers.forEach((t, index) => {
              console.log(`🔄 Initialisation DataTable #${index + 1}`);
              t.next(null);
            });
          } else {
            console.warn('⚠️ Réponse serveur avec status non 200 :', res);

            if (res?.error?.message === 'Unauthenticated.') {
              console.error('🚨 Session expirée, redirection vers login');
              this.toastr.error('Votre session a expirée', '', {
                positionClass: 'toast-custom-center',
              });
              this.router.navigate(['/login']);
            }
          }

          this.isLoadingDemandes = false;
          console.log('📌 isLoadingDemandes =', this.isLoadingDemandes);
        },

        error: (err) => {
          console.error('❌ Erreur lors du chargement des demandes :', err);
          this.toastr.error('Une erreur interne est survenue.', '', {
            positionClass: 'toast-custom-center',
          });
          this.isLoadingDemandes = false;
        },
      });
  }




  //Debut de pagination pour traite de demandes
  pageSizeRejectedDemandes = 5;
  currentPageRejectedDemandes = 1;
  searchTextRejectedDemandes = '';
  sortColumnRejectedDemandes = '';
  sortDirectionRejectedDemandes: 'asc' | 'desc' = 'asc';

  // Filtrer et trier
  get filteredDataRejectedDemandes() {
    let data = [...this.rejectedDemandes];

    // Recherche
    if (this.searchTextRejectedDemandes) {
      const term = this.searchTextRejectedDemandes.toLowerCase();
      data = data.filter((d) =>
        Object.values(d).some((val) =>
          val?.toString().toLowerCase().includes(term)
        )
      );
    }

    // Tri
    if (this.sortColumnRejectedDemandes) {
      data.sort((a, b) => {
        const valA = a[this.sortColumnRejectedDemandes] ?? '';
        const valB = b[this.sortColumnRejectedDemandes] ?? '';
        if (valA < valB)
          return this.sortDirectionRejectedDemandes === 'asc' ? -1 : 1;
        if (valA > valB)
          return this.sortDirectionRejectedDemandes === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }

  get pageRejectedDemandes() {
    const start =
      (this.currentPageRejectedDemandes - 1) * this.pageSizeRejectedDemandes;
    return this.filteredDataRejectedDemandes.slice(
      start,
      start + this.pageSizeRejectedDemandes
    );
  }

  totalPagesRejectedDemandes() {
    return Math.ceil(
      this.filteredDataRejectedDemandes.length / this.pageSizeRejectedDemandes
    );
  }

  startIndexRejectedDemandes() {
    return this.filteredDataRejectedDemandes.length === 0
      ? 0
      : (this.currentPageRejectedDemandes - 1) * this.pageSizeRejectedDemandes +
          1;
  }

  endIndexRejectedDemandes() {
    return Math.min(
      this.currentPageRejectedDemandes * this.pageSizeRejectedDemandes,
      this.filteredDataRejectedDemandes.length
    );
  }

  goToPageRejectedDemandes(page: number) {
    if (page >= 1 && page <= this.totalPagesRejectedDemandes())
      this.currentPageRejectedDemandes = page;
  }

  previousPageRejectedDemandes() {
    this.goToPageRejectedDemandes(this.currentPageRejectedDemandes - 1);
  }
  nextPageRejectedDemandes() {
    this.goToPageRejectedDemandes(this.currentPageRejectedDemandes + 1);
  }

  // Pagination dynamique
  getPagesRejectedDemandes(): (number | string)[] {
    const total = this.totalPagesRejectedDemandes();
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (total <= maxVisible) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (this.currentPageRejectedDemandes <= 3) {
        pages.push(1, 2, 3, 4, 5, '...', total);
      } else if (this.currentPageRejectedDemandes >= total - 2) {
        pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(
          1,
          '...',
          this.currentPageRejectedDemandes - 1,
          this.currentPageRejectedDemandes,
          this.currentPageRejectedDemandes + 1,
          '...',
          total
        );
      }
    }
    return pages;
  }

  // Tri par colonne
  sortRejectedDemandes(col: string) {
    if (this.sortColumnRejectedDemandes === col) {
      this.sortDirectionRejectedDemandes =
        this.sortDirectionRejectedDemandes === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumnRejectedDemandes = col;
      this.sortDirectionRejectedDemandes = 'asc';
    }
  }

  exportExcelRejectedDemandes() {
    if (this.filteredDataRejectedDemandes.length === 0) return;

    // Créer une copie des données et renommer les colonnes pour Excel
    const dataForExcel = this.filteredDataRejectedDemandes.map((d) => ({
      Date: new Date(d.BeneficiaryCreatedDate).toLocaleString(), // formater la date
      Nom: d.vcLastName,
      Prénom: d.vcFirstName,
      // Email: d.vcEmail,
      // Type: d.BeneficiaryTypeName,
      // Banque: d.BankName,
      // 'N° Compte': d.vcAccountNumber,
      // Statut: d.vcStatus,
    }));

    // Créer une feuille
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataForExcel);

    // Créer le classeur
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Beneficiaires');

    // Générer le fichier Excel
    XLSX.writeFile(wb, 'beneficiaires.xlsx');
  }

  onPageClickRejectedDemandes(page: number | string) {
    if (typeof page === 'number') this.goToPageRejectedDemandes(page);
  }

  //Fin de pagination pour Rejecter de Demandes




  //Debut de pagination pour demande en attente

  pageSizeDemandes = 5;
  currentPageDemandes = 1;
  searchTextDemandes = '';
  sortColumnDemandes = '';
  sortDirectionDemandes: 'asc' | 'desc' = 'asc';

  // Filtrer et trier
  get filteredDataDemandes() {
    let data = [...this.demandes];

    // Recherche
    if (this.searchTextDemandes) {
      const term = this.searchTextDemandes.toLowerCase();
      data = data.filter((d) =>
        Object.values(d).some((val) =>
          val?.toString().toLowerCase().includes(term)
        )
      );
    }

    // Tri
    if (this.sortColumnDemandes) {
      data.sort((a, b) => {
        const valA = a[this.sortColumnDemandes] ?? '';
        const valB = b[this.sortColumnDemandes] ?? '';
        if (valA < valB) return this.sortDirectionDemandes === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirectionDemandes === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }

  get pagedDemendeEnAttente() {
    const start = (this.currentPageDemandes - 1) * this.pageSizeDemandes;
    return this.filteredDataDemandes.slice(
      start,
      start + this.pageSizeDemandes
    );
  }

  totalPagesDemandes() {
    return Math.ceil(this.filteredDataDemandes.length / this.pageSizeDemandes);
  }

  startIndexDemandes() {
    return this.filteredDataDemandes.length === 0
      ? 0
      : (this.currentPageDemandes - 1) * this.pageSizeDemandes + 1;
  }

  endIndexDemandes() {
    return Math.min(
      this.currentPageDemandes * this.pageSizeDemandes,
      this.filteredDataDemandes.length
    );
  }

  goToPageDemandes(page: number) {
    if (page >= 1 && page <= this.totalPagesDemandes())
      this.currentPageDemandes = page;
  }

  previousPageDemandes() {
    this.goToPageDemandes(this.currentPageDemandes - 1);
  }
  nextPageDemandes() {
    this.goToPageDemandes(this.currentPageDemandes + 1);
  }

  // Pagination dynamique
  getPagesDemandes(): (number | string)[] {
    const total = this.totalPagesDemandes();
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (total <= maxVisible) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (this.currentPageDemandes <= 3) {
        pages.push(1, 2, 3, 4, 5, '...', total);
      } else if (this.currentPageDemandes >= total - 2) {
        pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(
          1,
          '...',
          this.currentPageDemandes - 1,
          this.currentPageDemandes,
          this.currentPageDemandes + 1,
          '...',
          total
        );
      }
    }
    return pages;
  }

  // Tri par colonne
  sortDemandes(col: string) {
    if (this.sortColumnDemandes === col) {
      this.sortDirectionDemandes =
        this.sortDirectionDemandes === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumnDemandes = col;
      this.sortDirectionDemandes = 'asc';
    }
  }

  exportExcelDemandes() {
    if (this.filteredDataDemandes.length === 0) return;

    // Créer une copie des données et renommer les colonnes pour Excel
    const dataForExcel = this.filteredDataDemandes.map((d) => ({
      Date: new Date(d.BeneficiaryCreatedDate).toLocaleString(), // formater la date
      Nom: d.vcLastName,
      Prénom: d.vcFirstName,
      // Email: d.vcEmail,
      // Type: d.BeneficiaryTypeName,
      // Banque: d.BankName,
      // 'N° Compte': d.vcAccountNumber,
      // Statut: d.vcStatus,
    }));

    // Créer une feuille
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataForExcel);

    // Créer le classeur
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Beneficiaires');

    // Générer le fichier Excel
    XLSX.writeFile(wb, 'beneficiaires.xlsx');
  }

  onPageClickDemandes(page: number | string) {
    if (typeof page === 'number') this.goToPageDemandes(page);
  }

  //Fin de pagination pour demande en attente

  //Debut de pagination pour traite de demandes
  pageSizeTraitedDemandes = 5;
  currentPageTraitedDemandes = 1;
  searchTextTraitedDemandes = '';
  sortColumnTraitedDemandes = '';
  sortDirectionTraitedDemandes: 'asc' | 'desc' = 'asc';

  // Filtrer et trier
  get filteredDataTraitedDemandes() {
    let data = [...this.traitedDemandes];

    // Recherche
    if (this.searchTextTraitedDemandes) {
      const term = this.searchTextTraitedDemandes.toLowerCase();
      data = data.filter((d) =>
        Object.values(d).some((val) =>
          val?.toString().toLowerCase().includes(term)
        )
      );
    }

    // Tri
    if (this.sortColumnTraitedDemandes) {
      data.sort((a, b) => {
        const valA = a[this.sortColumnTraitedDemandes] ?? '';
        const valB = b[this.sortColumnTraitedDemandes] ?? '';
        if (valA < valB)
          return this.sortDirectionTraitedDemandes === 'asc' ? -1 : 1;
        if (valA > valB)
          return this.sortDirectionTraitedDemandes === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }

  get pageTraitedDemandes() {
    const start =
      (this.currentPageTraitedDemandes - 1) * this.pageSizeTraitedDemandes;
    return this.filteredDataTraitedDemandes.slice(
      start,
      start + this.pageSizeTraitedDemandes
    );
  }

  totalPagesTraitedDemandes() {
    return Math.ceil(
      this.filteredDataTraitedDemandes.length / this.pageSizeTraitedDemandes
    );
  }

  startIndexTraitedDemandes() {
    return this.filteredDataTraitedDemandes.length === 0
      ? 0
      : (this.currentPageTraitedDemandes - 1) * this.pageSizeTraitedDemandes +
          1;
  }

  endIndexTraitedDemandes() {
    return Math.min(
      this.currentPageTraitedDemandes * this.pageSizeTraitedDemandes,
      this.filteredDataTraitedDemandes.length
    );
  }

  goToPageTraitedDemandes(page: number) {
    if (page >= 1 && page <= this.totalPagesTraitedDemandes())
      this.currentPageTraitedDemandes = page;
  }

  previousPageTraitedDemandes() {
    this.goToPageTraitedDemandes(this.currentPageTraitedDemandes - 1);
  }
  nextPageTraitedDemandes() {
    this.goToPageTraitedDemandes(this.currentPageTraitedDemandes + 1);
  }

  // Pagination dynamique
  getPagesTraitedDemandes(): (number | string)[] {
    const total = this.totalPagesTraitedDemandes();
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (total <= maxVisible) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (this.currentPageTraitedDemandes <= 3) {
        pages.push(1, 2, 3, 4, 5, '...', total);
      } else if (this.currentPageTraitedDemandes >= total - 2) {
        pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(
          1,
          '...',
          this.currentPageTraitedDemandes - 1,
          this.currentPageTraitedDemandes,
          this.currentPageTraitedDemandes + 1,
          '...',
          total
        );
      }
    }
    return pages;
  }

  // Tri par colonne
  sortTraitedDemandes(col: string) {
    if (this.sortColumnTraitedDemandes === col) {
      this.sortDirectionTraitedDemandes =
        this.sortDirectionTraitedDemandes === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumnTraitedDemandes = col;
      this.sortDirectionTraitedDemandes = 'asc';
    }
  }

  exportExcelTraitedDemandes() {
    if (this.filteredDataTraitedDemandes.length === 0) return;

    // Créer une copie des données et renommer les colonnes pour Excel
    const dataForExcel = this.filteredDataTraitedDemandes.map((d) => ({
      Date: new Date(d.BeneficiaryCreatedDate).toLocaleString(), // formater la date
      Nom: d.vcLastName,
      Prénom: d.vcFirstName,
      // Email: d.vcEmail,
      // Type: d.BeneficiaryTypeName,
      // Banque: d.BankName,
      // 'N° Compte': d.vcAccountNumber,
      // Statut: d.vcStatus,
    }));

    // Créer une feuille
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataForExcel);

    // Créer le classeur
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Beneficiaires');

    // Générer le fichier Excel
    XLSX.writeFile(wb, 'beneficiaires.xlsx');
  }

  onPageClickTraitedDemandes(page: number | string) {
    if (typeof page === 'number') this.goToPageTraitedDemandes(page);
  }

  //Fin de pagination pour traite de demandes




  // dans le composant
  detailBeneficiaire(idDemande: number | string): void {
    console.log('📤 ID Demande reçu :', idDemande);

    if (idDemande === null || idDemande === undefined) {
      console.error('❌ ID manquant, navigation annulée');
      return;
    }

    this.router
      .navigate(['/beneficiairesEnAttente/detail', idDemande])
      .catch((err) => {
        console.error('❌ Erreur lors de la navigation :', err);
      });
  }

  ngOnDestroy(): void {
    this.dtTriggers.forEach((t) => t.unsubscribe());
  }
}
