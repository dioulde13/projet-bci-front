import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/authServices/auth.service';
import { ConfigurationsService } from '../../../services/ConfigurationsService/configurations.service';
import { Router } from '@angular/router';
import { GnfNumberFormatDirective } from '../../../directives/gnf-number-format.directive';
import { GnfFormatPipe } from '../../gnfFormat/gnf-format.pipe';
declare var bootstrap: any; // Si tu utilises juste Bootstrap 5 JS

@Component({
  selector: 'app-modifier-mes-infos',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, GnfNumberFormatDirective, GnfFormatPipe],
  templateUrl: './modifier-mes-infos.component.html',
  styleUrl: './modifier-mes-infos.component.css',
})
export class ModifierMesInfosComponent {
  // 🔹 Gestion de la tabulation
  activeTab: string = 'profile1';
  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  // 🔹 Informations de l'utilisateur courant
  currentUserInfo = {
    vcFirstname: '',
    vcLastname: '',
    email: '',
    vcPhoneNumber: '',
    id: 0,
  };

  // 🔹 États
  isLoading: boolean = false;
  showSuccessModal: boolean = false;
  showErrorModal: boolean = false;
  modalMessage: string = '';

  // 🔹 Changement mot de passe
  passwordVisibleOld = false;
  passwordVisibleNew = false;
  passwordVisibleConfirm = false;
  password = { old: '', new: '', confirm: '' };

  countries: any[] = [];
  isLoadingCoutries: boolean = false;

  userInfoConfig: any;
  country: string = '';
  phoneCode: number = 0;
  phoneFormat: string = '';
  currency: string = '';
  timeZone: string = '';
  timeZonePerUser: any = '';

  phoneMaxLengthNumber: number = 0;
  firstNumberPhone: number = 0;
  phoneErrorMessage: string = '';

  phoneMaxLength!: number;
  phoneFirstNumber!: string;

  orgForm!: FormGroup;
  orgId!: number;
  configs!: any;
  idUsers!: number;
  selectedCountryId!: number;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private orgService: ConfigurationsService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  niveaux = [
    {
      level: 'Niveau 1',
      roleId: 1,
      roleName: 'Chef comptable',
      description: 'nnnnn',
      min: 10000,
      max: 100000,
    },
    {
      level: 'Niveau 2',
      roleId: 2,
      roleName: 'Comptable',
      description: 'aaaaa',
      min: 5000,
      max: 50000,
    },
  ];

  listeRoleNiveau = [
    { id: 1, vcRoleName: 'Chef comptable' },
    { id: 2, vcRoleName: 'Comptable' },
    { id: 3, vcRoleName: 'Auditeur' },
  ];

  niveauForm!: FormGroup;
  editingIndex: number | null = null;
  deleteIndex: number | null = null;

  openEditModal(index: number) {
    this.editingIndex = index;
    const niveau = this.niveaux[index];
    this.niveauForm.patchValue({
      vcRoleName: niveau.roleId,
      description: niveau.description,
      min: niveau.min,
      max: niveau.max,
    });
    const modal = new bootstrap.Modal(document.getElementById('editModal'));
    modal.show();
  }

  saveNiveau() {
    if (!this.niveauForm.valid) return;

    const formValue = this.niveauForm.value;
    const role = this.listeRoleNiveau.find(
      (r) => r.id === +formValue.vcRoleName
    );

    if (!role) return;

    this.niveaux[this.editingIndex!] = {
      ...this.niveaux[this.editingIndex!],
      roleId: role.id,
      roleName: role.vcRoleName,
      description: formValue.description,
      min: formValue.min,
      max: formValue.max,
    };

    this.niveauForm.reset();
    this.editingIndex = null;
    const modalEl: any = document.getElementById('editModal');
    bootstrap.Modal.getInstance(modalEl).hide();
  }

  // Ouvrir modal suppression
  openDeleteModal(index: number) {
    this.deleteIndex = index;
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
  }

  confirmDelete() {
    if (this.deleteIndex !== null) {
      this.niveaux.splice(this.deleteIndex, 1);
      this.deleteIndex = null;
      const modalEl: any = document.getElementById('deleteModal');
      bootstrap.Modal.getInstance(modalEl).hide();
    }
  }

