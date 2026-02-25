import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { TBankTarget, IBeneficiaire } from '../model/ordre-transfert.model';
import { AuthService } from '../../../services/authServices/auth.service';
import { SwiftDetailsModalComponent } from '../swift-details-modal/swift-details-modal.component';
import { OrdreTransfertInternationalService } from '../../../servicesNodes/ordreTransfertInternational/ordre-transfert-international.service';

@Component({
  selector: 'app-ordre-transfert-international',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SwiftDetailsModalComponent,
  ],
  templateUrl: './ordre-transfert-international.component.html',
})
export class OrdreTransfertInternationalComponent implements OnInit {
  // --- INJECTIONS & PROPRIÉTÉS ---
  private fb = inject(FormBuilder);
  private transferService = inject(OrdreTransfertInternationalService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  protected readonly Validators = Validators;

  @Input() isOpenModal = false;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() importDataCompleted = new EventEmitter<any>();

  // --- ÉTAT DU FORMULAIRE & NAVIGATION ---
  transfertForm!: FormGroup;
  currentStep = 1;
  stepTitles = ["DONNEUR D'ORDRE", 'OPÉRATION', 'BÉNÉFICIAIRE', 'APERÇU'];
  today = new Date();
  isSubmitting = false;
  // --- ÉTAT FINANCIER & RÉGLEMENTAIRE ---
  readonly LIMIT_DDI_GNF = 500000;
  insuffisantBalance: boolean = false;
  exchangeRate: number = 0;
  convertedAmount: number = 0;
  accountCurrency: string = 'GNF';
  beneficiaryCurrency: string = '';
  selectedAccountDetails: any = null;
  listeMesComptes: any[] = [];

  // --- ÉTAT SWIFT & BÉNÉFICIAIRES ---
  isLoadingSwift = false;
  showSwiftModal = false;
  tempSwiftData: any = null;
  tempSwiftTarget: TBankTarget = 'beneficiaire';
  swiftError = '';
  modeSelection: 'existant' | 'nouveau' = 'existant';
  searchTerm = '';
  isDropdownOpen = false;
  beneficiaires: IBeneficiaire[] = [];

  // ==========================================
  // 1. CYCLE DE VIE ET INITIALISATION
  // ==========================================

  ngOnInit(): void {
    this.initForm();
    this.setupConversionLogic();
    this.loadBeneficiaires();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpenModal']?.currentValue === true) {
      this.fetchOrganisationComptes();
    }
  }

  initForm(): void {
    const nonEmpty = [Validators.required, Validators.pattern(/.*[\S]+.*/)];
    const swiftVal = [
      ...nonEmpty,
      Validators.minLength(8),
      Validators.maxLength(11),
    ];

    this.transfertForm = this.fb.group({
      raisonSocialeDO: [{ value: '', disabled: true }],
      adresseDO: [{ value: '', disabled: true }],
      compteTransfert: ['', Validators.required],
      compteCommission: ['', Validators.required],
      devise: ['GNF', Validators.required],
      fraisEtranger: ['Partager', Validators.required],
      montant: [null, [Validators.required, Validators.min(1)]],
      motifEconomique: ['', nonEmpty],
      refDocument: [''],
      typeTransaction: ['Importation marchandises'],
      autreTypeTransaction: [''],
      raisonSocialeB: ['', nonEmpty],
      adresseB: [''],
      ibanNCompte: ['', nonEmpty],
      bankBeneficiaire: ['', nonEmpty],
      swifiBankBeneficiaire: ['', swiftVal],
      bankIntermediaire: [''],
      swifibankIntermediaire: [
        '',
        [Validators.minLength(8), Validators.maxLength(11)],
      ],
      ddiFile: [null],
      assuranceFile: [null],
    });
  }

  // ==========================================
  // 2. LOGIQUE DE NAVIGATION
  // ==========================================

