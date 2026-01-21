import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import {
  getErrorMessage,
  getFormControlClass,
  isInvalid,
  isValid,
} from './form-helpers';
import { AuthServicesNodes } from '../../../servicesNodes/authServices/auth.service';
import { ModalsService } from '../../../servicesNodes/modalsService/modals.service';
import { AuthService } from '../../../services/authServices/auth.service';
import * as XLSX from 'xlsx';

// import { AuthService } from '../../../services/authServices/auth.service';

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './utilisateurs.component.html',
})
export class UtilisateursComponent implements OnInit {
  userForm!: FormGroup;

  isLoading: boolean = false;
  isLoadingUser: boolean = false;
  isEditMode: boolean = false;

  roles: any = [];
  users: any = [];
  countries: any = [];

  btEnabled!: number;
  showModalOpenBloquerDebloquer = false;
  isloadingBloquerDebloquer: boolean = false;

  selectedUser: any = null;
  selectedUserId: number | null = null;

  // userInfoConfig: any;
  userInfo: any;
  phoneCode: number = 0;
  phoneFormat: string = '';
  phoneMaxLength!: number;
  phoneFirstNumber!: string;

  orgId!: string | number;

  id: number | null = null;
  idResponsable!: number;
  iOrganisationID!: number;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private authService: AuthServicesNodes,
    private authServiceSimple: AuthService,
    private modalsService: ModalsService
  ) {}

  // Raccourcis pour le template
  isInvalid = (name: string) => isInvalid(this.userForm, name);
  isValid = (name: string) => isValid(this.userForm, name);
  getErrorMessage = (name: string) => getErrorMessage(this.userForm, name);
  getFormControlClass = (name: string) =>
    getFormControlClass(this.userForm, name);

  userInfoConfig: any; // 👈 déclaration obligatoire
  country: string = '';
  currency: string = '';
  timeZone: string = '';
  timeZonePerUser: any = '';

  listePays: any[] = [];

  ngOnInit(): void {
    this.getListePays();
    const userInfoString = localStorage.getItem('userInfo');
    // console.log('userInfo (raw) ', userInfoString);

    const userInfoConfig = localStorage.getItem('userInfoConfig');

    if (userInfoConfig) {
      // ✅ Parser la string JSON
      this.userInfoConfig = JSON.parse(userInfoConfig);
      // console.log('UserInfoConfig :', this.userInfoConfig);

      const orgData = this.userInfoConfig.organisation || [];

      // ✅ Extraction sécurisée
      this.country =
        orgData.find((c: any) => c.vcKey === 'Pays')?.vcValue || '';

      this.phoneCode =
        orgData.find((c: any) => c.vcKey === 'Telephone_Code')?.vcValue || '';

      this.phoneFormat =
        orgData.find((c: any) => c.vcKey === 'Telephone_Format')?.vcValue || '';

      this.currency =
        orgData.find((c: any) => c.vcKey === 'Devise')?.vcValue || '';

      this.timeZone =
        orgData.find((c: any) => c.vcKey === 'TimeZone')?.vcValue || '';

      this.timeZonePerUser =
        orgData.find((c: any) => c.vcKey === 'TimeZonePerUser')?.vcValue ===
        '1';
    } else {
      this.userInfoConfig = null;
      // console.warn('userInfoConfig non trouvé dans le localStorage');
    }

    this.phoneMaxLength = this.phoneFormat?.length || 0;
    this.phoneFirstNumber = this.phoneFormat?.charAt(0) || '';

    // console.log('phoneFirstNumber: ', this.phoneFirstNumber);

    if (userInfoString) {
      try {
        this.userInfo = JSON.parse(userInfoString);
        // console.log('userInfo (parsed) ', this.userInfo);

        this.idResponsable = this.userInfo.id;
        this.iOrganisationID = this.userInfo.iOrganisationID;
      } catch (error) {
        console.error('Erreur lors du parsing de userInfo :', error);
      }
    } else {
      console.warn('Aucun userInfo trouvé dans localStorage.');
    }

    this.initForm();
    this.getAllUsers();
    this.loadRoles();
  }

  getListePays() {
    this.authServiceSimple.getListePays().subscribe({
      next: (res: any) => {
        this.listePays = res.data;
        console.log('res: ', this.listePays);
      },
    });
  }

  initForm(): void {
    this.userForm = this.fb.group({
      vcLastname: ['', Validators.required],
      vcFirstname: ['', Validators.required],
      vcEmail: ['', [Validators.required, Validators.email]],
      iRoleID: [null, Validators.required],
      vcPhoneNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]+$/),
          Validators.minLength(this.phoneMaxLength),
          Validators.maxLength(this.phoneMaxLength),
        ],
      ],
      modeOtp: ['', Validators.required],
      idPays: [null, Validators.required],
      vcDescription: ['', Validators.required],
    });
  }

  onlyDigits(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
      'Tab',
    ];
    const input = event.target as HTMLInputElement;

    if (allowedKeys.includes(event.key)) return;

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }

    if (input.value.length === 0 && event.key !== this.phoneFirstNumber) {
      event.preventDefault();
      return;
    }

    if (input.value.length >= this.phoneMaxLength) {
      event.preventDefault();
    }
  }

  onPaste(event: ClipboardEvent) {
    const pastedData = event.clipboardData?.getData('text') || '';
    const input = event.target as HTMLInputElement;
    const regex = new RegExp(`^\\d{1,${this.phoneMaxLength}}$`);
    if (!regex.test(pastedData)) {
      event.preventDefault();
      return;
    }

    const finalValue = input.value + pastedData;
    if (
      finalValue.length > 0 &&
      finalValue.charAt(0) !== this.phoneFirstNumber
    ) {
      event.preventDefault();
      return;
    }

    if (input.value.length + pastedData.length > this.phoneMaxLength) {
      event.preventDefault();
    }
  }

  openCreateModal() {
    this.isEditMode = false;
    this.initForm();
    this.userForm.reset();
    this.modalsService.openModal('createUserModal');
  }

  onToggle(user: any) {
    this.selectedUserId = user.id;
    this.btEnabled = +user.btEnabled === 0 ? 1 : 0;
    this.showModalOpenBloquerDebloquer = true;

    // Ouvre la modal de confirmation
    this.modalsService.openModal('bloquerDebloquerModal');
    console.log('Selected user : ', user);
    console.log(this.selectedUserId, this.btEnabled);
  }

  openModal(modalId: string) {
    const isModalOpen = this.modalsService.isModalOpen(modalId);
    if (!isModalOpen) {
      this.modalsService.openModal(modalId);
      this.userForm.reset();
    }
  }

  closeModal(modalId: string) {
    this.modalsService.closeModal(modalId);
  }

  onSubmit() {
    // Vérifier si le formulaire est valide
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const raw = this.userForm.value;

    // Préparer le payload
    const payload = {
      nom: raw.vcLastname,
      prenom: raw.vcFirstname,
      email: raw.vcEmail,
      iRoleID: raw.iRoleID,
      phoneNumber: raw.vcPhoneNumber,
      modeOtp: raw.modeOtp,
      idPays: raw.idPays,
      vcDescription: raw.vcDescription,
    };

    this.isLoading = true;

    this.authServiceSimple
      .creerUnNouveauUtilisateur(
        payload.prenom,
        payload.nom,
        payload.email,
        payload.iRoleID,
        payload.phoneNumber,
        payload.modeOtp,
        payload.idPays,
        payload.vcDescription
      )
      .subscribe({
        next: (res: any) => {
          this.toastr.success(
            res?.message || 'Utilisateur créé avec succès',
            '',
            {
              positionClass: 'toast-custom-center',
            }
          );
          this.getAllUsers();
          this.isLoading = false;
          this.userForm.reset();
        },
        error: (err: any) => {
          console.error('Erreur création utilisateur:', err);
          this.toastr.error(err?.message || 'Une erreur est survenue', '', {
            positionClass: 'toast-custom-center',
          });
          this.isLoading = false;
        },
      });
  }

  bloquerEtDebloquer(): void {
    if (this.isloadingBloquerDebloquer) return;
    if (this.selectedUserId === null) {
      this.toastr.error('Aucun utilisateur sélectionné.');
      return;
    }

    this.isloadingBloquerDebloquer = true;

    this.authService
      .bloquerDebloquer(this.selectedUserId, this.btEnabled)
      .subscribe({
        next: (res) => {
          if (res?.status && res?.status === 200) {
            this.toastr.success(res?.message, '', {
              positionClass: 'toast-custom-center',
            });
            this.getAllUsers();
          } else {
            this.toastr.error(res?.message, '', {
              positionClass: 'toast-custom-center',
            });
          }

          this.showModalOpenBloquerDebloquer = false;
          this.isloadingBloquerDebloquer = false;
          this.modalsService.closeModal('bloquerDebloquerModal');
        },
        error: (err) => {
          this.toastr.error(err?.message, '', {
            positionClass: 'toast-custom-center',
          });
          this.isloadingBloquerDebloquer = false;
          this.modalsService.closeModal('bloquerDebloquerModal');
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
    let data = [...this.allUsers];

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
      Date: new Date(d.dtCreated).toLocaleString(), // formater la date
      Nom: d.vcFirstname,
      Prénom: d.vcLastname,
      Email: d.email,
      Télephone: d.vcPhoneNumber, 
      Role: d.vcRoleName
      // Date: d.dtCreated
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

  allUsers: any[] = [];

  private getAllUsers() {
    if (!this.idResponsable) {
      console.warn('idResponsable non défini');
      return;
    }

    this.isLoadingUser = true;

    this.authService.listeUtilisateur(this.idResponsable).subscribe({
      next: (res: any) => {
        this.allUsers = res.data || [];
        this.isLoadingUser = false;
      },
      error: (err: any) => {
        this.toastr.error(
          err?.error?.message === 'Unauthorized.'
            ? 'Votre session a expirée.'
            : err.message,
          '',
          { positionClass: 'toast-custom-center' }
        );
        this.isLoadingUser = false;
      },
    });
  }

  private loadRoles() {
    this.isLoading = true;

    this.authService.listeRole(this.iOrganisationID).subscribe({
      next: (res) => {
        this.roles = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.log(err);
      },
    });
  }
}
