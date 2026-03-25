import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, Location, NgClass, NgForOf, NgIf } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';
import * as XLSX from 'xlsx';

import type { Config } from 'datatables.net';
import { BeneficiaireEnAttenteService } from '../../servicesNodes/beneficiaireEnAttente/beneficiaire-en-attente.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification/notification.service';

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

  setActiveTab(tabName: string) {
    this.activeTab = tabName;
  }

  isActive(tabName: string) {
    return this.activeTab === tabName;
  }

  // ========================================
  isLoadingDemandes: boolean = false;
  demandes: any[] = [];
  traitedDemandes: any[] = [];
  rejectedDemandes: any[] = [];

  constructor(
    private beneficiaireEnAttente: BeneficiaireEnAttenteService,
    private router: Router,
    private notification: NotificationService,
    private location: Location,
  ) {}

  ngOnInit() {
    this.getUserInfo();
  }

  userInfo: any;
  idOrganisation!: number;

  private getUserInfo(): void {
    const user = localStorage.getItem('userInfo');
    if (user) {
      this.userInfo = JSON.parse(user);
      this.idOrganisation = this.userInfo.iOrganisationID;
      this.loadeDemandeSouscriptions();
      console.log('this.idOrganisation: ', this.idOrganisation);
    }
  }

  private loadeDemandeSouscriptions(): void {
    console.log('📥 Début du chargement des demandes de souscription');
    this.isLoadingDemandes = true;

    this.beneficiaireEnAttente
      .getListeBeneficiaireEnAttente(this.idOrganisation)
      .subscribe({
        next: (res) => {
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

            // console.log(`📊 Total demandes en traitement : ${this.demandes.length}`);
            // console.log(`✅ Total demandes validées : ${this.traitedDemandes.length}`);
            // console.log(`❌ Total demandes rejetées : ${this.rejectedDemandes.length}`);

            this.dtTriggers.forEach((t, index) => {
              console.log(`🔄 Initialisation DataTable #${index + 1}`);
              t.next(null);
            });
          } else {
            console.warn('⚠️ Réponse serveur avec status non 200 :', res);
            if (res?.error?.message === 'Unauthenticated.') {
              console.error('🚨 Session expirée, redirection vers login');
              this.notification.error('Votre session a expirée');
              this.router.navigate(['/login']);
            }
          }
          this.isLoadingDemandes = false;
        },
        error: (err) => {
          this.notification.error('Une erreur interne est survenue.');
          this.isLoadingDemandes = false;
        },
      });
  }

  // ============================================================
  // Helpers pour le template skeleton
  // ============================================================

  /** Retourne un tableau de N éléments pour *ngFor dans le thead/tbody skeleton */
  getSkeletonCols(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  /** Largeurs variées pour que les cellules skeleton paraissent naturelles */
  private widths = ['45%', '60%', '70%', '55%', '75%', '50%', '65%', '40%'];
  getRandomWidth(): string {
    return this.widths[Math.floor(Math.random() * this.widths.length)];
  }

  // ============================================================
  // Pagination — Demandes en attente
  // ============================================================
  pageSizeDemandes = 5;
  currentPageDemandes = 1;
  searchTextDemandes = '';
  sortColumnDemandes = '';
  sortDirectionDemandes: 'asc' | 'desc' = 'asc';

  get filteredDataDemandes() {
    let data = [...this.demandes];
    if (this.searchTextDemandes) {
      const term = this.searchTextDemandes.toLowerCase();
      data = data.filter((d) =>
        Object.values(d).some((val) => val?.toString().toLowerCase().includes(term))
      );
    }
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
    return this.filteredDataDemandes.slice(start, start + this.pageSizeDemandes);
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
    if (page >= 1 && page <= this.totalPagesDemandes()) this.currentPageDemandes = page;
  }

  previousPageDemandes() { this.goToPageDemandes(this.currentPageDemandes - 1); }
  nextPageDemandes() { this.goToPageDemandes(this.currentPageDemandes + 1); }

  getPagesDemandes(): (number | string)[] {
    const total = this.totalPagesDemandes();
    const pages: (number | string)[] = [];
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (this.currentPageDemandes <= 3) {
        pages.push(1, 2, 3, 4, 5, '...', total);
      } else if (this.currentPageDemandes >= total - 2) {
        pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', this.currentPageDemandes - 1, this.currentPageDemandes, this.currentPageDemandes + 1, '...', total);
      }
    }
    return pages;
  }

  sortDemandes(col: string) {
    if (this.sortColumnDemandes === col) {
      this.sortDirectionDemandes = this.sortDirectionDemandes === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumnDemandes = col;
      this.sortDirectionDemandes = 'asc';
    }
  }

  exportExcelDemandes() {
    if (this.filteredDataDemandes.length === 0) return;
    const dataForExcel = this.filteredDataDemandes.map((d) => ({
      Date: new Date(d.BeneficiaryCreatedDate).toLocaleString(),
      Nom: d.vcLastName,
      Prénom: d.vcFirstName,
    }));
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataForExcel);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Beneficiaires');
    XLSX.writeFile(wb, 'beneficiaires.xlsx');
  }

  onPageClickDemandes(page: number | string) {
    if (typeof page === 'number') this.goToPageDemandes(page);
  }

  // ============================================================
  // Pagination — Demandes traitées
  // ============================================================
  pageSizeTraitedDemandes = 5;
  currentPageTraitedDemandes = 1;
  searchTextTraitedDemandes = '';
  sortColumnTraitedDemandes = '';
  sortDirectionTraitedDemandes: 'asc' | 'desc' = 'asc';

  get filteredDataTraitedDemandes() {
    let data = [...this.traitedDemandes];
    if (this.searchTextTraitedDemandes) {
      const term = this.searchTextTraitedDemandes.toLowerCase();
      data = data.filter((d) =>
        Object.values(d).some((val) => val?.toString().toLowerCase().includes(term))
      );
    }
    if (this.sortColumnTraitedDemandes) {
      data.sort((a, b) => {
        const valA = a[this.sortColumnTraitedDemandes] ?? '';
        const valB = b[this.sortColumnTraitedDemandes] ?? '';
        if (valA < valB) return this.sortDirectionTraitedDemandes === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirectionTraitedDemandes === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }

  get pageTraitedDemandes() {
    const start = (this.currentPageTraitedDemandes - 1) * this.pageSizeTraitedDemandes;
    return this.filteredDataTraitedDemandes.slice(start, start + this.pageSizeTraitedDemandes);
  }

  totalPagesTraitedDemandes() {
    return Math.ceil(this.filteredDataTraitedDemandes.length / this.pageSizeTraitedDemandes);
  }

  startIndexTraitedDemandes() {
    return this.filteredDataTraitedDemandes.length === 0
      ? 0
      : (this.currentPageTraitedDemandes - 1) * this.pageSizeTraitedDemandes + 1;
  }

  endIndexTraitedDemandes() {
    return Math.min(
      this.currentPageTraitedDemandes * this.pageSizeTraitedDemandes,
      this.filteredDataTraitedDemandes.length
    );
  }

  goToPageTraitedDemandes(page: number) {
    if (page >= 1 && page <= this.totalPagesTraitedDemandes()) this.currentPageTraitedDemandes = page;
  }

  previousPageTraitedDemandes() { this.goToPageTraitedDemandes(this.currentPageTraitedDemandes - 1); }
  nextPageTraitedDemandes() { this.goToPageTraitedDemandes(this.currentPageTraitedDemandes + 1); }

  getPagesTraitedDemandes(): (number | string)[] {
    const total = this.totalPagesTraitedDemandes();
    const pages: (number | string)[] = [];
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (this.currentPageTraitedDemandes <= 3) {
        pages.push(1, 2, 3, 4, 5, '...', total);
      } else if (this.currentPageTraitedDemandes >= total - 2) {
        pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', this.currentPageTraitedDemandes - 1, this.currentPageTraitedDemandes, this.currentPageTraitedDemandes + 1, '...', total);
      }
    }
    return pages;
  }

  sortTraitedDemandes(col: string) {
    if (this.sortColumnTraitedDemandes === col) {
      this.sortDirectionTraitedDemandes = this.sortDirectionTraitedDemandes === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumnTraitedDemandes = col;
      this.sortDirectionTraitedDemandes = 'asc';
    }
  }

  exportExcelTraitedDemandes() {
    if (this.filteredDataTraitedDemandes.length === 0) return;
    const dataForExcel = this.filteredDataTraitedDemandes.map((d) => ({
      Date: new Date(d.BeneficiaryCreatedDate).toLocaleString(),
      Nom: d.vcLastName,
      Prénom: d.vcFirstName,
    }));
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataForExcel);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Beneficiaires');
    XLSX.writeFile(wb, 'beneficiaires.xlsx');
  }

  onPageClickTraitedDemandes(page: number | string) {
    if (typeof page === 'number') this.goToPageTraitedDemandes(page);
  }

  // ============================================================
  // Pagination — Demandes rejetées
  // ============================================================
  pageSizeRejectedDemandes = 5;
  currentPageRejectedDemandes = 1;
  searchTextRejectedDemandes = '';
  sortColumnRejectedDemandes = '';
  sortDirectionRejectedDemandes: 'asc' | 'desc' = 'asc';

  get filteredDataRejectedDemandes() {
    let data = [...this.rejectedDemandes];
    if (this.searchTextRejectedDemandes) {
      const term = this.searchTextRejectedDemandes.toLowerCase();
      data = data.filter((d) =>
        Object.values(d).some((val) => val?.toString().toLowerCase().includes(term))
      );
    }
    if (this.sortColumnRejectedDemandes) {
      data.sort((a, b) => {
        const valA = a[this.sortColumnRejectedDemandes] ?? '';
        const valB = b[this.sortColumnRejectedDemandes] ?? '';
        if (valA < valB) return this.sortDirectionRejectedDemandes === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirectionRejectedDemandes === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }

  get pageRejectedDemandes() {
    const start = (this.currentPageRejectedDemandes - 1) * this.pageSizeRejectedDemandes;
    return this.filteredDataRejectedDemandes.slice(start, start + this.pageSizeRejectedDemandes);
  }

  totalPagesRejectedDemandes() {
    return Math.ceil(this.filteredDataRejectedDemandes.length / this.pageSizeRejectedDemandes);
  }

  startIndexRejectedDemandes() {
    return this.filteredDataRejectedDemandes.length === 0
      ? 0
      : (this.currentPageRejectedDemandes - 1) * this.pageSizeRejectedDemandes + 1;
  }

  endIndexRejectedDemandes() {
    return Math.min(
      this.currentPageRejectedDemandes * this.pageSizeRejectedDemandes,
      this.filteredDataRejectedDemandes.length
    );
  }

  goToPageRejectedDemandes(page: number) {
    if (page >= 1 && page <= this.totalPagesRejectedDemandes()) this.currentPageRejectedDemandes = page;
  }

  previousPageRejectedDemandes() { this.goToPageRejectedDemandes(this.currentPageRejectedDemandes - 1); }
  nextPageRejectedDemandes() { this.goToPageRejectedDemandes(this.currentPageRejectedDemandes + 1); }

  getPagesRejectedDemandes(): (number | string)[] {
    const total = this.totalPagesRejectedDemandes();
    const pages: (number | string)[] = [];
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (this.currentPageRejectedDemandes <= 3) {
        pages.push(1, 2, 3, 4, 5, '...', total);
      } else if (this.currentPageRejectedDemandes >= total - 2) {
        pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', this.currentPageRejectedDemandes - 1, this.currentPageRejectedDemandes, this.currentPageRejectedDemandes + 1, '...', total);
      }
    }
    return pages;
  }

  sortRejectedDemandes(col: string) {
    if (this.sortColumnRejectedDemandes === col) {
      this.sortDirectionRejectedDemandes = this.sortDirectionRejectedDemandes === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumnRejectedDemandes = col;
      this.sortDirectionRejectedDemandes = 'asc';
    }
  }

  exportExcelRejectedDemandes() {
    if (this.filteredDataRejectedDemandes.length === 0) return;
    const dataForExcel = this.filteredDataRejectedDemandes.map((d) => ({
      Date: new Date(d.BeneficiaryCreatedDate).toLocaleString(),
      Nom: d.vcLastName,
      Prénom: d.vcFirstName,
    }));
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataForExcel);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Beneficiaires');
    XLSX.writeFile(wb, 'beneficiaires.xlsx');
  }

  onPageClickRejectedDemandes(page: number | string) {
    if (typeof page === 'number') this.goToPageRejectedDemandes(page);
  }

  // ============================================================
  // Navigation
  // ============================================================
  detailBeneficiaire(idDemande: number | string): void {
    console.log('📤 ID Demande reçu :', idDemande);
    if (idDemande === null || idDemande === undefined) {
      console.error('❌ ID manquant, navigation annulée');
      return;
    }
    this.router.navigate(['/beneficiairesEnAttente/detail', idDemande]).catch((err) => {
      console.error('❌ Erreur lors de la navigation :', err);
    });
  }
  
  goBack(): void {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.dtTriggers.forEach((t) => t.unsubscribe());
  }
}