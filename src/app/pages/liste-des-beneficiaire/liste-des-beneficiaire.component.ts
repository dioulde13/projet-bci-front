import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  OnInit,
} from '@angular/core';
import flatpickr from 'flatpickr';
import { French } from 'flatpickr/dist/l10n/fr.js';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BeneficiaireService } from '../../services/beneficiaire/beneficiaire.service';
import { BeneficiaireNodeService } from '../../servicesNodes/beneficiaireNode/beneficiaire-node.service';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../services/notification/notification.service';

@Component({
  selector: 'app-liste-des-beneficiaire',
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
  ],
  templateUrl: './liste-des-beneficiaire.component.html',
  styleUrl: './liste-des-beneficiaire.component.css',
  standalone: true,
})
export class ListeDesBeneficiaireComponent implements AfterViewInit, OnInit {

  submitted = false;
  selectedTypePaiementId: string | null = null;
  selectedFile: File | null = null;
  photoPreview: string | ArrayBuffer | null = null;
  userInfo: any;
  infosUser: any;
  idOrganisation!: number;
  userRoleId: string | number | null = null;

  formBeneficiaire!: FormGroup;

  listeTypePaiement: any[] = [];
  listePays: any[] = [];
  listeBanques: any[] = [];
  listeTypeBeneficiaire: any[] = [];
  listeBeneficiaire: any[] = [];

  lodingFetch = false;
  isLoading = false;
  showAjoutBeneficiaireModal = false;

  // Tableau / filtres
  pageSize = 5;
  currentPage = 1;
  searchText = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  // ✅ CORRECTION : utilisé directement par [(ngModel)] dans le template
  selectedBeneficiaryType = '';

  @ViewChild('datepickerInput', { static: false }) datepickerInput?: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  calendarInstance: any;

  constructor(
    private fb: FormBuilder,
    private beneficiaireService: BeneficiaireService,
    private beneficiaireNodeService: BeneficiaireNodeService,
    private router: Router,
    private notification: NotificationService,
  ) { }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const userJson = localStorage.getItem('userInfo');
    if (userJson) {
      try {
        this.infosUser = JSON.parse(userJson);
        this.userRoleId = this.infosUser?.iRoleID;
      } catch {
        this.infosUser = null;
      }
    }