  nextStep(): void {
    if (this.isStepValid(this.currentStep) && !this.insuffisantBalance) {
      if (this.currentStep < 4) {
        this.currentStep++;
        if (this.currentStep === 4) this.generateReference();
      }
    } else {
      if (this.insuffisantBalance) {
        this.toastr.warning(
          'Action impossible : Solde insuffisant sur le compte sélectionné.',
        );
      }
      this.markStepAsTouched(this.currentStep);
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  public isStepValid(step: number): boolean {
    const c = this.transfertForm.controls;
    switch (step) {
      case 1:
        return (
          c['montant'].valid &&
          c['compteTransfert'].valid &&
          c['compteCommission'].valid &&
          !this.insuffisantBalance
        );
      case 2:
        return (
          c['motifEconomique'].valid &&
          c['ddiFile'].valid &&
          c['assuranceFile'].valid
        );
      case 3:
        return (
          c['raisonSocialeB'].valid &&
          c['ibanNCompte'].valid &&
          c['bankBeneficiaire'].valid &&
          c['swifiBankBeneficiaire'].valid
        );
      default:
        return true;
    }
  }

  private markStepAsTouched(step: number): void {
    const steps: Record<number, string[]> = {
      1: ['compteTransfert', 'compteCommission', 'montant'],
      2: ['motifEconomique'],
      3: [
        'raisonSocialeB',
        'ibanNCompte',
        'bankBeneficiaire',
        'swifiBankBeneficiaire',
      ],
    };
    steps[step]?.forEach((f) => this.transfertForm.get(f)?.markAsTouched());
  }

  closeModal(): void {
    this.currentStep = 1;
    this.transfertForm.reset({ devise: 'GNF', fraisEtranger: 'Partager' });
    this.modalClosed.emit();
  }

  // ==========================================
  // 3. LOGIQUE FINANCIÈRE & RÉGLEMENTAIRE
  // ==========================================

  private setupConversionLogic(): void {
    this.transfertForm
      .get('compteTransfert')
      ?.valueChanges.subscribe((accNumber) => {
        if (accNumber) {
          this.transferService.getAccountInfo(accNumber).subscribe({
            next: (res) => {
              // Grace au service, si on arrive ici, res.data existe et status est OK
              this.selectedAccountDetails = res.data;
              this.accountCurrency = res.data.devise || 'GNF';
              this.transfertForm
                .get('devise')
                ?.patchValue(this.accountCurrency);
              this.updateExchangeRate();
            },
            error: () => {
              this.selectedAccountDetails = null;
              this.checkBalance();
            },
          });
        }
      });

    this.transfertForm
      .get('typeTransaction')
      ?.valueChanges.subscribe(() => this.updateFileRequirements());
    this.transfertForm
      .get('autreTypeTransaction')
      ?.valueChanges.subscribe(() => this.updateFileRequirements());
    this.transfertForm
      .get('devise')
      ?.valueChanges.subscribe(() => this.updateExchangeRate());
    this.transfertForm
      .get('montant')
      ?.valueChanges.subscribe(() => this.updateExchangeRate());
  }

  updateExchangeRate() {
    const targetCurrency = this.transfertForm.get('devise')?.value;
    const amount = this.transfertForm.get('montant')?.value;
    if (!amount || !this.selectedAccountDetails) {
      this.insuffisantBalance = false;
      this.convertedAmount = 0;
      return;
    }
    if (this.accountCurrency === targetCurrency) {
      this.exchangeRate = 1;
      this.convertedAmount = amount;
      this.processRegulatoryChecks(amount);
    } else {
      this.transferService
        .getCurrencyRate(this.accountCurrency, targetCurrency)
        .subscribe({
          next: (res) => {
            this.exchangeRate = res.data.nRate;
            this.convertedAmount = amount * this.exchangeRate;
            this.processRegulatoryChecks(amount);
          },
        });
    }
  }

  private processRegulatoryChecks(originalAmount: number) {
    if (this.accountCurrency === 'GNF') {
      this.applyFileRules(originalAmount);
    } else {
      this.transferService
        .getCurrencyRate(this.accountCurrency, 'GNF')
        .subscribe({
          next: (res) => {
            const amountInGNF = originalAmount * res.data.nRate;
            this.applyFileRules(amountInGNF);
          },
          error: () => this.applyFileRules(0),
        });
    }
    this.checkBalance();
  }

  private checkBalance(): void {
    const montantCtrl = this.transfertForm.get('montant');
    if (!montantCtrl || !this.selectedAccountDetails) return;
    const montantSaisi = montantCtrl.value || 0;
    const soldeDisp = this.selectedAccountDetails.soldeDisp;
    this.insuffisantBalance = montantSaisi > soldeDisp;
    const currentErrors = { ...montantCtrl.errors };
    delete currentErrors['insuffisant'];
    if (this.insuffisantBalance) {
      montantCtrl.setErrors({ ...currentErrors, insuffisant: true });
    } else {
      const finalErrors =
        Object.keys(currentErrors).length > 0 ? currentErrors : null;
      montantCtrl.setErrors(finalErrors);
    }
  }

  // ==========================================
  // 4. GESTION DES FICHIERS & RÈGLES DDI
  // ==========================================

  private updateFileRequirements(): void {
    const amount = this.transfertForm.get('montant')?.value || 0;
    this.processRegulatoryChecks(amount);
  }

  private applyFileRules(amountInGNF: number) {
    const typeT = this.transfertForm.get('typeTransaction')?.value;
    const autreT = this.transfertForm.get('autreTypeTransaction')?.value;

    const ddiCtrl = this.transfertForm.get('ddiFile');
    const assuCtrl = this.transfertForm.get('assuranceFile');

    const isValueOverLimit = amountInGNF > this.LIMIT_DDI_GNF;
    const isAutreTypeFilled = autreT && autreT.trim() !== '';

    if (isValueOverLimit || isAutreTypeFilled) {
      ddiCtrl?.setValidators([Validators.required]);
    } else {
      ddiCtrl?.clearValidators();
      ddiCtrl?.setErrors(null);
    }

    if (typeT === 'Importation marchandises') {
      assuCtrl?.setValidators([Validators.required]);
    } else {
      assuCtrl?.clearValidators();
      assuCtrl?.setErrors(null);
    }
    ddiCtrl?.updateValueAndValidity({ emitEvent: false });
    assuCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  onFileChange(event: any, controlName: string): void {
    const file = event.target.files[0];
    const control = this.transfertForm.get(controlName);
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.type !== 'application/pdf') {
        control?.setErrors({ invalidFormat: true });
      } else if (file.size > maxSize) {
        control?.setErrors({ maxSize: true });
      } else {
        control?.setValue(file);
        control?.setErrors(null);
      }
    } else {
      control?.setValue(null);
    }
    control?.markAsTouched();
    this.updateFileRequirements();
  }

  // ==========================================
  // 5. GESTION BÉNÉFICIAIRES & DONNEUR D'ORDRE
  // ==========================================

  fetchOrganisationComptes(): void {
    const user = this.authService.userInfo();
    if (!user || !user.iOrganisationID) {
      this.toastr.error('Session utilisateur invalide');
      return;
    }

    this.transferService.getInfoOrganisation(user.iOrganisationID).subscribe({
      next: (response) => {
        if (response.data && response.data.length > 0) {
          const orgData = response.data[0];
          this.transfertForm.patchValue({
            raisonSocialeDO: orgData.raisonSocial || '',
            adresseDO: orgData.vcAddress || '',
          });

          this.listeMesComptes = orgData.comptes.map((c: any) => ({
            numero: c.vcAccountNumber,
            libelle: c.vcAccountName,
            devise: c.vcCurrency,
            solde: c.mBalance,
          }));

          if (this.listeMesComptes.length > 0) {
            this.transfertForm
              .get('compteTransfert')
              ?.setValue(this.listeMesComptes[0].numero);
          }
        }
      },
    });
  }

  loadBeneficiaires() {
    this.transferService.getBeneficiairesActive().subscribe({
      next: (response) => (this.beneficiaires = response.data || []),
    });
  }

  get filteredBeneficiaires(): IBeneficiaire[] {
    if (!Array.isArray(this.beneficiaires)) return [];
    const search = (this.searchTerm || '').trim().toLowerCase();
    return !search
      ? this.beneficiaires.slice(0, 3)
      : this.beneficiaires.filter(
          (b) =>
            b.vcName?.toLowerCase().includes(search) ||
            b.vcAccountNumber?.toLowerCase().includes(search) ||
            b.vcBIC?.toLowerCase().includes(search),
        );
  }

  selectAndClear(b: IBeneficiaire): void {
    this.searchTerm = b.vcBIC || '';
    this.isDropdownOpen = false;
    this.modeSelection = 'existant';
    this.beneficiaryCurrency = b.vcCurrency || '';

    const fullName = [b.vcLastName, b.vcFirstName].filter(Boolean).join(' ');
    this.transfertForm.patchValue({
      raisonSocialeB: fullName || b.vcName,
      adresseB: b.vcAddress || '',
      ibanNCompte: b.vcAccountNumber || '',
      swifiBankBeneficiaire: b.vcBIC || '',
      swifibankIntermediaire: b.swifibankIntermediaire || '',
    });

    if (b.vcBIC) this.executeSwiftCheck(b.vcBIC, 'beneficiaire');
  }

  resetBeneficiaireMode(): void {
    this.modeSelection = 'nouveau';
    this.searchTerm = '';
    this.clearBeneficiaireFields();
  }

  clearBeneficiaireFields(): void {
    this.transfertForm.patchValue({
      raisonSocialeB: '',
      adresseB: '',
      ibanNCompte: '',
      bankBeneficiaire: '',
      swifiBankBeneficiaire: '',
      bankIntermediaire: '',
      swifibankIntermediaire: '',
    });
  }

  closeDropdownWithDelay(): void {
    setTimeout(() => (this.isDropdownOpen = false), 250);
  }

  // ==========================================
  // 6. GESTION SWIFT
  // ==========================================

  onSwiftChange(event: any, target: TBankTarget): void {
    const code = event.target.value.trim().toUpperCase();
    if (code.length >= 8) this.executeSwiftCheck(code, target);
  }

  private executeSwiftCheck(code: string, target: TBankTarget): void {
    if (!code || code.length < 8) return;
    this.isLoadingSwift = true;
    this.tempSwiftTarget = target;
    this.swiftError = '';

    this.transferService.getSwiftDetails(code).subscribe({
      next: (response: any) => {
        this.isLoadingSwift = false;
        const bank = response?.data || response;
        if (bank && bank.vcName) {
          this.tempSwiftData = {
            vcName: bank.vcName,
            bankName: bank.bankName,
            vcBIC: code,
            vcAddress1: bank.vcAddress1,
            vcAddress2: bank.vcAddress2,
            vcCity: bank.vcCity,
            vcCountry: bank.vcCountry,
          };
          this.showSwiftModal = true;
        } else {
          this.handleSwiftError(
            'Aucune information disponible pour ce code SWIFT.',
          );
        }
      },
      error: (err) => {
        this.isLoadingSwift = false;
        this.handleSwiftError(
          err.status === 404
            ? 'Code BIC introuvable.'
            : 'Erreur de vérification.',
        );
      },
    });
  }

  confirmBankInfo(): void {
    if (!this.tempSwiftData) return;
    const isBenef = this.tempSwiftTarget === 'beneficiaire';
    const isoCode = this.tempSwiftData.vcBIC.substring(4, 6).toLowerCase();
    this.isLoadingSwift = true;

    this.transferService.getCountryName(isoCode).subscribe({
      next: (res) => {
        const country = res?.[1]?.[0]?.name;
        this.applyFinalData(
          isBenef,
          `${this.tempSwiftData.vcName} (${country?.toUpperCase() || isoCode.toUpperCase()})`,
        );
      },
      error: () =>
        this.applyFinalData(
          isBenef,
          `${this.tempSwiftData.vcName} (${isoCode.toUpperCase()})`,
        ),
    });
  }

  private applyFinalData(isBenef: boolean, formattedName: string): void {
    const field = isBenef ? 'bankBeneficiaire' : 'bankIntermediaire';
    this.transfertForm.patchValue({ [field]: formattedName });
    if (isBenef && this.tempSwiftData.vcAddress) {
      this.transfertForm.patchValue({ adresseB: this.tempSwiftData.vcAddress });
    }
    this.isLoadingSwift = false;
    this.showSwiftModal = false;
    this.tempSwiftData = null;
  }

  private handleSwiftError(message: string): void {
    this.swiftError = message;
    this.showSwiftModal = true;
    this.tempSwiftData = null;
    const field =
      this.tempSwiftTarget === 'beneficiaire'
        ? 'bankBeneficiaire'
        : 'bankIntermediaire';
    this.transfertForm.get(field)?.setValue('');
  }

  // ==========================================
  // 7. ACTIONS FINALES ET UTILITAIRES
  // ==========================================

  onRadioChange(): void {
    this.transfertForm.get('autreTypeTransaction')?.setValue('');
  }

  onAutreFocus(): void {
    this.transfertForm.get('typeTransaction')?.setValue('');
  }

  private generateReference(): void {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    this.transfertForm.patchValue({
      refDocument: `TR-${date}-${Math.floor(1000 + Math.random() * 9000)}`,
    });
  }

  // validateTransactions(): void {
  //   if (this.transfertForm.invalid) {
  //     this.transfertForm.markAllAsTouched();
  //     this.toastr.error(
  //       'Veuillez remplir correctement tous les champs obligatoires',
  //     );
  //     return;
  //   }

  //   this.isSubmitting = true;
  //   const rawValue = this.transfertForm.getRawValue();
  //   const user = this.authService.userInfo();
  //   const typeService =
  //     rawValue.typeTransaction === 'Autre'
  //       ? rawValue.autreTypeTransaction
  //       : rawValue.typeTransaction;

  //   // Préparation du FormData (1er appel)
  //   const formData = new FormData();
  //   formData.append('vcSenderName', rawValue.raisonSocialeDO);
  //   formData.append('vcSenderAccount', rawValue.compteTransfert);
  //   formData.append('vcSenderFullAddress', rawValue.adresseDO);
  //   formData.append('vcReceiverAccount', rawValue.ibanNCompte);
  //   formData.append('vcReceiverName', rawValue.raisonSocialeB);
  //   formData.append('vcReceiverBICCode', rawValue.swifiBankBeneficiaire);
  //   formData.append('vcReceiverFullAddress', rawValue.adresseB);
  //   formData.append('vcSenderCurrency', this.accountCurrency);
  //   formData.append(
  //     'vcReceiverCurrency',
  //     this.modeSelection === 'existant'
  //       ? this.beneficiaryCurrency
  //       : rawValue.devise,
  //   );
  //   formData.append('vcCurrency', rawValue.devise);
  //   formData.append('mAmount', rawValue.montant);
  //   formData.append(
  //     'iOrganisationID',
  //     user?.iOrganisationID?.toString() || 'NON_DEFINI',
  //   );
  //   formData.append('iUserID', user?.id?.toString() || 'NON_DEFINI');
  //   formData.append('vcEconomicReason', rawValue.motifEconomique);
  //   formData.append('vcReceiverBankName', rawValue.bankBeneficiaire);
  //   formData.append('vcCorrespBankName', rawValue.bankIntermediaire || '');
  //   formData.append('vcCorrespBICCode', rawValue.swifibankIntermediaire || '');
  //   formData.append('vcFeeType', rawValue.fraisEtranger);
  //   formData.append('vcTypeService', typeService);
  //   formData.append('vcCommissionAccount', rawValue.compteCommission);
  //   formData.append('vcDocumentReference', rawValue.refDocument);

  //   if (rawValue.ddiFile instanceof File)
  //     formData.append('vcDocumentDDI', rawValue.ddiFile);
  //   if (rawValue.assuranceFile instanceof File)
  //     formData.append('vcDocumentInsurance', rawValue.assuranceFile);

  //   // --- ÉXECUTION ---
  //   this.transferService.createTransfert(formData).subscribe({
  //     next: (response) => {
  //       // Si on est ici, c'est que status === 200
  //       const secondPayload = {
  //         vcPayerName: rawValue.raisonSocialeDO,
  //         dtPaymentDate: new Date().toISOString().split('T')[0],
  //         vcPaymentReference: response?.data?.reference,
  //         vcPayerAccount: rawValue.compteTransfert,
  //         vcBenefName: rawValue.raisonSocialeB,
  //         vcBenefAccount: rawValue.ibanNCompte,
  //         vcBenefBicCode: rawValue.swifiBankBeneficiaire,
  //         mAmount: rawValue.montant,
  //         vcBenefCurrency:
  //           this.modeSelection === 'existant'
  //             ? this.beneficiaryCurrency
  //             : rawValue.devise,
  //         vcCorrespBicCode: rawValue.swifibankIntermediaire || '',
  //         iTransactionID: response?.data?.transaction_id,
  //       };

  //       this.transferService
  //         .validateTransactionInterneExterne(secondPayload)
  //         .subscribe({
  //           next: (finalRes) => {
  //             this.toastr.success('Transfert international validé avec succès');
  //             this.importDataCompleted.emit(finalRes);
  //             this.isSubmitting = false;
  //             this.closeModal();
  //           },
  //           error: () => (this.isSubmitting = false),
  //         });
  //     },
  //     error: () => (this.isSubmitting = false),
  //   });
  // }

  validateTransactions(): void {
    if (this.transfertForm.invalid) {
      this.transfertForm.markAllAsTouched();
      this.toastr.error(
        'Veuillez remplir correctement tous les champs obligatoires',
      );
      return;
    }

    this.isSubmitting = true;
    const rawValue = this.transfertForm.getRawValue();
    const user = this.authService.userInfo();
    const typeService =
      rawValue.typeTransaction === 'Autre'
        ? rawValue.autreTypeTransaction
        : rawValue.typeTransaction;

    // Préparation du FormData (1er appel)
    const formData = new FormData();
    formData.append('vcSenderName', rawValue.raisonSocialeDO);
    formData.append('vcSenderAccount', rawValue.compteTransfert);
    formData.append('vcSenderFullAddress', rawValue.adresseDO);
    formData.append('vcReceiverAccount', rawValue.ibanNCompte);
    formData.append('vcReceiverName', rawValue.raisonSocialeB);
    formData.append('vcReceiverBICCode', rawValue.swifiBankBeneficiaire);
    formData.append('vcReceiverFullAddress', rawValue.adresseB);
    formData.append('vcSenderCurrency', this.accountCurrency);
    formData.append(
      'vcReceiverCurrency',
      this.modeSelection === 'existant'
        ? this.beneficiaryCurrency
        : rawValue.devise,
    );
    formData.append('vcCurrency', rawValue.devise);
    formData.append('mAmount', rawValue.montant);
    formData.append(
      'iOrganisationID',
      user?.iOrganisationID?.toString() || 'NON_DEFINI',
    );
    formData.append('iUserID', user?.id?.toString() || 'NON_DEFINI');
    formData.append('vcEconomicReason', rawValue.motifEconomique);
    formData.append('vcReceiverBankName', rawValue.bankBeneficiaire);
    formData.append('vcCorrespBankName', rawValue.bankIntermediaire || '');
    formData.append('vcCorrespBICCode', rawValue.swifibankIntermediaire || '');
    formData.append('vcFeeType', rawValue.fraisEtranger);
    formData.append('vcTypeService', typeService);
    formData.append('vcCommissionAccount', rawValue.compteCommission);
    formData.append('vcDocumentReference', rawValue.refDocument);

    if (rawValue.ddiFile instanceof File)
      formData.append('vcDocumentDDI', rawValue.ddiFile);
    if (rawValue.assuranceFile instanceof File)
      formData.append('vcDocumentInsurance', rawValue.assuranceFile);

    // LOG DU PREMIER APPEL (FormData)
    console.log('--- DONNEES ENVOYEES (APPEL 1: FormData) ---');
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

    // --- ÉXECUTION ---
    this.transferService.createTransfert(formData).subscribe({
      next: (response) => {
        console.log('REPONSE APPEL 1:', response);

        const secondPayload = {
          vcPayerName: rawValue.raisonSocialeDO,
          dtPaymentDate: new Date().toISOString().split('T')[0],
          vcPaymentReference: response?.data?.reference,
          vcPayerAccount: rawValue.compteTransfert,
          vcBenefName: rawValue.raisonSocialeB,
          vcBenefAccount: rawValue.ibanNCompte,
          vcBenefBicCode: rawValue.swifiBankBeneficiaire,
          mAmount: rawValue.montant,
          vcBenefCurrency:
            this.modeSelection === 'existant'
              ? this.beneficiaryCurrency
              : rawValue.devise,
          vcCorrespBicCode: rawValue.swifibankIntermediaire || '',
          iTransactionID: response?.data?.transaction_id,
        };

        // LOG DU SECOND APPEL (JSON)
        console.log('--- DONNEES ENVOYEES (APPEL 2: JSON) ---', secondPayload);

        this.transferService
          .validateTransactionInterneExterne(secondPayload)
          .subscribe({
            next: (finalRes) => {
              console.log('REPONSE FINALE:', finalRes);
              this.toastr.success('Transfert international validé avec succès');
              this.importDataCompleted.emit(finalRes);
              this.isSubmitting = false;
              this.closeModal();
            },
            error: (err) => {
              console.error('ERREUR APPEL 2:', err);
              this.isSubmitting = false;
            },
          });
      },
      error: (err) => {
        console.error('ERREUR APPEL 1:', err);
        this.isSubmitting = false;
      },
    });
  }

  get f() {
    return this.transfertForm.controls;
  }
}
