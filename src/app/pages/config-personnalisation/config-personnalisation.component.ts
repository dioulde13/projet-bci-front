import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { Router, RouterLink } from '@angular/router';

import { Niveau } from '../model/niveau.model';
import { Categorie } from '../model/categorie.model';
import { Resumer } from '../model/resumer.model';
import { ConfigPersonnalitionService } from '../../services/configPersonnalition/config-personnalition.service';
// import { ToastrService } from 'ngx-toastr';
import { GnfFormatPipe } from '../gnfFormat/gnf-format.pipe';
import { GnfNumberFormatDirective } from '../../directives/gnf-number-format.directive';
import { NotificationService } from '../../services/notification/notification.service';

@Component({
  selector: 'app-config-personnalisation',
  templateUrl: './config-personnalisation.component.html',
  styleUrls: ['./config-personnalisation.component.css'], // corrigé
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatStepperModule,
    GnfFormatPipe,
    GnfNumberFormatDirective,
  ],
})
export class ConfigPersonnalisationComponent implements OnInit {
  comptes: any[] = [];
  // securites: Securite[] = [];
  categories: Categorie[] = [];
  niveaux: Niveau[] = [];
  isEditMode = false;

  // 🔒 Hiérarchie métier FIXE
  readonly HIERARCHIE_ROLES = [
    'Initiateur',
    'Assistant comptable',
    'Comptable',
    'Chef comptable',
    'DAF',
  ];

  resumes: Resumer[] = [];

  listeRoleNiveau: any[] = [];
  listesQuestions: any[] = [];

  currentStep = 1;
  totalSteps = 6;

  // Dans ton component.ts
  onlyNumber(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;

    // Empêche les caractères non numériques
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
      return;
    }

