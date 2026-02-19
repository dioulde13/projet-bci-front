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
  FormArray,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { BeneficiaireService } from '../../services/beneficiaire/beneficiaire.service';
import { BeneficiaireNodeService } from '../../servicesNodes/beneficiaireNode/beneficiaire-node.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { OnlyNumbersDirective } from '../onlyNumbers/only-numbers.pipe';

@Component({
  selector: 'app-liste-des-beneficiaire',
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    OnlyNumbersDirective,
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
  idOrganisation!: number;

  formBeneficiaire!: FormGroup;

  listeTypePaiement: any[] = [];
  listePays: any[] = [];
  listeBanques: any[] = [];
  listeTypeBeneficiaire: any[] = [];

  @ViewChild('datepickerInput', { static: false }) datepickerInput?: ElementRef;
  calendarInstance: any;

  // OTP inputs
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  constructor(
    private fb: FormBuilder,
    private beneficiaireService: BeneficiaireService,
    private beneficiaireNodeService: BeneficiaireNodeService,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getUserInfo();
    this.initForm();
    this.loadTypeBeneficiaires();
    this.loadTypePaiements();
    this.listPays();
    this.listeDesBanques();
    this.getListeBeneficiaire();
  }

  lodingFetch: boolean = false;

  listeBeneficiaire: any[] = [];

  getListeBeneficiaire(): void {
    this.lodingFetch = true;
    this.beneficiaireService
      .getListeBeneficiaire(Number(this.idOrganisation))
      .subscribe({
        next: (response: any) => {
          this.listeBeneficiaire = response?.data ?? [];
          this.lodingFetch = false;
          console.log('liste beneficiaire :', this.listeBeneficiaire);
        },
        error: (err) => {
          this.lodingFetch = false;
          console.error('Erreur lors du chargement des bénéficiaires :', err);
        },
      });
  }

  pageSize = 5;
  currentPage = 1;
  searchText = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedBeneficiaryType = '';

  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedBeneficiaryType = value;
    console.log('value: ', value);
  }

  // Filtrer et trier
  get filteredData() {
    let data = [...this.listeBeneficiaire];

    // Recherche
    if (this.searchText) {
      const term = this.searchText.toLowerCase();
      data = data.filter((d) =>
        Object.values(d).some((val) =>
          val?.toString().toLowerCase().includes(term),
        ),
      );
    }

    // 🎯 Filtre par type
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

  get pagedBeneficiaire() {
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
      Date: new Date(d.BeneficiaryCreatedDate).toLocaleString(), // formater la date
      Nom: d.vcLastName,
      Prénom: d.vcFirstName,
      Email: d.vcEmail,
      Type: d.BeneficiaryTypeName,
      Banque: d.BankName,
      'N° Compte': d.vcAccountNumber,
      Statut: d.vcStatus,
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

    const doc = new jsPDF('l', 'mm', 'a4'); // paysage pour plus de place

    doc.setFontSize(14);
    doc.text('Liste des bénéficiaires', 14, 15);

    const tableColumn = [
      'Date',
      'Nom',
      'Prénom',
      'Email',
      'Type',
      'Banque',
      'N° Compte',
      'Statut',
    ];

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
      styles: {
        fontSize: 8,
      },
      headStyles: {
        fillColor: [40, 167, 69], // vert Bootstrap (optionnel)
      },
    });

    doc.save('beneficiaires.pdf');
  }

  /** Chargement type bénéficiaire */
  private loadTypeBeneficiaires(): void {
    this.beneficiaireService.getListeTypeBeneficiaire().subscribe({
      next: (res) => (this.listeTypeBeneficiaire = res.data),
      error: (err) => console.error('Erreur type bénéficiaire', err),
    });
  }

  onPageClick(page: number | string) {
    if (typeof page === 'number') this.goToPage(page);
  }

  // dans le composant
  modifierBeneficiaire(id: string | number) {
    console.log('ID reçu :', id);

    if (!id) {
      console.error('ID manquant, navigation annulée');
      return;
    }

    const numericId = Number(id);
    if (isNaN(numericId)) {
      console.error('ID invalide, navigation annulée');
      return;
    }

    this.router
      .navigate(['/beneficiaires/modifier', numericId])
      .then((success) => console.log('Navigation réussie :', success))
      .catch((err) => console.error('Erreur navigation :', err));
  }

  transfererBeneficiaire(benefice: any): void {
    console.log('Transférer :', benefice);
    // ouvrir modal de transfert ou déclencher l'action
  }

  ngAfterViewInit() {
    if (this.datepickerInput) {
      this.calendarInstance = flatpickr(this.datepickerInput.nativeElement, {
        locale: French,
      });
    }
  }

  openCalendar() {
    this.calendarInstance?.open();
  }

  /** Initialisation du formulaire */
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

  onBanqueChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;

    const banqueSelectionnee = this.listeBanques.find(
      (banque: any) => banque.vcName === selectedValue,
    );

    if (banqueSelectionnee) {
      console.log('Nom banque:', banqueSelectionnee.vcName);
      console.log('BIC:', banqueSelectionnee.vcBIC);

      // Exemple : remplir automatiquement le champ bicCode
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

    if (value === '4') {
      this.f['banqueBeneficiaireInternational'].setValidators([Validators.required]);
      this.f['numeroCompteInternational'].setValidators([Validators.required]);
      this.f['vcNomCompteInternational'].setValidators([Validators.required]);
    }

    if (value === '3') {
      this.f['numeroMobile'].setValidators([
        Validators.required,
      ]);
      this.f['vcNomCompteMobile'].setValidators([Validators.required]);
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

  get f() {
    return this.formBeneficiaire.controls;
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Supprime tout ce qui n'est pas chiffre
    input.value = input.value.replace(/[^0-9]/g, '');
    // Met à jour le formControl
    this.formBeneficiaire
      .get('telephone')
      ?.setValue(input.value, { emitEvent: false });
  }

  showAjoutBeneficiaireModal: boolean = false;

  openAjoutModalBeneficiaire() {
    this.showAjoutBeneficiaireModal = true;
  }

  closeModalBeneficiaire() {
    this.showAjoutBeneficiaireModal = false;
    this.resetFormulaire();
  }

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isLoading: boolean = false;

  private resetFormulaire(): void {
    this.submitted = false;
    this.selectedTypePaiementId = null;

    // Reset complet du formulaire
    this.formBeneficiaire.reset();

    // On retire aussi les validators de paiement
    this.clearPaymentValidators();

    // Remet à zéro tous les champs
    Object.keys(this.f).forEach((key) => {
      this.f[key].setErrors(null);
      this.f[key].markAsPristine();
      this.f[key].markAsUntouched();
    });
  }

  submit(): void {
    this.isLoading = true;
    this.submitted = true;

    // ─── 1. Validation des champs de base obligatoires ───────────────────────
    const champsBase = [
      'nom', 'prenom', 'telephone', 'email', 'date',
      'ville', 'pays', 'adresse', 'vcTypePaiement',
      'typeBeneficiaire', 'vcCurrency',
    ];

    const champsBaseInvalides = champsBase.some((key) => this.f[key]?.invalid);

    if (champsBaseInvalides) {
      // this.toastr.error('⚠️ Veuillez remplir tous les champs personnels obligatoires', '', {
      //   positionClass: 'toast-custom-center',
      // });
      this.formBeneficiaire.markAllAsTouched();
      this.isLoading = false;
      return;
    }

    // ─── 2. Un type de paiement doit être sélectionné ────────────────────────
    if (!this.selectedTypePaiementId) {
      this.toastr.error('⚠️ Veuillez sélectionner un type de paiement', '', {
        positionClass: 'toast-custom-center',
      });
      this.isLoading = false;
      return;
    }

    // ─── 3. Validation des champs selon le type de paiement ──────────────────

    // Type 1 : OTP (BCI)
    if (this.selectedTypePaiementId === '1') {
      const champsOtp = ['vcNumeroCompteOtp', 'vcNomCompteOtp'];
      const invalide = champsOtp.some((key) => !this.f[key]?.value?.toString().trim());
      if (invalide) {
        // this.toastr.error('⚠️ Veuillez renseigner le numéro et le nom du compte OTP', '', {
        //   positionClass: 'toast-custom-center',
        // });
        this.formBeneficiaire.markAllAsTouched();
        this.isLoading = false;
        return;
      }
    }

    // Type 2 : Banque locale
    if (this.selectedTypePaiementId === '2') {
      const champsBanque = ['banqueBeneficiaire', 'numeroCompte', 'vcNomCompte'];
      const invalide = champsBanque.some((key) => !this.f[key]?.value?.toString().trim());
      if (invalide) {
        // this.toastr.error('⚠️ Veuillez renseigner la banque, le numéro et le nom du compte', '', {
        //   positionClass: 'toast-custom-center',
        // });
        this.formBeneficiaire.markAllAsTouched();
        this.isLoading = false;
        return;
      }
    }

    // Type 3 : Mobile Money
    if (this.selectedTypePaiementId === '3') {
      const champsMobile = ['numeroMobile', 'vcNomCompteMobile'];
      const invalide = champsMobile.some((key) => !this.f[key]?.value?.toString().trim());
      if (invalide) {
        // this.toastr.error('⚠️ Veuillez renseigner le numéro mobile et sélectionner l\'opérateur', '', {
        //   positionClass: 'toast-custom-center',
        // });
        this.formBeneficiaire.markAllAsTouched();
        this.isLoading = false;
        return;
      }
    }

    // Type 4 : Banque internationale
    if (this.selectedTypePaiementId === '4') {
      const champsInternational = [
        'banqueBeneficiaireInternational',
        'numeroCompteInternational',
        'vcNomCompteInternational',
      ];
      const invalide = champsInternational.some((key) => !this.f[key]?.value?.toString().trim());
      if (invalide) {
        // this.toastr.error('⚠️ Veuillez renseigner la banque, le numéro et le nom du compte international', '', {
        //   positionClass: 'toast-custom-center',
        // });
        this.formBeneficiaire.markAllAsTouched();
        this.isLoading = false;
        return;
      }
    }

    // ─── 4. Photo obligatoire ─────────────────────────────────────────────────
    if (!this.selectedFile) {
      this.toastr.error('📷 Aucune photo sélectionnée', '', {
        positionClass: 'toast-custom-center',
      });
      this.isLoading = false;
      return;
    }

    // ─── 5. Construction du FormData ─────────────────────────────────────────
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

      // Type de paiement
      if (this.selectedTypePaiementId === '1') {
        formData.append('vcNomCompte', formValue.vcNomCompteOtp);
        formData.append('vcAccountNumber', formValue.vcNumeroCompteOtp);
        formData.append('vcBanque', 'BCI');
        formData.append('bicCode', 'COLIGNGNXXX');
      } else if (this.selectedTypePaiementId === '2') {
        console.log('🏦 Paiement Type 2 (Banque)');
        formData.append('vcBanque', String(formValue.banqueBeneficiaire));
        formData.append('vcAccountNumber', formValue.numeroCompte);
        formData.append('vcNomCompte', formValue.vcNomCompte);
        formData.append('bicCode', formValue.bicCode);
      } else if (this.selectedTypePaiementId === '3') {
        console.log('📱 Paiement Type 3 (Mobile)');
        formData.append('vcAccountNumber', formValue.numeroMobile);
        formData.append('vcNomCompte', formValue.vcNomCompteMobile);
        formData.append('vcBanque', formValue.vcNomCompteMobile);
      } else if (this.selectedTypePaiementId === '4') {
        console.log('🌍 Paiement Type 4 (International)');
        formData.append('vcBanque', String(formValue.banqueBeneficiaireInternational));
        formData.append('vcAccountNumber', formValue.numeroCompteInternational);
        formData.append('vcNomCompte', formValue.vcNomCompteInternational);
        formData.append('bicCode', formValue.bicCodeInternational);
      }

      formData.append('vcPhoto', this.selectedFile, this.selectedFile.name);

      formData.forEach((value, key) => console.log(key, value));
    } catch (e) {
      this.isLoading = false;
      console.error('Erreur lors de la préparation des données', e);
      return;
    }

    // ─── 6. Appel API ─────────────────────────────────────────────────────────
    this.beneficiaireService.ajouterBeneficiaire(formData).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status === 200) {
          this.toastr.success(res.message, '', {
            positionClass: 'toast-custom-center',
          });

          this.resetFormulaire();

          this.selectedFile = null;
          this.photoPreview = null;

          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }

          this.getListeBeneficiaire();
          this.showAjoutBeneficiaireModal = false;
        } else {
          this.toastr.error(res.message, '', {
            positionClass: 'toast-custom-center',
          });
        }
      },

      error: (err) => {
        this.isLoading = false;
        console.error('Erreur ❌ API', err);
      },
    });
  }

  /** Récupération infos utilisateur */
  private getUserInfo(): void {
    const user = localStorage.getItem('userInfo');
    if (user) {
      this.userInfo = JSON.parse(user);
      this.idOrganisation = this.userInfo.iOrganisationID;
      console.log('this.idOrganisation: ', this.idOrganisation);
    }
  }

  private listeDesBanques(): void {
    this.beneficiaireNodeService.getListeBanque().subscribe({
      next: (res) => {
        console.log('Réponse API liste des banques :', res);
        console.log('Données result :', res.data);

        this.listeBanques = res.data;
        console.log('listeBanques après affectation :', this.listeBanques);
      },
      error: (err) => {
        console.error('Erreur de la récupération des banques :', err);
      },
      complete: () => {
        console.log('Récupération de la liste des banques terminée');
      },
    });
  }

  /** Chargement type paiement */
  private loadTypePaiements(): void {
    this.beneficiaireService.getListeTypePaiement().subscribe({
      next: (res) => (this.listeTypePaiement = res.data),
      error: (err) => console.error('Erreur type paiement', err),
    });
  }

  private listPays(): void {
    this.beneficiaireService.getCurrency().subscribe({
      next: (res) => (this.listePays = res.data),
      error: (err) =>
        console.error('Erreur lors de la recupration du curent', err),
    });
  }

  /** Gestion fichier */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => (this.photoPreview = reader.result);
      reader.readAsDataURL(this.selectedFile);
    }
  }
}