  ngOnInit(): void {
    this.niveauForm = this.fb.group({
      vcRoleName: ['', Validators.required],
      description: [''],
      min: [0, [Validators.required, Validators.min(0)]],
      max: [0, [Validators.required, Validators.min(0)]],
    });

    // ==============================
    // 🔹 1. Récupération des infos utilisateur
    // ==============================
    const dataConfig = this.authService.getUserInfoConfig();
    const userInfo = this.authService.getUserInfo();

    this.orgId = userInfo.iOrganisationID;
    this.idUsers = userInfo.id;
    this.currentUserInfo = { ...userInfo };

    console.log('dataConfig : ', dataConfig);
    console.log('userInfo : ', userInfo);

    // ==============================
    // 🔹 2. Extraction des valeurs depuis la config
    // ==============================
    if (dataConfig) {
      this.userInfoConfig = { ...dataConfig };

      const orgData = dataConfig.organisation;

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
        orgData.find((c: any) => c.vcKey === 'TimeZonePerUser')?.vcValue ||
        false;

      this.phoneMaxLength = this.phoneFormat?.length || 0;
      this.phoneFirstNumber = this.phoneFormat?.charAt(0) || '';

      console.log('Config utilisateur :', {
        country: this.country,
        phoneCode: this.phoneCode,
        phoneFormat: this.phoneFormat,
        currency: this.currency,
        timeZone: this.timeZone,
        timeZonePerUser: this.timeZonePerUser,
      });
    }

    // ==============================
    // 🔹 3. Initialisation du formulaire
    // ==============================
    this.initForm();

    // ==============================
    // 🔹 4. Chargement de la liste des pays
    // ==============================
    this.loadListePays();

    // ==============================
    // 🔹 5. Réaction quand le pays change
    // ==============================
    this.orgForm.get('Pays')?.valueChanges.subscribe((selectedCode) => {
      if (!selectedCode) return;

      const selected = this.countries.find(
        (c: any) =>
          c.vcCode.toLowerCase().trim() === selectedCode.toLowerCase().trim()
      );

      console.log('Pays sélectionné :', selected);

      if (selected) {
        // ✅ Patch du formulaire avec les valeurs du pays choisi
        this.orgForm.patchValue(
          {
            Telephone_Code: selected.vcPhoneCode,
            Telephone_Format: selected.vcPhoneFormat,
            TimeZone: selected.vcTimeZone,
            Devise: selected.devise || this.currency,
            TimeZonePerUser: this.timeZonePerUser === 1 ? true : false,
          },
          { emitEvent: false }
        );

        // ✅ Récupération et stockage de l’ID du pays sélectionné
        this.selectedCountryId = Number(selected.id);
        console.log('ID du pays sélectionné :', this.selectedCountryId);
      }
    });
  }

  // ✅ Changer visibilité mot de passe
  togglePasswordVisibility(field: 'old' | 'new' | 'confirm') {
    if (field === 'old') this.passwordVisibleOld = !this.passwordVisibleOld;
    if (field === 'new') this.passwordVisibleNew = !this.passwordVisibleNew;
    if (field === 'confirm')
      this.passwordVisibleConfirm = !this.passwordVisibleConfirm;
  }

  // Empêcher la saisie de lettres, caractères spéciaux et espaces
  // Empêcher la saisie de lettres, caractères spéciaux et espaces
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

