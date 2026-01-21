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
    private router: Router
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
    this.beneficiaireService.getListeBeneficiaire(Number(this.idOrganisation)).subscribe({
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

  // Filtrer et trier
  get filteredData() {
    let data = [...this.listeBeneficiaire];

    // Recherche
    if (this.searchText) {
      const term = this.searchText.toLowerCase();
      data = data.filter((d) =>
        Object.values(d).some((val) =>
          val?.toString().toLowerCase().includes(term)
        )
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
          total
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
    // ouvrir modal de transfert ou déclencher l’action
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

      numeroMobile: [''],
      vcNomCompteMobile: [''],

      vcNomCompteOtp: [''],

      otp: this.fb.array(Array(18).fill('').map(() => this.fb.control(''))),
    });
  }

  onTypePaiementChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedTypePaiementId = value;

    this.clearPaymentValidators();

    if (value === '1') {
      this.f['vcNomCompteOtp'].setValidators([Validators.required]);

      this.otp.controls.forEach((ctrl) => {
        ctrl.setValidators([
          Validators.required,
          Validators.pattern('^[0-9]$'),
        ]);
        ctrl.updateValueAndValidity({ emitEvent: false });
      });
    }

    if (value === '2') {
      this.f['banqueBeneficiaire'].setValidators([Validators.required]);
      this.f['numeroCompte'].setValidators([
        Validators.required,
        Validators.pattern('^[0-9]+$'),
      ]);
      this.f['vcNomCompte'].setValidators([Validators.required]);
    }

    if (value === '3') {
      this.f['numeroMobile'].setValidators([
        Validators.required,
        Validators.pattern('^[0-9]{8,15}$'),
      ]);
      this.f['vcNomCompteMobile'].setValidators([Validators.required]);
    }

    Object.keys(this.f).forEach((key) =>
      this.f[key].updateValueAndValidity({ emitEvent: false })
    );
  }

  private clearPaymentValidators(): void {
    [
      'banqueBeneficiaire',
      'numeroCompte',
      'vcNomCompte',
      'vcNomCompteOtp',
      'numeroMobile',
      'vcNomCompteMobile',
    ].forEach((field) => {
      this.f[field].clearValidators();
      this.f[field].setValue('');
      this.f[field].updateValueAndValidity({ emitEvent: false });
    });

    this.otp.controls.forEach((ctrl) => {
      ctrl.clearValidators();
      ctrl.setValue('');
      ctrl.updateValueAndValidity({ emitEvent: false });
    });
  }

  get otp(): FormArray {
    return this.formBeneficiaire.get('otp') as FormArray;
  }

  get otpControls(): FormControl[] {
    return this.otp.controls as FormControl[];
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

  /** Gestion du type de paiement */

  /** Supprimer les validators dynamiques */
  // private clearPaymentValidators(): void {
  //   // Paiement bancaire
  //   [
  //     'banqueBeneficiaire',
  //     'numeroCompte',
  //     'vcNomCompte',
  //     'vcNomCompteOtp',
  //     'numeroMobile',
  //     'vcNomCompteMobile',
  //   ].forEach((field) => {
  //     this.f[field].clearValidators();
  //     this.f[field].setValue('');
  //     this.f[field].updateValueAndValidity({ emitEvent: false });
  //   });

  //   // OTP
  //   this.otp.controls.forEach((ctrl) => {
  //     ctrl.clearValidators();
  //     ctrl.setValue('');
  //     ctrl.updateValueAndValidity({ emitEvent: false });
  //   });
  // }


  // 🔹 Saisie normale
  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '');

    input.value = value;
    this.otp.at(index).setValue(value);

    if (value && index < this.otp.length - 1) {
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  // 🔹 Gestion Backspace
  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace') {
      if (!input.value && index > 0) {
        const prev = this.otpInputs.toArray()[index - 1].nativeElement;
        this.otp.at(index - 1).setValue('');
        prev.focus();
      }

      // Nettoyer les champs suivants
      for (let i = index; i < this.otp.length; i++) {
        this.otp.at(i).setValue('');
      }
    }
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

  // Clear le form array OTP
  this.otp.controls.forEach((ctrl) => {
    ctrl.setValue('');
    ctrl.clearValidators();
    ctrl.updateValueAndValidity({ emitEvent: false });
  });

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

    if (this.formBeneficiaire.invalid) {
      this.toastr.error('⚠️ Formulaire invalide', '', {
        positionClass: 'toast-custom-center',
      });
      console.warn('⚠️ Formulaire invalide');

      Object.keys(this.formBeneficiaire.controls).forEach((key) => {
        const control = this.formBeneficiaire.get(key);
        if (control?.invalid) {
          console.log(`- ${key}:`, control.errors);
        }
      });

      this.otp.controls.forEach((ctrl, index) => {
        if (ctrl.invalid) {
          console.log(`- otp[${index}]:`, ctrl.errors);
        }
      });

      this.formBeneficiaire.markAllAsTouched();
      this.isLoading = false;
      return;
    }

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
        console.log('💳 Paiement Type 1 (OTP)');
        console.log('OTP Array:', formValue.otp);

        // Vérifie OTP avant de joindre
        const invalidOtp = formValue.otp.some(
          (val: string) => !val.match(/^[0-9]$/)
        );
        if (invalidOtp) {
          this.isLoading = false;

          console.warn('⚠️ OTP incomplet ou invalide');
        }

        formData.append('vcNomCompte', formValue.vcNomCompteOtp);
        formData.append('vcAccountNumber', formValue.otp.join(''));

        formData.append('vcBanque', 'BCI');
      } else if (this.selectedTypePaiementId === '2') {
        console.log('🏦 Paiement Type 2 (Banque)');
        formData.append('vcBanque', String(formValue.banqueBeneficiaire));
        formData.append('vcAccountNumber', formValue.numeroCompte);
        formData.append('vcNomCompte', formValue.vcNomCompte);
      } else if (this.selectedTypePaiementId === '3') {
        console.log('📱 Paiement Type 3 (Mobile)');
        formData.append('vcAccountNumber', formValue.numeroMobile);
        formData.append('vcNomCompte', formValue.vcNomCompteMobile);
        formData.append('vcBanque', formValue.vcNomCompteMobile);
      } else {
        this.isLoading = false;

        console.warn(
          '⚠️ Aucun type de paiement sélectionné ou non géré',
          this.selectedTypePaiementId
        );
      }

      if (this.selectedFile) {
        console.log('📷 Fichier sélectionné', this.selectedFile.name);
        formData.append('vcPhoto', this.selectedFile, this.selectedFile.name);
      } else {
        this.isLoading = false;
        this.toastr.error('📷 Aucune photo sélectionnée', '', {
          positionClass: 'toast-custom-center',
        });
        return;
      }

      // console.log('--- DONNÉES PRÊTES À L’ENVOI ---');
      formData.forEach((value, key) => console.log(key, value));
    } catch (e) {
      this.isLoading = false;
      console.error('Erreur lors de la préparation des données', e);
      return;
    }
    if (this.selectedFile) {
      // Appel API
      this.beneficiaireService.ajouterBeneficiaire(formData).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res.status === 200) {
            this.toastr.success(res.message, '', {
              positionClass: 'toast-custom-center',
            });

            this.resetFormulaire();

            // Reset complet du formulaire
            // this.formBeneficiaire.reset();
            // this.selectedTypePaiementId = null;
            // Après que l'ajout est réussi
            this.selectedFile = null;
            this.photoPreview = null; // 🔹 important pour que l'image disparaisse

            // Réinitialiser l'input fichier dans le DOM
            if (this.fileInput) {
              this.fileInput.nativeElement.value = '';
            }

            // Réinitialiser l'input fichier dans le DOM
            if (this.fileInput) {
              this.fileInput.nativeElement.value = '';
            }

            // Réinitialiser l'OTP sans supprimer les inputs
            this.otp.controls.forEach((ctrl) => {
              ctrl.setValue('');
              ctrl.markAsPristine();
              ctrl.markAsUntouched();
            });

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
  }

  /** Récupération infos utilisateur */
  private getUserInfo(): void {
    const user = localStorage.getItem('userInfo');
    if (user) {
      this.userInfo = JSON.parse(user);
      this.idOrganisation = this.userInfo.iOrganisationID;
    }
  }

  /** Chargement type bénéficiaire */
  private loadTypeBeneficiaires(): void {
    this.beneficiaireService.getListeTypeBeneficiaire().subscribe({
      next: (res) => (this.listeTypeBeneficiaire = res.data),
      error: (err) => console.error('Erreur type bénéficiaire', err),
    });
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