    this.getUserInfo();
    this.initForm();
    this.loadTypeBeneficiaires();
    this.loadTypePaiements();
    this.listPays();
    this.listeDesBanques();
    this.getListeBeneficiaire();
  }

  ngAfterViewInit(): void {
    if (this.datepickerInput) {
      this.calendarInstance = flatpickr(this.datepickerInput.nativeElement, {
        locale: French,
      });
    }
  }

  // ─── Données ──────────────────────────────────────────────────────────────

  getListeBeneficiaire(): void {
    this.lodingFetch = true;
    this.beneficiaireService
      .getListeBeneficiaire(Number(this.idOrganisation))
      .subscribe({
        next: (response: any) => {
          this.listeBeneficiaire = response?.data ?? [];
          this.lodingFetch = false;
        },
        error: (err) => {
          this.lodingFetch = false;
          console.error('Erreur lors du chargement des bénéficiaires :', err);
        },
      });
  }

  private loadTypeBeneficiaires(): void {
    this.beneficiaireService.getListeTypeBeneficiaire().subscribe({
      next: (res) => (this.listeTypeBeneficiaire = res.data),
      error: (err) => console.error('Erreur type bénéficiaire', err),
    });
  }

  private loadTypePaiements(): void {
    this.beneficiaireService.getListeTypePaiement().subscribe({
      next: (res) => (this.listeTypePaiement = res.data),
      error: (err) => console.error('Erreur type paiement', err),
    });
  }

  private listPays(): void {
    this.beneficiaireService.getCurrency().subscribe({
      next: (res) => (this.listePays = res.data),
      error: (err) => console.error('Erreur récupération devise', err),
    });
  }

  private listeDesBanques(): void {
    this.beneficiaireNodeService.getListeBanque().subscribe({
      next: (res) => (this.listeBanques = res.data),
      error: (err) => console.error('Erreur récupération banques :', err),
    });
  }

  private getUserInfo(): void {
    const user = localStorage.getItem('userInfo');
    if (user) {
      this.userInfo = JSON.parse(user);
      this.idOrganisation = this.userInfo.iOrganisationID;
    }
  }

  // ─── Tableau : filtres, tri, pagination ──────────────────────────────────

  get filteredData(): any[] {
    let data = [...this.listeBeneficiaire];

    // Recherche textuelle
    if (this.searchText) {
      const term = this.searchText.toLowerCase();
      data = data.filter((d) =>
        Object.values(d).some((val) =>
          val?.toString().toLowerCase().includes(term),
        ),
      );
    }

    // Filtre par type de bénéficiaire
    if (this.selectedBeneficiaryType) {
      data = data.filter(
        (d) => d.BeneficiaryTypeName === this.selectedBeneficiaryType,
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

  get pagedBeneficiaire(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  totalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  startIndex(): number {
    return this.filteredData.length === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredData.length);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage = page;
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  onPageClick(page: number | string): void {
    if (typeof page === 'number') this.goToPage(page);
  }

  getPages(): (number | string)[] {
    const total = this.totalPages();
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (total <= maxVisible) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else if (this.currentPage <= 3) {
      pages.push(1, 2, 3, 4, 5, '...', total);
    } else if (this.currentPage >= total - 2) {
      pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
    } else {
      pages.push(
        1, '...',
        this.currentPage - 1,
        this.currentPage,
        this.currentPage + 1,
        '...', total,
      );
    }
    return pages;
  }

  sort(col: string): void {
    if (this.sortColumn === col) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = col;
      this.sortDirection = 'asc';
    }
  }

  // ─── Export ───────────────────────────────────────────────────────────────

  exportExcel(): void {
    if (this.filteredData.length === 0) return;

    const dataForExcel = this.filteredData.map((d) => ({
      Date: new Date(d.BeneficiaryCreatedDate).toLocaleString(),
      Nom: d.vcLastName,
      Prénom: d.vcFirstName,
      Email: d.vcEmail,
      Type: d.BeneficiaryTypeName,
      Banque: d.BankName,
      'N° Compte': d.vcAccountNumber,
      Statut: d.vcStatus,
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataForExcel);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Beneficiaires');
    XLSX.writeFile(wb, 'beneficiaires.xlsx');
  }

  exportPdf(): void {
    if (this.filteredData.length === 0) return;

    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(14);
    doc.text('Liste des bénéficiaires', 14, 15);

    const tableColumn = ['Date', 'Nom', 'Prénom', 'Email', 'Type', 'Banque', 'N° Compte', 'Statut'];
    const tableRows = this.filteredData.map((d) => [
      new Date(d.BeneficiaryCreatedDate).toLocaleString(),
      d.vcLastName,
      d.vcFirstName,
      d.vcEmail,
      d.BeneficiaryTypeName,
      d.BankName,
      d.vcAccountNumber,
      d.vcStatus,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [40, 167, 69] },
    });

    doc.save('beneficiaires.pdf');
  }

  // ─── Navigation ───────────────────────────────────────────────────────────

  modifierBeneficiaire(id: string | number): void {
    if (!id) return;
    const numericId = Number(id);
    if (isNaN(numericId)) return;
    this.router.navigate(['/beneficiaires/modifier', numericId]);
  }

  // ─── Modal ────────────────────────────────────────────────────────────────

  openAjoutModalBeneficiaire(): void {
    this.showAjoutBeneficiaireModal = true;
  }

  closeModalBeneficiaire(): void {
    this.showAjoutBeneficiaireModal = false;
    this.resetFormulaire();
  }

  openCalendar(): void {
    this.calendarInstance?.open();
  }

  // ─── Formulaire ───────────────────────────────────────────────────────────

  private initForm(): void {
    this.formBeneficiaire = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      email: ['', [Validators.required, Validators.email]],
      date: ['', Validators.required],
      ville: ['', Validators.required],
      pays: ['', Validators.required],
      adresse: ['', Validators.required],

      vcTypePaiement: ['', Validators.required],
      typeBeneficiaire: ['', Validators.required],
      vcCurrency: ['', Validators.required],

      banqueBeneficiaire: [''],
      numeroCompte: [''],
      vcNomCompte: [''],
      bicCode: [''],

      banqueBeneficiaireInternational: [''],
      numeroCompteInternational: [''],
      vcNomCompteInternational: [''],
      bicCodeInternational: [''],

      numeroMobile: [''],
      vcNomCompteMobile: [''],

      vcNomCompteOtp: [''],
      vcNumeroCompteOtp: [''],
    });
  }

  get f() {
    return this.formBeneficiaire.controls;
  }

  private resetFormulaire(): void {
    this.submitted = false;
    this.selectedTypePaiementId = null;
    this.formBeneficiaire.reset();
    this.clearPaymentValidators();
    Object.keys(this.f).forEach((key) => {
      this.f[key].setErrors(null);
      this.f[key].markAsPristine();
      this.f[key].markAsUntouched();
    });
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.formBeneficiaire.get('telephone')?.setValue(input.value, { emitEvent: false });
  }

  onBanqueChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    const banqueSelectionnee = this.listeBanques.find(
      (banque: any) => banque.vcName === selectedValue,
    );
    if (banqueSelectionnee) {
      this.formBeneficiaire.patchValue({
        bicCode: banqueSelectionnee.vcBIC,
        bicCodeInternational: banqueSelectionnee.vcBIC,
      });
    }
  }

  onTypePaiementChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedTypePaiementId = value;
    this.clearPaymentValidators();

    if (value === '1') {
      this.f['vcNumeroCompteOtp'].setValidators([Validators.required]);
      this.f['vcNomCompteOtp'].setValidators([Validators.required]);
    }
    if (value === '2') {
      this.f['banqueBeneficiaire'].setValidators([Validators.required]);
      this.f['numeroCompte'].setValidators([Validators.required]);
      this.f['vcNomCompte'].setValidators([Validators.required]);
    }
    if (value === '3') {
      this.f['numeroMobile'].setValidators([Validators.required]);
      this.f['vcNomCompteMobile'].setValidators([Validators.required]);
    }
    if (value === '4') {
      this.f['banqueBeneficiaireInternational'].setValidators([Validators.required]);
      this.f['numeroCompteInternational'].setValidators([Validators.required]);
      this.f['vcNomCompteInternational'].setValidators([Validators.required]);
    }

    Object.keys(this.f).forEach((key) =>
      this.f[key].updateValueAndValidity({ emitEvent: false }),
    );
  }

  private clearPaymentValidators(): void {
    [
      'banqueBeneficiaire',
      'banqueBeneficiaireInternational',
      'numeroCompte',
      'vcNomCompte',
      'vcNomCompteOtp',
      'vcNumeroCompteOtp',
      'numeroMobile',
      'vcNomCompteMobile',
    ].forEach((field) => {
      this.f[field].clearValidators();
      this.f[field].setValue('');
      this.f[field].updateValueAndValidity({ emitEvent: false });
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => (this.photoPreview = reader.result);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // ─── Soumission ───────────────────────────────────────────────────────────

  submit(): void {
    this.isLoading = true;
    this.submitted = true;

    // 1. Champs de base
    const champsBase = [
      'nom', 'prenom', 'telephone', 'email', 'date',
      'ville', 'pays', 'adresse', 'vcTypePaiement',
      'typeBeneficiaire', 'vcCurrency',
    ];
    if (champsBase.some((key) => this.f[key]?.invalid)) {
      this.formBeneficiaire.markAllAsTouched();
      this.isLoading = false;
      return;
    }

    // 2. Type de paiement
    if (!this.selectedTypePaiementId) {
      this.notification.error('⚠️ Veuillez sélectionner un type de paiement');
      this.isLoading = false;
      return;
    }

    // 3. Champs selon le type
    const validationMap: Record<string, string[]> = {
      '1': ['vcNumeroCompteOtp', 'vcNomCompteOtp'],
      '2': ['banqueBeneficiaire', 'numeroCompte', 'vcNomCompte'],
      '3': ['numeroMobile', 'vcNomCompteMobile'],
      '4': ['banqueBeneficiaireInternational', 'numeroCompteInternational', 'vcNomCompteInternational'],
    };
    const champs = validationMap[this.selectedTypePaiementId] ?? [];
    if (champs.some((key) => !this.f[key]?.value?.toString().trim())) {
      this.formBeneficiaire.markAllAsTouched();
      this.isLoading = false;
      return;
    }

    // 4. Photo
    if (!this.selectedFile) {
      this.notification.error('📷 Aucune photo sélectionnée');
      this.isLoading = false;
      return;
    }

    // 5. Construction FormData
    const formValue = this.formBeneficiaire.value;
    const formData = new FormData();

    try {
      formData.append('vcFirstName', formValue.prenom);
      formData.append('vcLastName', formValue.nom);
      formData.append('vcPhoneNumber', formValue.telephone);
      formData.append('vcCity', formValue.ville);
      formData.append('vcCountry', formValue.pays);
      formData.append('vcAddress', formValue.adresse);
      formData.append('dtBirthDate', formValue.date);
      formData.append('vcEmail', formValue.email);
      formData.append('idTypePaiement', formValue.vcTypePaiement);
      formData.append('iOrganisationID', String(this.idOrganisation));
      formData.append('iBeneficiaryTypeID', String(formValue.typeBeneficiaire));
      formData.append('vcCurrency', String(formValue.vcCurrency));

      if (this.selectedTypePaiementId === '1') {
        formData.append('vcNomCompte', formValue.vcNomCompteOtp);
        formData.append('vcAccountNumber', formValue.vcNumeroCompteOtp);
        formData.append('vcBanque', 'BCI');
        formData.append('bicCode', 'COLIGNGNXXX');
      } else if (this.selectedTypePaiementId === '2') {
        formData.append('vcBanque', String(formValue.banqueBeneficiaire));
        formData.append('vcAccountNumber', formValue.numeroCompte);
        formData.append('vcNomCompte', formValue.vcNomCompte);
        formData.append('bicCode', formValue.bicCode);
      } else if (this.selectedTypePaiementId === '3') {
        formData.append('vcAccountNumber', formValue.numeroMobile);
        formData.append('vcNomCompte', formValue.vcNomCompteMobile);
        formData.append('vcBanque', formValue.vcNomCompteMobile);
      } else if (this.selectedTypePaiementId === '4') {
        formData.append('vcBanque', String(formValue.banqueBeneficiaireInternational));
        formData.append('vcAccountNumber', formValue.numeroCompteInternational);
        formData.append('vcNomCompte', formValue.vcNomCompteInternational);
        formData.append('bicCode', formValue.bicCodeInternational);
      }

      formData.append('vcPhoto', this.selectedFile, this.selectedFile.name);
    } catch (e) {
      this.isLoading = false;
      console.error('Erreur lors de la préparation des données', e);
      return;
    }

    // 6. Appel API
    this.beneficiaireService.ajouterBeneficiaire(formData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status === 200) {
          this.notification.success(res.message);
          this.resetFormulaire();
          this.selectedFile = null;
          this.photoPreview = null;
          if (this.fileInput) this.fileInput.nativeElement.value = '';
          this.getListeBeneficiaire();
          this.showAjoutBeneficiaireModal = false;
        } else {
          this.notification.error(res.message);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erreur API', err);
      },
    });
  }

  // ─── Skeleton helpers ─────────────────────────────────────────────────────

  getSkeletonCols(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  private widths = ['45%', '60%', '70%', '55%', '75%', '50%', '65%', '40%'];
  getRandomWidth(): string {
    return this.widths[Math.floor(Math.random() * this.widths.length)];
  }
}