    // Bloquer tout sauf chiffres
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }

    // Si l'utilisateur essaie de taper le premier chiffre
    if (input.value.length === 0 && event.key !== this.phoneFirstNumber) {
      event.preventDefault();
      return;
    }

    // Optionnel : bloquer si déjà max de chiffres saisis
    if (input.value.length >= this.phoneMaxLength) {
      event.preventDefault();
    }
  }

  // Empêcher le collage de texte invalide
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

    // Vérifier que la longueur totale après collage ne dépasse pas le {phoneMaxLength}
    if (input.value.length + pastedData.length > this.phoneMaxLength) {
      event.preventDefault();
    }
  }

  userEmail: string = '';

  modifierInfos() {
    // Si tout est correct, on peut continuer l'appel API
    this.isLoading = true;
    this.authService
      .modifierProfile(
        this.currentUserInfo.vcLastname,
        this.currentUserInfo.vcFirstname,
        this.currentUserInfo.email,
        this.currentUserInfo.vcPhoneNumber,
        Number(this.currentUserInfo.id)
      )
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;

          if (response.status === 200) {
            this.authService.setUserInfo(response.data);
            this.userEmail = this.authService.getUserInfo().email;
            console.log('userEmail', this.userEmail);
            localStorage.setItem('userEmail', this.userEmail);

            // Gestion des scénarios de déconnexion
            if (response?.isDeconnectUsersPhone === 'pageotp') {
              // Affichage du message de success
              this.toastr.success(
                'Vos informations ont été modifiées. Déconnexion dans 5 secondes pour validation téléphone.',
                '',
                {
                  positionClass: 'toast-custom-center',
                  timeOut: 5000,
                }
              );

              // Deconnexion et redirection apres 5 secondes
              setTimeout(() => {
                this.authService.deConnexion();
                this.router.navigate(['/valider-otp']);
              }, 5000);
            } else if (response?.isDeconnectUsersEmail === 'pageemail') {
              // Affichage du message de success si l'email a ete modifier
              this.toastr.success(
                'Vos informations ont été modifiées. Déconnexion dans 5 secondes pour validation email.',
                '',
                {
                  positionClass: 'toast-custom-center',
                  timeOut: 5000,
                }
              );

              // Deconnexion et redirection apres 5 secondes
              setTimeout(() => {
                this.authService.deConnexion();
                this.router.navigate(['/login']);
              }, 5000);
            } else {
              // Sinon afficher cas meme le message de modification uniquement
              this.toastr.success(response.message, '', {
                positionClass: 'toast-custom-center',
              });
            }
            // Si Erreur
          } else {
            this.toastr.error(response.message, '', {
              positionClass: 'toast-custom-center',
            });
          }
          console.log(response);
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error(
            error?.error?.message === 'Unauthenticated.'
              ? 'Votre session a expiré.'
              : 'Erreur lors du chargement des pays',
            '',
            {
              positionClass: 'toast-custom-center',
            }
          );
        },
      });
    // const phoneNumber = this.currentUserInfo.vcPhoneNumber;

    // // Réinitialiser le message d'erreur
    // this.phoneErrorMessage = '';

    // // Premier chiffre du numéro saisi
    // const firstNumberPhoneSaisi = parseInt(phoneNumber.charAt(0), 10);

    // console.log('Numéro complet :', phoneNumber);
    // console.log('Premier chiffre saisi :', firstNumberPhoneSaisi);
    // console.log('firstNumberPhone :', this.firstNumberPhone);

    // // Vérifier que le numéro de téléphone a le bon nombre de chiffres
    // if (
    //   !phoneNumber ||
    //   phoneNumber.replace(/\D/g, '').length < this.phoneMaxLengthNumber
    // ) {
    //   this.phoneErrorMessage = `Le numéro de téléphone doit contenir au moins ${this.phoneMaxLengthNumber} chiffres.`;
    //   return; // arrêter l'exécution si la condition n'est pas respectée
    // }

    // // Vérifier que le numéro commence par le bon chiffre
    // if (firstNumberPhoneSaisi !== this.firstNumberPhone) {
    //   this.phoneErrorMessage = `Le numéro de téléphone doit commencer par ${this.firstNumberPhone}.`;
    //   return; // arrêter l'exécution si la condition n'est pas respectée
    // }

    // // Si tout est correct, on peut continuer l'appel API
    // this.isLoading = true;
    // this.authService
    //   .modifierProfile(
    //     this.currentUserInfo.vcLastname,
    //     this.currentUserInfo.vcFirstname,
    //     this.currentUserInfo.email,
    //     phoneNumber,
    //     Number(this.currentUserInfo.id)
    //   )
    //   .subscribe({
    //     next: (response: any) => {
    //       this.isLoading = false;
    //       if (response.status === 200) {
    //         this.toastr.success(response.message, '', {
    //           positionClass: 'toast-custom-center',
    //         });
    //         this.authService.setUserInfo(response.data);
    //       } else {
    //         this.toastr.error(response.message, '', {
    //           positionClass: 'toast-custom-center',
    //         });
    //       }
    //     },
    //     error: (error) => {
    //       this.isLoading = false;
    //       this.toastr.error(error.message, '', {
    //         positionClass: 'toast-custom-center',
    //       });
    //     },
    //   });
  }

  // ✅ Changer mot de passe
  changerMotDePasse(form: NgForm): void {
    // Vérification du formulaire avant tout
    if (form.invalid) {
      Object.values(form.controls).forEach((control) =>
        control.markAsTouched()
      );
      return; // Ne pas appeler l'API
    }

    // Vérifier correspondance des mots de passe
    if (this.password.new !== this.password.confirm) {
      this.toastr.error('Les mots de passe ne correspondent pas.', '', {
        positionClass: 'toast-custom-center',
      });
      return;
    }

    this.isLoading = true;

    this.authService
      .updatePassword(
        this.password.old,
        this.password.new,
        this.currentUserInfo.email
      )
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response?.status === 200 || response?.success) {
            this.toastr.success(response?.message, '', {
              positionClass: 'toast-custom-center',
            });
            this.password = { old: '', new: '', confirm: '' };
            form.resetForm();
          } else {
            this.toastr.error(
              response?.message || 'Échec de la modification.',
              '',
              {
                positionClass: 'toast-custom-center',
              }
            );
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          this.toastr.error(
            error?.error?.message === 'Unauthenticated.'
              ? 'Votre session a expiré.'
              : 'Erreur lors du chargement des pays',
            '',
            {
              positionClass: 'toast-custom-center',
            }
          );
        },
      });
  }

  // Initialisation du formulaire
  private initForm(): void {
    this.orgForm = this.fb.group({
      Pays: [this.country || '', Validators.required],
      Telephone_Code: [this.phoneCode || '', Validators.required],
      Telephone_Format: [this.phoneFormat || '', Validators.required],
      TimeZone: [this.timeZone || '', Validators.required],
      Devise: [this.currency || '', Validators.required],
      TimeZonePerUser: [this.timeZonePerUser || false],
    });
  }

  // Liste des pays.
  private loadListePays(): void {
    this.isLoadingCoutries = true;
    this.orgService.getListePays().subscribe({
      next: (res) => {
        if (res?.status && res?.status === 200) {
          this.countries = res?.data;
          console.log(this.countries);

          // ✅ Sélectionner le pays de l'utilisateur connecté (après chargement)
          const selectedCountry = this.countries.find(
            (c: any) =>
              c.vcName.toLowerCase().trim() ===
                this.country?.toLowerCase().trim() ||
              c.vcCode.toLowerCase().trim() ===
                this.country?.toLowerCase().trim()
          );

          if (selectedCountry) {
            this.orgForm.patchValue(
              {
                Pays: selectedCountry.vcCode,
                Telephone_Code: selectedCountry.vcPhoneCode,
                Telephone_Format: selectedCountry.vcPhoneFormat,
                TimeZone: selectedCountry.vcTimeZone,
                Devise: selectedCountry.vcCurrency || this.currency,
              },
              { emitEvent: false }
            );
          }
        }
        console.log(res);
        this.isLoadingCoutries = false;
      },
      error: (err) => {
        this.toastr.error(
          err?.error?.message === 'Unauthenticated.'
            ? 'Votre session a expiré.'
            : 'Erreur lors du chargement des pays',
          '',
          {
            positionClass: 'toast-custom-center',
          }
        );
        console.log(err);
        console.log(err.error.message);
        this.isLoadingCoutries = false;
      },
    });
  }

  // Changer les informations de configuration du pays
  // onSubmit(): void {
  //   if (this.orgForm.invalid) return;
  //   const formValue = this.orgForm.value;

  //   console.log('formValue', formValue);

  //   const payload = Object.keys(formValue).map((key) => ({
  //     vcKey: key,
  //     vcValue:
  //       key === 'TimeZonePerUser'
  //         ? formValue[key]
  //           ? '1'
  //           : '0'
  //         : formValue[key],
  //   }));

  //   // (formValue[key] ? 1 : 0)

  //   console.log('✅ Données à envoyer au backend :', payload);

  //   this.isLoading = true;

  //   // Appel au service de mise ajour.
  //   this.orgService.updateMultipleConfigs(this.orgId, payload, this.idUsers, this.selectedCountryId).subscribe({
  //     next: (res) => {
  //       console.log('doneer envoyer sont : ', this.orgId, payload);

  //       if (res?.status && res?.status === 200) {
  //         this.toastr.success(res.message, '', {
  //           positionClass: 'toast-custom-center',
  //         });

  //         const oldConf = this.authService.getUserInfoConfig();
  //         console.log('dany', oldConf, { ...oldConf, organisation: res?.data });
  //         this.authService.setUserInfoConfig({
  //           ...oldConf,
  //           organisation: res?.data,
  //         });
  //       } else {
  //         this.toastr.error(res.message, '', {
  //           positionClass: 'toast-custom-center',
  //         });
  //       }
  //       console.log(res);
  //       console.log(this.timeZonePerUser);
  //       this.isLoading = false;
  //     },

  //     error: (err) => {
  //       console.log(err);
  //       this.toastr.error(err.message, '', {
  //         positionClass: 'toast-custom-center',
  //       });
  //       this.isLoading = false;
  //     },
  //   });
  // }

  // Changer les informations de configuration du pays
  onSubmit(): void {
    if (this.orgForm.invalid) return;

    const formValue = this.orgForm.value;
    console.log('formValue', formValue);

    // ✅ Récupérer le pays sélectionné (objet complet)
    const selectedCountry = this.countries.find(
      (c: any) =>
        c.vcCode.toLowerCase().trim() === formValue.Pays.toLowerCase().trim()
    );

    // ✅ Récupérer l'id du pays
    const selectedCountryId = selectedCountry ? selectedCountry.id : null;
    console.log('✅ ID du pays sélectionné :', selectedCountryId);
    console.log('✅ Pays sélectionné :', selectedCountry);

    // ✅ Construire le payload à envoyer
    const payload = Object.keys(formValue).map((key) => ({
      vcKey: key,
      vcValue:
        key === 'TimeZonePerUser'
          ? formValue[key]
            ? '1'
            : '0'
          : formValue[key],
    }));

    // ✅ Ajouter les infos du pays sélectionné dans le payload
    if (selectedCountry) {
      payload.push(
        { vcKey: 'idPays', vcValue: selectedCountry.id },
        { vcKey: 'NomPays', vcValue: selectedCountry.vcName },
        { vcKey: 'CodePays', vcValue: selectedCountry.vcCode }
      );
    }

    console.log('✅ Données à envoyer au backend :', payload);

    this.isLoading = true;

    // ✅ Envoi avec l'id du pays
    this.orgService
      .updateMultipleConfigs(
        this.orgId,
        payload,
        this.idUsers,
        selectedCountryId
      )
      .subscribe({
        next: (res) => {
          console.log('doneer envoyer sont : ', this.orgId, payload);

          if (res?.status && res?.status === 200) {
            this.toastr.success(
              'Votre fuseau horaire a été modifié avec succès !',
              '',
              {
                positionClass: 'toast-custom-center',
              }
            );

            const oldConf = this.authService.getUserInfoConfig();
            console.log('dany', oldConf, {
              ...oldConf,
              organisation: res?.data,
            });
            const config = { ...oldConf, organisation: res?.data };
            console.log('New config : ', config);
            this.authService.setUserInfoConfig(config);
          } else {
            this.toastr.error(res.message, '', {
              positionClass: 'toast-custom-center',
            });
          }

          console.log(res);
          this.isLoading = false;
        },

        error: (err) => {
          console.log(err);
          this.toastr.error(
            err?.error?.message === 'Unauthenticated.'
              ? 'Votre session a expiré.'
              : 'Erreur lors du chargement des pays',
            '',
            {
              positionClass: 'toast-custom-center',
            }
          );
          this.isLoading = false;
        },
      });
  }

  closeModal() {
    this.showSuccessModal = false;
    this.showErrorModal = false;
    this.modalMessage = '';
  }

  btnClicked() {
    console.log('Bouton cliqué');
  }
}