    // Empêche d'entrer plus de 4 chiffres
    if (input.value.length >= 4) {
      event.preventDefault();
    }
  }

  // Juste après la déclaration de `totalSteps`
  stepsEnabled: Record<number, boolean> = {
    1: true, // étape 1 toujours accessible
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
  };

  comptesSelected = false;
  validationConfigured: boolean | undefined = undefined; // undefined = rien coché par défaut
  validationConfiguredLien: boolean | undefined = undefined; // undefined = rien coché par défaut
  categoriesConfigured = false;
  securiteConfigured = false;

  niveauForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private configurationPer: ConfigPersonnalitionService,
    // private toastr: ToastrService,
    private router: Router,
    private notification: NotificationService,
  ) {
    this.niveauForm = this.fb.group({
      id: [null],
      vcRoleName: ['', Validators.required],
      vcDescription: ['', Validators.required],
      min: [0, [Validators.required, Validators.min(0)]],
      max: [0, [Validators.required, Validators.min(0)]],
    });
  }

  getRoleOrganisationListe() {
    this.configurationPer.getRoleOrganisation().subscribe({
      next: (response) => {
        console.log(response.data);
        this.listeRoleNiveau = response.data.filter(
          (f: any) => f.vcRoleName !== 'DAF',
        );
        // console.log(this.listeRoleNiveau);
        // console.log(this.listeRoleNiveau);
      },
      error(err: any) {},
    });
  }

  // Ajoute cette propriété

  securiteFormRecuperation!: FormGroup; // <-- Déclaration du FormGroup
  securiteFormCode!: FormGroup; // <-- Déclaration du FormGroup
  selectedOption: string = 'Questions de sécurité'; // ou selon ton choix
  securites = [
    {
      option: 'Double authentification (2FA)',
      statut: 'Activé',
      editable: false,
    },
    {
      option: 'Questions de sécurité',
      statut: '',
      editable: true,
    },
    {
      option: 'Récupération d’accès',
      statut: 'Non configuré',
      editable: false,
    },
    {
      option: 'Code pin(transaction)',
      statut: '',
      editable: true,
    },
  ];

  // Ouvrir modal
  openEditModalSecurite(securite: { option: string; statut?: string }): void {
    this.selectedOption = securite.option;

    let modal: HTMLDialogElement | null = null;
    let formToUse: FormGroup | undefined;

    switch (securite.option) {
      case 'Questions de sécurité':
        modal = document.getElementById(
          'modifierSecuriteModal',
        ) as HTMLDialogElement;
        formToUse = this.securiteForm;
        break;
      case 'Récupération d’accès':
        modal = document.getElementById(
          'modifierSecuriteModalRecupererAcces',
        ) as HTMLDialogElement;
        formToUse = this.securiteFormRecuperation;
        break;
      case 'Code pin(transaction)':
        modal = document.getElementById(
          'modifierSecuriteModalCode',
        ) as HTMLDialogElement;
        formToUse = this.securiteFormCode;
        break;
      default:
        return;
    }

    if (!modal || !formToUse) return;

    modal.showModal();

    if (securite.statut) {
      const valeurs: string[] = securite.statut
        .split('|')
        .map((v: string) => v.trim());

      const patch: { [key: string]: string } = {};

      Object.keys(formToUse.controls).forEach((key, index) => {
        patch[key] = valeurs[index] || '';
      });

      formToUse.patchValue(patch);
    } else {
      formToUse.reset();
    }
  }

  closeModalSecuriteCode() {
    const modal: any = document.getElementById('modifierSecuriteModalCode');
    if (modal) modal.close();
  }

  closeModalSecuriteRecu() {
    const modal: any = document.getElementById(
      'modifierSecuriteModalRecupererAcces',
    );
    if (modal) modal.close();
  }

  closeModalSecurite() {
    const modal: any = document.getElementById('modifierSecuriteModal');
    if (modal) modal.close();
  }

  canGoNextStep4(): boolean {
    // Vérifie que le formulaire est valide (tous les champs requis remplis)
    return this.securiteForm.valid;
  }

  saveSecuriteCode() {
    if (this.securiteFormCode.invalid) {
      this.securiteFormCode.markAllAsTouched();
      return;
    }

    const code = this.securiteFormCode.value.codePin;

    const index = this.securites.findIndex(
      (s) => s.option === 'Code pin(transaction)',
    );
    if (index !== -1) {
      this.securites[index] = {
        ...this.securites[index],
        statut: `${code}`,
      };
    }

    this.closeModalSecuriteCode();
  }

  saveSecuriteFormRecuperation() {
    if (this.securiteFormRecuperation.invalid) {
      this.securiteFormRecuperation.markAllAsTouched();
      return;
    }

    const email = this.securiteFormRecuperation.value.email;

    const index = this.securites.findIndex(
      (s) => s.option === 'Récupération d’accès',
    );
    if (index !== -1) {
      this.securites[index] = {
        ...this.securites[index],
        statut: `${email}`,
      };
    }

    this.closeModalSecuriteRecu();
  }

  // Pour accéder facilement aux erreurs dans le template
  get email() {
    return this.securiteForm.get('email');
  }

  get codePin() {
    return this.securiteFormCode.get('codePin');
  }

  canGoNextStep4Code(): boolean {
    return this.codePin?.valid ?? false;
  }

  securiteForm!: FormGroup;

  saveSecuriteQuestionsSecurite() {
    if (this.securiteForm.invalid) {
      this.securiteForm.markAllAsTouched();
      return;
    }

    const reponses = this.securiteForm.value;
    const affichage = Object.values(reponses).join(' | ');

    const index = this.securites.findIndex(
      (s) => s.option === this.selectedOption,
    );
    if (index !== -1) {
      this.securites[index] = { ...this.securites[index], statut: affichage };
    }

    this.closeModalSecurite();
  }

  // Récupérer les questions depuis l'API
  getListeSecuriteQuestion() {
    this.configurationPer.getListeSecuriteQuestion().subscribe({
      next: (response: any) => {
        this.listesQuestions = response.data.filter(
          (q: any) => q.btEnabled === '1',
        );

        const group: any = {};

        this.listesQuestions.forEach((q: any, index: number) => {
          const controlName = `q${index + 1}`;
          q.controlName = controlName;

          if (index === 1) {
            group[controlName] = [''];
          } else {
            group[controlName] = ['', Validators.required];
          }
        });

        this.securiteForm = this.fb.group(group);
        console.log(this.listesQuestions);
      },
      error: (err) => console.error(err),
    });
  }

  saveSecuriteToLocalStorage() {
    console.log('Je suis dedans ....');
    const userSecurityOptions: any[] = [];

    this.securites.forEach((s) => {
      switch (s.option) {
        case 'Questions de sécurité':
          if (this.securiteForm?.value) {
            Object.keys(this.securiteForm.value).forEach((key, index) => {
              userSecurityOptions.push({
                categorieSecurite: 'Questions',
                key: this.listesQuestions[index]?.vcQuestion || key,
                valeur: this.securiteForm.value[key],
              });
            });
          }
          break;

        case 'Code pin(transaction)':
          userSecurityOptions.push({
            categorieSecurite: 'PIN',
            key: 'PIN',
            valeur: s.statut || '',
          });
          break;

        case 'Récupération d’accès':
          userSecurityOptions.push({
            categorieSecurite: 'RecuperationAccess',
            key: s.statut || 'Non configuré',
            valeur: s.statut || 'Non configuré',
          });
          break;

        case 'Double authentification (2FA)':
          userSecurityOptions.push({
            categorieSecurite: '2FA',
            key: '2FA',
            valeur: s.statut || 'Non configuré',
          });
          break;
      }
    });

    localStorage.setItem(
      'userSecurityOptions',
      JSON.stringify(userSecurityOptions),
    );
  }

  forcerHttps() {
    if (!this.lienSaisi) return; // si vide, on ne fait rien

    // Supprime tout préfixe http:// ou https:// sauf celui correct
    const lienNettoye = this.lienSaisi.replace(/^https?:\/\//, '');

    // On ajoute https:// uniquement si ce n’est pas déjà présent
    if (!this.lienSaisi.startsWith('https://')) {
      this.lienSaisi = 'https://' + lienNettoye;
    }
  }

  formatLien() {
    if (!this.lienSaisi) return;

    // Supprime tous les espaces et convertit en minuscules
    this.lienSaisi = this.lienSaisi.replace(/\s+/g, '').toLowerCase();
  }

  modeEnvoiOtp: any;

  ngOnInit() {
    this.getListeSecuriteQuestion();
    this.securiteFormCode = this.fb.group({
      codePin: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]],
    });

    this.securiteFormRecuperation = this.fb.group({
      email: ['', Validators.required],
    });

    this.getRoleOrganisationListe();

    // Récupération des comptes depuis le localStorage
    const modeEnvoiOtp = localStorage.getItem('modeEnvoiOtp');

    this.modeEnvoiOtp = modeEnvoiOtp ? JSON.parse(modeEnvoiOtp) : null;

    // console.log('this.modeEnvoiOtp:', this.modeEnvoiOtp);

    // Récupération des comptes depuis le localStorage
    const comptesStockes = localStorage.getItem('comptes');
    this.comptes = comptesStockes ? JSON.parse(comptesStockes) : [];

    console.log('this.comptes: ', this.comptes);

    // 🔥 Réappliquer la sélection cochée
    const savedSelection = localStorage.getItem('listecomptesSelectioner');

    if (savedSelection) {
      const comptesSelectionnes = JSON.parse(savedSelection);

      this.comptes.forEach((compte) => {
        compte.isChecked = comptesSelectionnes.some(
          (c: any) => c.compte === compte.compte,
        );
      });
    }

    const saved = localStorage.getItem('niveaux');
    this.niveaux = saved ? JSON.parse(saved) : [];
    this.trierNiveauxParHierarchie();

    // Récupération des catégories
    const categoriesStockees = localStorage.getItem('categories');
    this.categories = categoriesStockees ? JSON.parse(categoriesStockees) : [];

    // Initialisation du résumé
    this.updateResumer();
  }

  // Propriété pour la catégorie sélectionnée (modification)
  selectedCategorie: Categorie | null = null;

  /** ------------------------------
   * Ouvrir modal → AJOUT
   * ------------------------------ */
  openAddCategorieModal() {
    this.selectedCategorie = null;
    this.resetCategorieForm();
    this.showCategorieModal();
  }

  /** ------------------------------
   * Ouvrir modal → MODIFICATION
   * ------------------------------ */
  openEditCategorieModal(categorie: Categorie) {
    this.selectedCategorie = { ...categorie }; // 🔥 éviter mutation directe
    this.fillCategorieForm(categorie);
    this.showCategorieModal();
  }

  saveCategorie() {
    const nom = this.getInputValue('addCatNom')?.trim();
    const description = this.getInputValue('addCatDesc')?.trim();

    if (!nom) {
      this.showCategorieWarning();
      return;
    }

    const regles = this.getCheckedRegles();
    const approbationValue = regles.join(', ');

    // 🔍 Vérification de doublon (seulement nom)
    const existeDeja = this.categories.some(
      (c) =>
        c.categorie.trim().toLowerCase() === nom.toLowerCase() &&
        (!this.selectedCategorie || c.id !== this.selectedCategorie.id),
    );

    if (existeDeja) {
      this.notification.error('⚠️ Une catégorie avec ce nom existe déjà.');
      // this.toastr.error('⚠️ Une catégorie avec ce nom existe déjà.', '', {
      //   positionClass: 'toast-custom-center',
      // });
      return;
    }

    if (this.selectedCategorie) {
      // ✏️ Modification
      this.categories = this.categories.map((c) =>
        c.id === this.selectedCategorie!.id
          ? {
              ...c,
              categorie: nom,
              description,
              approbation: approbationValue,
            }
          : c,
      );
    } else {
      // ➕ Ajout
      const nouvelleCategorie: Categorie = {
        id: this.categories.length
          ? Math.max(...this.categories.map((c) => c.id)) + 1
          : 1,
        categorie: nom,
        description,
        approbation: approbationValue,
      };

      this.categories = [...this.categories, nouvelleCategorie];
    }

    // 💾 Sauvegarde
    localStorage.setItem('categories', JSON.stringify(this.categories));

    this.updateResumer();
    this.closeAddCategorieModal();
    this.selectedCategorie = null;
  }

  /** ------------------------------
   * Suppression
   * ------------------------------ */
  deleteCategorie(categorie: Categorie) {
    if (
      confirm(
        `Voulez-vous vraiment supprimer la catégorie "${categorie.categorie}" ?`,
      )
    ) {
      this.categories = this.categories.filter((c) => c.id !== categorie.id);
      localStorage.setItem('categories', JSON.stringify(this.categories));
      this.updateResumer();
    }
  }

  /** ------------------------------
   * Gestion du modal
   * ------------------------------ */
  closeAddCategorieModal() {
    const modal = document.getElementById('addCategorieModal');
    if (modal)
      (window as any).bootstrap.Modal.getOrCreateInstance(modal).hide();
  }

  /** ------------------------------
   * Helpers
   * ------------------------------ */
  private resetCategorieForm() {
    (document.getElementById('addCatNom') as HTMLInputElement).value = '';
    (document.getElementById('addCatDesc') as HTMLInputElement).value = '';
    this.resetReglesCheckboxes();
    this.hideCategorieWarning();
  }

  private fillCategorieForm(categorie: Categorie) {
    (document.getElementById('addCatNom') as HTMLInputElement).value =
      categorie.categorie;
    (document.getElementById('addCatDesc') as HTMLInputElement).value =
      categorie.description;

    this.resetReglesCheckboxes();

    const regles = categorie.approbation.split(',').map((r) => r.trim());
    const checkboxes = document.querySelectorAll<HTMLInputElement>(
      'input[name="regleCatAdd[]"]',
    );
    checkboxes.forEach((cb) => {
      if (regles.includes(cb.value)) cb.checked = true;
    });
  }

  private resetReglesCheckboxes() {
    const checkboxes = document.querySelectorAll<HTMLInputElement>(
      'input[name="regleCatAdd[]"]',
    );
    checkboxes.forEach((cb) => (cb.checked = false));
  }

  private getInputValue(id: string): string {
    return (document.getElementById(id) as HTMLInputElement).value.trim();
  }

  private getCheckedRegles(): string[] {
    const regles: string[] = [];
    const checkboxes = document.querySelectorAll<HTMLInputElement>(
      'input[name="regleCatAdd[]"]:checked',
    );
    checkboxes.forEach((cb) => regles.push(cb.value));
    return regles;
  }

  private showCategorieModal() {
    const modal = document.getElementById('addCategorieModal');
    if (modal)
      (window as any).bootstrap.Modal.getOrCreateInstance(modal).show();
  }

  private showCategorieWarning() {
    const warning = document.getElementById('addCatWarning');
    if (warning) warning.style.display = 'block';
  }

  private hideCategorieWarning() {
    const warning = document.getElementById('addCatWarning');
    if (warning) warning.style.display = 'none';
  }

  saveComptes() {
    this.comptesSelected = true;
    localStorage.setItem('comptes', JSON.stringify(this.comptes));
    this.nextStep();
    this.updateResumer();
  }

  get comptesSelectionnes(): any[] {
    return this.comptes.filter((c) => c.isChecked);
  }

  onCheckChange(compte: any) {
    // Filtrer uniquement les comptes sélectionnés
    const comptesSelectionnes = this.comptes.filter((c) => c.isChecked);

    // Enregistrer dans localStorage
    localStorage.setItem(
      'listecomptesSelectioner',
      JSON.stringify(comptesSelectionnes),
    );

    // Mettre à jour le résumé si nécessaire
    this.updateResumer();
  }

  retirerCompte() {
    if (this.comptesSelectionnes.length === 0) return;

    // Récupérer le dernier compte sélectionné
    const compteARetirer =
      this.comptesSelectionnes[this.comptesSelectionnes.length - 1];

    // Le décocher
    const index = this.comptes.findIndex(
      (c) => c.compte === compteARetirer.compte,
    );

    if (index !== -1) {
      this.comptes[index].isChecked = false;
    }

    // Mettre à jour le localStorage avec uniquement les comptes cochés
    const comptesSelectionnes = this.comptes.filter((c) => c.isChecked);
    localStorage.setItem(
      'listecomptesSelectioner',
      JSON.stringify(comptesSelectionnes),
    );

    this.updateResumer();
  }

  goToStep(step: number) {
    const allowedSteps = [1, 2, 3, 4, 5];
    if (!allowedSteps.includes(step)) return;

    if (step === this.currentStep) return;

    this.currentStep = step;
  }

  canGoNextStep3(): boolean {
    return this.categories.length > 0;
  }

  canGoNextStep2(): boolean {
    if (this.validationConfigured === undefined) {
      // Sauvegarde les niveaux
      localStorage.setItem('niveaux', JSON.stringify(this.niveaux));

      // 🔥 Supprime les catégories du storage et de la mémoire
      localStorage.removeItem('categories');
      this.categories = []; // <= IMPORTANT

      this.updateResumer();
      return false;
    }

    if (this.validationConfigured === true) {
      // Si "Oui", il faut au moins un niveau ajouté
      return this.niveaux.length > 0;
    }

    // Si "Non", enlever les niveaux et catégories
    localStorage.removeItem('niveaux');
    localStorage.removeItem('categories');

    this.niveaux = [];
    this.categories = []; // <= IMPORTANT

    this.updateResumer();
    return true;
  }

  formatMontant(montant: number): string {
    if (montant === null || montant === undefined) return '';
    // Convertit le nombre en chaîne et ajoute des points tous les 3 chiffres
    return montant.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  lienSaisi: string = '';

  canGoNextStep5(): boolean {
    // Rien n'est coché
    if (this.validationConfiguredLien === undefined) {
      return false;
    }

    // Si "Oui", lienSaisi doit être rempli correctement
    if (this.validationConfiguredLien === true) {
      if (!this.lienSaisi || this.lienSaisi.trim() === '') {
        // Lien non saisi → on ne peut pas passer
        return false;
      }

      const trimmedLien = this.lienSaisi.trim();

      if (trimmedLien === 'https://' || trimmedLien === 'http://') {
        return false;
      }

      return true;
    }

    return true;
  }

  checkLien: boolean = false;
  loadingLienOrganisation: boolean = false;

  verifieLienOrganisation(callback?: () => void) {
    if (this.validationConfiguredLien === true) {
      this.loadingLienOrganisation = true;
      const lienNettoye = this.lienSaisi.replace(/^https?:\/\//, '');

      this.configurationPer.getVerifieLienOrganisation(lienNettoye).subscribe({
        next: (response) => {
          this.loadingLienOrganisation = false;
          if (response.status === 200) {
            this.checkLien = true;
            if (callback) callback();
          } else {
            this.checkLien = false;
            this.notification.error(response.message);
            // this.toastr.error(response.message, '', {
            //   positionClass: 'toast-custom-center',
            // });
          }
        },
        error: (err: any) => {
          this.loadingLienOrganisation = false;
          console.error('Erreur lors de la vérification du lien :', err);
          this.checkLien = false;
        },
      });
    }
  }

  nextStep() {
    // Vérifie l’étape 1
    if (this.currentStep === 1 && this.comptesSelectionnes.length === 0) {
      this.notification.error('Veuillez sélectionner au moins un compte.');

      // this.toastr.error('Veuillez sélectionner au moins un compte.', '', {
      //   positionClass: 'toast-custom-center',
      // });
      return;
    }

    // Vérifie l’étape 2
    if (this.currentStep === 2 && !this.canGoNextStep2()) {
      this.notification.error(
        'Veuillez configurer la validation multi-niveaux.',
      );
      // this.toastr.error(
      //   'Veuillez configurer la validation multi-niveaux.',
      //   '',
      //   { positionClass: 'toast-custom-center' },
      // );
      return;
    }

    // Vérifie l’étape 4
    if (this.currentStep === 4 && !this.canGoNextStep4Code()) {
      this.notification.error('Veuillez saisir le Code pin(transaction).');
      // this.toastr.error('Veuillez saisir le Code pin(transaction).', '', {
      //   positionClass: 'toast-custom-center',
      // });
      return;
    }

    // Vérifie l’étape 5 uniquement si validationConfiguredLien = true
    if (this.currentStep === 5 && this.validationConfiguredLien === true) {
      if (!this.lienSaisi || this.lienSaisi.trim() === '') {
        this.notification.error('Veuillez saisir le lien.');
        // this.toastr.error('Veuillez saisir le lien.', '', {
        //   positionClass: 'toast-custom-center',
        // });
        return;
      }

      this.verifieLienOrganisation(() => {
        // Cette fonction callback sera appelée quand le lien est validé
        if (this.checkLien) {
          this.advanceStep();
        }
      });
      return; // On sort de la fonction ici pour attendre la validation
    }

    // Sinon, on avance normalement
    this.advanceStep();
  }

  // Fonction pour avancer à l’étape suivante
  advanceStep() {
    if (this.currentStep < this.totalSteps) {
      this.stepsEnabled[this.currentStep + 1] = true;
      this.currentStep++;
    }
    this.updateResumer();
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  // =========================
  // 📌 MODALS
  // =========================

  trierNiveauxParHierarchie(): void {
    // Trier selon l’ordre métier
    this.niveaux.sort(
      (a, b) =>
        this.HIERARCHIE_ROLES.indexOf(a.vcRoleName) -
        this.HIERARCHIE_ROLES.indexOf(b.vcRoleName),
    );

    // Recalcul automatique des niveaux (1 à 5)
    this.niveaux.forEach((n, index) => {
      n.niveau = index + 1;
    });
  }

  showNiveauRetirerModal: boolean = false;

  niveauASupprimer: any = null;

  openAddModal(): void {
    this.isEditMode = false;
    this.niveauForm.reset({
      id: null,
      vcRoleName: '',
      vcDescription: '',
      min: null,
      max: null,
    });
    (document.getElementById('niveauModal') as any)?.showModal();
  }

  openEditModal(niveau: Niveau): void {
    this.isEditMode = true;

    const role = this.listeRoleNiveau.find(
      (r) => r.vcRoleName === niveau.vcRoleName,
    );

    this.niveauForm.patchValue({
      id: niveau.id,
      vcRoleName: role ? role.id : null,
      vcDescription: niveau.vcDescription,
      min: niveau.min,
      max: niveau.max,
    });

    (document.getElementById('niveauModal') as any)?.showModal();
  }

  saveNiveau(): void {
    if (this.niveauForm.invalid) {
      this.niveauForm.markAllAsTouched();
      return;
    }

    const formValue: any = this.niveauForm.value;

    if (formValue.max < formValue.min) {
      this.notification.error(
        'La valeur max ne doit pas être inférieure à la valeur min.',
      );
      // this.toastr.error(
      //   'La valeur max ne doit pas être inférieure à la valeur min.',
      //   '',
      //   { positionClass: 'toast-custom-center' },
      // );
      return;
    }

    const selectedRole = this.listeRoleNiveau.find(
      (r) => r.id === formValue.vcRoleName,
    );

    if (!selectedRole) {
      this.notification.error('Rôle invalide');
      // this.toastr.error('Rôle invalide');
      return;
    }

    formValue.vcRoleName = selectedRole.vcRoleName;
    formValue.idRole = selectedRole.id;

    // 🔥 Anti-doublon rôle
    const duplicateRole = this.niveaux.some(
      (n) => n.id !== formValue.id && n.vcRoleName === formValue.vcRoleName,
    );

    if (duplicateRole) {
      this.notification.error('Un niveau avec ce rôle existe déjà.');
      // this.toastr.error('Un niveau avec ce rôle existe déjà.', '', {
      //   positionClass: 'toast-custom-center',
      // });
      return;
    }

    if (this.isEditMode) {
      const index = this.niveaux.findIndex((n) => n.id === formValue.id);
      if (index !== -1) {
        this.niveaux[index] = {
          ...this.niveaux[index],
          ...formValue,
        };
      }
    } else {
      formValue.id = this.niveaux.length
        ? Math.max(...this.niveaux.map((n) => n.id)) + 1
        : 1;

      this.niveaux.push(formValue);
    }

    // 🔽 recalcul automatique
    this.trierNiveauxParHierarchie();

    localStorage.setItem('niveaux', JSON.stringify(this.niveaux));
    this.closeModal();
  }

  openNiveauRetirerModal(niveau: Niveau): void {
    this.niveauASupprimer = niveau;
    this.showNiveauRetirerModal = true;
  }

  closeNiveauRetirerModal(): void {
    this.showNiveauRetirerModal = false;
    this.niveauASupprimer = null;
  }

  confirmerSuppressionNiveau(): void {
    if (!this.niveauASupprimer) return;

    this.niveaux = this.niveaux.filter(
      (n) => n.id !== this.niveauASupprimer!.id,
    );

    this.trierNiveauxParHierarchie();

    localStorage.setItem('niveaux', JSON.stringify(this.niveaux));
    this.closeNiveauRetirerModal();
  }

  showCategorieRetirerModal: boolean = false;

  categorieRetirerSupprimer: any = null;

  openCategorieRetirerModal(categorie: any) {
    this.categorieRetirerSupprimer = categorie;
    this.showCategorieRetirerModal = true;
  }

  closeCategorieRetirerModal() {
    this.showCategorieRetirerModal = false;
    this.categorieRetirerSupprimer = null;
  }

  confirmerSuppressionCategorie() {
    if (!this.categorieRetirerSupprimer) return;

    this.categories = this.categories.filter(
      (n) => n.id !== this.categorieRetirerSupprimer.id,
    );

    localStorage.setItem('categories', JSON.stringify(this.categories));

    this.updateResumer();
    this.closeCategorieRetirerModal();
  }

  closeModal() {
    const dialog: any = document.getElementById('niveauModal');
    if (dialog) dialog.close();
  }

  updateResumer() {
    this.resumes = [
      {
        Section: 'Comptes Bancaires',
        Statut: `${this.comptesSelectionnes.length} compte(s) sélectionné(s)`,
      },
      {
        Section: 'Validation Multi-Niveaux',
        Statut: this.niveaux.length
          ? `${this.niveaux.length} niveau(x) configuré(s)`
          : 'Non configurée(s)',
      },
      {
        Section: 'Catégories',
        Statut: `${this.categories.length} catégorie(s) configurée(s)`,
      },
      {
        Section: 'Organisation',
        Statut: this.validationConfiguredLien
          ? `${this.lienSaisi}`
          : `Pas d'organisation`,
      },
      {
        Section: 'Sécurité',
        Statut: this.securites.length
          ? `${this.securites.length - 1} Sécurité configurée`
          : 'Non configurée',
      },
    ];
  }

  loadingFinal: boolean = false;

  addSouscriptionClient() {
    this.loadingFinal = true;
    // 1️⃣ Récupération depuis localStorage
    const vcJSONFullDetails = JSON.parse(
      localStorage.getItem('vcJSONFullDetails') || '{}',
    );
    const accounts = JSON.parse(
      localStorage.getItem('listecomptesSelectioner') || '[]',
    );
    const validationLevels = JSON.parse(
      localStorage.getItem('niveaux') || '[]',
    );
    const userSecurityOptions = JSON.parse(
      localStorage.getItem('userSecurityOptions') || '[]',
    );
    const paymentCategories = JSON.parse(
      localStorage.getItem('categories') || '[]',
    );

    // 2️⃣ Transformation des tableaux
    const formattedPaymentCategories = paymentCategories.map((cat: any) => ({
      nameCategorie: cat.categorie,
      descriptionCategorie: cat.description,
    }));

    const formattedValidationLevels = validationLevels.map((vl: any) => ({
      tiLevel: vl.id,
      iRoleID: Number(vl.idRole),
      vcDescription: vl.vcDescription,
      mAmountMin: vl.min,
      mAmountMax: vl.max,
    }));

    const formattedAccounts = accounts.map((acc: any) => ({
      compte: acc.compte,
      typ: acc.typ,
      nomCompte: acc.nomCompte,
      devise: acc.devise,
      posdisp: acc.posdisp,
      btBlocked: acc.isBlocked ? 1 : 0,
      vcBlockedStatus: acc.isBlockedDetails,
    }));

    console.log('formattedAccounts: ', formattedAccounts);

    // 3️⃣ Construction de l'objet client
    const client = {
      vcPersonalID: vcJSONFullDetails.clientDetails?.personalId || '',
      vcPersonalName: vcJSONFullDetails.clientDetails?.personalName || '',
      vcFirstName: vcJSONFullDetails.clientDetails?.firstname || '',
      vcLastName: vcJSONFullDetails.clientDetails?.lastname || '',
      vcPhoneNumber: vcJSONFullDetails.clientDetails?.phoneNbr || '',
      vcMobileNumber: vcJSONFullDetails.clientDetails?.mobileNbr || '',
      vcWorkNumber: vcJSONFullDetails.clientDetails?.workNbr || '',
      vcCity: vcJSONFullDetails.clientDetails?.ctyResidence || '',
      vcCountry: vcJSONFullDetails.clientDetails?.jurisdictionCountry || '',
      vcAddress: vcJSONFullDetails.clientDetails?.ctyFiscalResidence || '',
      btEnabled: 1,
      dtBirthDate: vcJSONFullDetails.clientDetails?.dateOfBirth || '',
      vcMotherName: vcJSONFullDetails.clientDetails?.motherName || '',
      vcEmail: vcJSONFullDetails.clientDetails?.mail || '',
      client: vcJSONFullDetails.clientDetails?.client || '',
      vcJSONFullDetails: vcJSONFullDetails,

    };

    // 4️⃣ Log général avant envoi
    // const payload = {
    //   client,
    //   accounts: formattedAccounts,
    //   validationLevels: formattedValidationLevels,
    //   paymentCategories: formattedPaymentCategories,
    //   userSecurityOptions,
    //   lien: this.validationConfiguredLien ? true : false,
    //   lienValue: this.validationConfiguredLien ? '' : this.lienSaisi,
    // };

    // console.log('💡 Payload complet pour addSouscription:', payload);

    // 5️⃣ Appel service
    this.configurationPer
      .addSouscription(
        client,
        formattedAccounts,
        formattedValidationLevels,
        formattedPaymentCategories,
        userSecurityOptions,
        this.validationConfiguredLien ? 1 : 0,
        this.validationConfiguredLien ? this.lienSaisi : '0',
        this.modeEnvoiOtp,
      )
      .subscribe({
        next: (res) => {
          if (res.status === 200) {
            this.loadingFinal = false;
            this.notification.success(res.message);
            // this.toastr.success(res.message, '', {
            //   positionClass: 'toast-custom-center',
            // });
            this.router.navigate(['/login']);
            console.log('Souscription OK', res);
            localStorage.removeItem('niveaux');
            localStorage.removeItem('categories');
            localStorage.removeItem('clientDetails');
            localStorage.removeItem('comptes');
            localStorage.removeItem('listComptes');
            localStorage.removeItem('listecomptesSelectioner');
            localStorage.removeItem('userSecurityOptions');
            localStorage.removeItem('vcJSONFullDetails');
            localStorage.removeItem('msisdn');
          } else {
            this.loadingFinal = false;
            this.notification.error(res.message);

            // this.toastr.error(res.message, '', {
            //   positionClass: 'toast-custom-center',
            // });
            // console.log('Souscription OK', res);
          }
        },
        error: (err) => {
          this.loadingFinal = false;
          this.notification.error('Une erreur interne est survenue.');

          // this.toastr.error(err.message, '', {
          //   positionClass: 'toast-custom-center',
          // });
          // console.error('Erreur souscription', err);
        },
      });
  }


  toggleSelection(compte: any) {
  compte.isChecked = !compte.isChecked;
  this.onCheckChange(compte); // garde ton comportement existant
}
}
