
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { TBankTarget, IBeneficiaire } from '../model/ordre-transfert.model';
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
  private fb = inject(FormBuilder);
  private transferService = inject(OrdreTransfertInternationalService);

  @Input() isOpenModal = false;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() importDataCompleted = new EventEmitter<any>();

  // --- ÉTAT GLOBAL & NAVIGATION ---
  transfertForm!: FormGroup;
  currentStep = 1;
  stepTitles = ["DONNEUR D'ORDRE", 'OPÉRATION', 'BÉNÉFICIAIRE', 'APERÇU'];
  today = new Date();

  // --- ÉTAT FONCTIONNEL ---
  isLoadingSwift = false;
  showSwiftModal = false;
  tempSwiftData: any = null;
  tempSwiftTarget: TBankTarget = 'beneficiaire';
  swiftError = '';

  modeSelection: 'existant' | 'nouveau' = 'existant';
  memeCompteCommission = false;
  searchTerm = '';
  isDropdownOpen = false;
  beneficiaires: IBeneficiaire[] = [];

  listeMesComptes = [
    { numero: '224-001-998877-01', libelle: 'Compte Principal' },
    { numero: '224-001-445566-02', libelle: 'Compte Business' },
  ];

  ngOnInit(): void {
    this.initForm();
    this.setupFormSubscriptions();
    this.loadBeneficiaires();
  }

  // --- INITIALISATION & API ---
  loadBeneficiaires() {
    this.transferService.getBeneficiairesActive().subscribe({
      next: (response) => (this.beneficiaires = response.data || []),
      error: (err) => console.error('Erreur chargement bénéficiaires', err),
    });
  }

  initForm(): void {
    const nonEmpty = [Validators.required, Validators.pattern(/.*[\S]+.*/)];
    const swiftVal = [
      ...nonEmpty,
      Validators.minLength(8),
      Validators.maxLength(11),
    ];

    this.transfertForm = this.fb.group({
      raisonSocialeDO: ['', nonEmpty],
      adresseDO: ['', nonEmpty],
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
      adresseB: ['', nonEmpty],
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

  private setupFormSubscriptions(): void {
    const tCtrl = this.transfertForm.get('compteTransfert');
    const cCtrl = this.transfertForm.get('compteCommission');

    if (cCtrl?.value === tCtrl?.value && tCtrl?.value !== '') {
      this.memeCompteCommission = true;
      cCtrl?.disable();
    }

    tCtrl?.valueChanges.subscribe((val) => {
      if (this.memeCompteCommission) cCtrl?.setValue(val, { emitEvent: false });
    });
  }

  // --- GESTION DES BÉNÉFICIAIRES ---
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
    this.transfertForm.patchValue({
      raisonSocialeB: b.vcName || b.raisonSocialeB,
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

  // --- LOGIQUE MÉTIER ADDITIONNELLE (Radio, Focus, File) ---
  onRadioChange(): void {
    this.transfertForm.get('autreTypeTransaction')?.setValue('');
  }

  onAutreFocus(): void {
    this.transfertForm.get('typeTransaction')?.setValue('');
  }

  onFileChange(event: any, controlName: string): void {
    const file = event.target.files[0];
    const control = this.transfertForm.get(controlName);

    if (file) {
      const maxSize = 5 * 1024 * 1024;
      const allowedTypes = ['application/pdf'];

      if (!allowedTypes.includes(file.type)) {
        control?.setErrors({ invalidFormat: true });
      } else if (file.size > maxSize) {
        control?.setErrors({ maxSize: true });
      } else {
        control?.setValue(file);
        control?.setErrors(null);
      }
      control?.markAsTouched();
    } else {
      control?.setValue(null);
    }
  }

  // --- GESTION SWIFT ---
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
        const bank = response?.data ? response.data : response;
        this.isLoadingSwift = false;
        if (bank && (bank.vcName || bank.bankName)) {
          this.tempSwiftData = {
            vcName: bank.vcName || bank.bankName,
            vcBIC: code,
            address: bank.vcAddress || bank.address || '',
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
    if (isBenef && this.tempSwiftData.address)
      this.transfertForm.patchValue({ adresseB: this.tempSwiftData.address });
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

  // --- NAVIGATION ---
  onToggleCommission(): void {
    const ctrl = this.transfertForm.get('compteCommission');
    if (this.memeCompteCommission) {
      ctrl?.setValue(this.transfertForm.get('compteTransfert')?.value || '', {
        emitEvent: false,
      });
      ctrl?.disable();
    } else {
      ctrl?.enable();
    }
  }

  nextStep(): void {
    if (this.isStepValid(this.currentStep)) {
      if (this.currentStep < 4) {
        this.currentStep++;
        if (this.currentStep === 4) this.generateReference();
      }
    } else {
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
          c['raisonSocialeDO'].valid &&
          c['adresseDO'].valid &&
          c['montant'].valid &&
          c['compteTransfert'].valid &&
          (this.memeCompteCommission || c['compteCommission'].valid)
        );
      case 2:
        return c['motifEconomique'].valid;
      case 3:
        return (
          c['raisonSocialeB'].valid &&
          c['adresseB'].valid &&
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
      1: [
        'raisonSocialeDO',
        'adresseDO',
        'compteTransfert',
        'compteCommission',
        'montant',
      ],
      2: ['motifEconomique'],
      3: [
        'raisonSocialeB',
        'adresseB',
        'ibanNCompte',
        'bankBeneficiaire',
        'swifiBankBeneficiaire',
      ],
    };
    steps[step]?.forEach((f) => this.transfertForm.get(f)?.markAsTouched());
  }

  private generateReference(): void {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    this.transfertForm.patchValue({
      refDocument: `TR-${date}-${Math.floor(1000 + Math.random() * 9000)}`,
    });
  }

  validateTransactions(): void {
    if (this.transfertForm.valid) {
      this.importDataCompleted.emit(this.transfertForm.getRawValue());
      this.closeModal();
    } else {
      this.transfertForm.markAllAsTouched();
    }
  }

  closeModal(): void {
    this.currentStep = 1;
    this.transfertForm.reset({ devise: 'GNF', fraisEtranger: 'Partager' });
    this.modalClosed.emit();
  }

  get f() {
    return this.transfertForm.controls;
  }
}