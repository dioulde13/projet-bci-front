import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { MobileMoneyService } from '../../../servicesNodes/modePaiementOperateur/mobileMoney/mobile-money.service';
import { GetAccountNameService } from '../../../servicesNodes/verifierNomDebiteur/get-account-name.service';
import { GnfNumberFormatDirective } from '../../../directives/gnf-number-format.directive';
import { NotificationService } from '../../../services/notification/notification.service';

// ── Validateur personnalisé : préfixe téléphone selon opérateur ──────────────
function telephoneOperateurValidator(
  getOperateur: () => string | null,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value) return null;

    const operateur = getOperateur()?.toUpperCase();

    const prefixesOrange = ['622', '621', '623', '611', '612', '613'];
    const prefixesMTN = ['666', '662', '661', '663', '664'];

    const prefixesAutorises =
      operateur === 'ORANGE MONEY'
        ? prefixesOrange
        : operateur === 'MOBILE MONEY'
          ? prefixesMTN
          : [];

    if (prefixesAutorises.length === 0) return null;

    const prefixeValide = prefixesAutorises.some((p) => value.startsWith(p));

    return prefixeValide
      ? null
      : { prefixeInvalide: { operateur, valeur: value } };
  };
}

@Component({
  selector: 'app-formulaire-mode-paiement',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    GnfNumberFormatDirective,
  ],
  templateUrl: './formulaire-mode-paiement.component.html',
  styleUrl: './formulaire-mode-paiement.component.css',
})
export class FormulaireModePaiementComponent implements OnInit {
  userInfo: any;
  idOrganisation!: number;

  orangeMoneyForm!: FormGroup;
  mobileMoneyForm!: FormGroup;

  // ── Validation instantanée téléphone ─────────────────────────────────────
  telephoneError: string = '';
  telephoneSuccess: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private listeCompteCLientService: DashboardService,
    private mobileMoneyService: MobileMoneyService,
    private notification: NotificationService,
    private getAccount: GetAccountNameService,
    private router: Router,
  ) {}

  private getUserInfo(): void {
    const user = localStorage.getItem('userInfo');
    if (user) {
      this.userInfo = JSON.parse(user);
      this.idOrganisation = this.userInfo.iOrganisationID;
    }
  }

  listeOperateur: any[] = [];
  operateur: any;
  objetRecuperer: any;

  frais: any;
  btFeesUsePercent: boolean = false;
  btFeesIncluded: boolean = false;
  fraisLabel: string = '';
  montantTotal: number = 0;
  fraisCalcul: number = 0;
  vcAccountName: any;
  operator_account: any;

  typeOperateur: string | null = null;

  get prefixesAutorises(): string {
    const op = this.typeOperateur?.toUpperCase();
    if (op === 'ORANGE')
      return '611, 612, 613, 620, 621, 622, 623, 624, 625, 626, 627, 628, 629';
    if (op === 'MTN') return '660, 661, 662, 663, 664, 666';
    return '';
  }

  // ── Retourne les préfixes autorisés selon l'opérateur ────────────────────
  private getPrefixesParOperateur(): string[] {
    const op = this.typeOperateur?.toUpperCase();
    if (op === 'ORANGE')
      return [
        '610',
        '611',
        '612',
        '613',
        '620',
        '621',
        '622',
        '623',
        '624',
        '625',
      ];
    if (op === 'MTN') return ['666', '662', '661', '663', '664'];
    return [];
  }

  // ── Validation instantanée en temps réel ─────────────────────────────────
  validateTelephone(value: string): void {
    this.telephoneError = '';
    this.telephoneSuccess = false;

    if (!value) return;

    const prefixes = this.getPrefixesParOperateur();
    if (prefixes.length === 0) return;

    const op = this.typeOperateur?.toUpperCase();
    const nomOperateur =
      op === 'ORANGE MONEY' ? 'ORANGE' : op === 'MOBILE MONEY' ? 'MTN' : '';

    // Dès 3 chiffres, on contrôle le préfixe
    if (value.length >= 3) {
      const prefixeValide = prefixes.some((p) => value.startsWith(p));
      if (!prefixeValide) {
        this.telephoneError = `Préfixe invalide pour ${nomOperateur}. Préfixes autorisés : ${prefixes.join(', ')}`;
        return;
      }
    }

    // Numéro complet valide
    if (value.length === 9) {
      const prefixeValide = prefixes.some((p) => value.startsWith(p));
      if (prefixeValide) {
        this.telephoneSuccess = true;
      } else {
        this.telephoneError = `Numéro invalide pour ${nomOperateur}.`;
      }
    }
  }

  // ── Handler input téléphone ───────────────────────────────────────────────
  onInputTelephone(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.validateTelephone(value);
  }

  recupererListeOperateur(): void {
    this.mobileMoneyService.listeMobileOperators().subscribe({
      next: (response: any) => {
        console.log('response: ', response);
        const operateur = (response?.data ?? []).find(
          (f: any) => f.vcAccountName === this.typeOperateur,
        );

        if (!operateur) return;

        console.log('operateur: ', operateur);

        this.vcAccountName = operateur?.vcAccountName;
        this.operator_account = operateur?.vcAccountNumber;
        this.frais = operateur?.nFees;
        this.btFeesUsePercent = operateur?.btFeesUsePercent;
        this.btFeesIncluded = operateur?.btFeesIncluded;

        if (this.btFeesIncluded) {
          this.fraisLabel = 'Frais inclus';
          this.fraisCalcul = 0;
        } else {
          if (this.btFeesUsePercent) {
            this.fraisLabel = `${this.frais} %`;
            this.fraisCalcul = this.frais / 100;
          } else {
            this.fraisLabel = `${this.frais}`;
            this.fraisCalcul = this.frais;
          }
        }
      },
    });
  }

  calculerTotal(): void {
    const montant = Number(this.mobileMoneyForm.get('montant')?.value || 0);

    if (!montant) {
      this.montantTotal = 0;
      return;
    }

    if (this.btFeesIncluded) {
      this.montantTotal = montant;
    } else {
      if (this.btFeesUsePercent) {
        this.montantTotal = montant + (montant * this.frais) / 100;
      } else {
        this.montantTotal = montant + Number(this.frais);
      }
    }
  }

  ngOnInit(): void {
    const rawNomFacture = this.route.snapshot.paramMap.get('typeOperateur');

    this.typeOperateur = rawNomFacture
      ? decodeURIComponent(rawNomFacture).trim().toUpperCase()
      : null;

    console.log('this.typeOperateur: ', this.typeOperateur);

    this.recupererListeOperateur();
    this.getUserInfo();

    if (this.idOrganisation) {
      this.getListeCompteClient();
    } else {
      console.error('ID Organisation introuvable');
    }

    this.initOrangeMoneyForm();
    this.initMobileMoneyForm();
  }

  phoneMaxLength = 9;

  onlyDigits(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
      'Tab',
    ];

    if (allowedKeys.includes(event.key)) {
      // Valider après suppression
      setTimeout(() => {
        const val = (event.target as HTMLInputElement).value;
        this.validateTelephone(val);
      }, 0);
      return;
    }

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    const input = event.target as HTMLInputElement;
    if (input.value.length >= this.phoneMaxLength) {
      event.preventDefault();
    }

    this.mobileMoneyForm.get('montant')?.valueChanges.subscribe(() => {
      this.calculerTotal();
    });
  }

  onPaste(event: ClipboardEvent): void {
    const pastedData = event.clipboardData?.getData('text') || '';

    if (!/^\d+$/.test(pastedData)) {
      event.preventDefault();
      return;
    }

    const input = event.target as HTMLInputElement;
    if (input.value.length + pastedData.length > this.phoneMaxLength) {
      event.preventDefault();
      return;
    }

    // Valider après collage
    setTimeout(() => {
      const val = (event.target as HTMLInputElement).value;
      this.validateTelephone(val);
    }, 0);
  }

  initMobileMoneyForm(): void {
    const saved = localStorage.getItem('InfosFormulaireModePaiement');
    const savedData = saved ? JSON.parse(saved) : null;
    const payload = savedData?.payload;
    const isBtoW = payload?.vcOperationType === 'B2W';

    this.mobileMoneyForm = this.fb.group({
      compteSource: [
        payload
          ? isBtoW
            ? payload.vcPayerAccount
            : payload.vcBenefAccount
          : '',
        Validators.required,
      ],
      telephone: [
        payload
          ? isBtoW
            ? payload.vcBenefAccount
            : payload.vcPayerAccount
          : '',
        [
          Validators.required,
          Validators.pattern('^[0-9]{9,12}$'),
          telephoneOperateurValidator(() => this.typeOperateur),
        ],
      ],
      montant: [
        payload?.mAmount ?? '',
        [Validators.required, Validators.min(1)],
      ],
      frais: [''],
      description: [payload?.vcNotes ?? '', Validators.required],
      typeTransactionMM: [
        payload?.vcOperationType ?? 'B2W',
        Validators.required,
      ],
    });

    if (savedData?.soldeDebiteur !== undefined) {
      this.soldeDebiteur = savedData.soldeDebiteur;
      this.devise = savedData.devise;
    }

    if (payload?.mAmount) {
      this.calculerTotal();
    }

    // Valider le téléphone au chargement si une valeur est déjà présente
    const telInitial = this.mobileMoneyForm.get('telephone')?.value;
    if (telInitial) {
      this.validateTelephone(telInitial);
    }

    this.mobileMoneyForm
      .get('compteSource')
      ?.valueChanges.subscribe((accountNumber) => {
        if (accountNumber) {
          this.getAccountName(accountNumber);
        } else {
          this.soldeDebiteur = '';
        }
      });

    this.mobileMoneyForm.get('telephone')?.valueChanges.subscribe(() => {
      this.mobileMoneyForm
        .get('telephone')
        ?.updateValueAndValidity({ emitEvent: false });
    });

    this.mobileMoneyForm.get('montant')?.valueChanges.subscribe(() => {
      this.calculerTotal();
    });
  }

  soldeDebiteur: any = null;
  devise: any = null;
  loadingGetBalance: boolean = false;

  getAccountName(accountNumber: string): void {
    this.loadingGetBalance = true;

    this.getAccount.getNomDebiteur(accountNumber).subscribe({
      next: (res) => {
        this.soldeDebiteur = res?.data?.soldeDisp ?? null;
        this.devise = res?.data?.devise ?? null;
        this.loadingGetBalance = false;
      },
      error: () => {
        this.soldeDebiteur = null;
        this.devise = null;
        this.loadingGetBalance = false;
      },
    });
  }

  loadingMobileMoney: boolean = false;

  submitMobileMoney(): void {
    if (this.mobileMoneyForm.invalid || this.telephoneError) {
      this.mobileMoneyForm.markAllAsTouched();
      return;
    }

    this.loadingMobileMoney = true;

    const formValue = this.mobileMoneyForm.value;

    if (
      formValue.typeTransactionMM === 'B2W' &&
      Number(formValue.montant) > this.soldeDebiteur
    ) {
      this.loadingMobileMoney = false;
      this.notification.error(
        'Le montant saisi doit être inférieur ou égal au solde.',
      );
      return;
    }

    const payload = {
      vcPayerAccount:
        formValue.typeTransactionMM === 'B2W'
          ? formValue.compteSource
          : formValue.telephone,
      vcBenefAccount:
        formValue.typeTransactionMM === 'B2W'
          ? formValue.telephone
          : formValue.compteSource,
      mAmount: Number(formValue.montant),
      vcAccountName: this.vcAccountName,
      operator_account: this.operator_account,
      mFees: this.btFeesIncluded ? this.fraisCalcul : this.fraisCalcul,
      vcNotes: formValue.description,
      vcOperationType: formValue.typeTransactionMM,
    };

    localStorage.setItem(
      'InfosFormulaireModePaiement',
      JSON.stringify({
        payload,
        soldeDebiteur: this.soldeDebiteur,
        devise: this.devise,
      }),
    );

    setTimeout(() => {
      this.router.navigate(['/recapModePaiement']);
    }, 1000);
  }

  listeCompteClient: any[] = [];
  selectedDebitAccount = '';
  errorMessage = '';
  typesCompte = '';

  getListeCompteClient(): void {
    if (!this.idOrganisation) return;

    this.listeCompteCLientService
      .getListeCompteClient(this.idOrganisation)
      .subscribe({
        next: (response: any) => {
          this.listeCompteClient = response?.data?.[0]?.comptes ?? [];
        },
        error: (err) => {
          this.errorMessage = err.message;
        },
      });
  }

  initOrangeMoneyForm(): void {
    this.orangeMoneyForm = this.fb.group({
      typePaiement: ['Mobile Money', Validators.required],
      fournisseur: ['Orange Money', Validators.required],
      numeroMobile: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{8,15}$/),
          telephoneOperateurValidator(() => this.typeOperateur),
        ],
      ],
      nomCompte: ['', [Validators.required, Validators.minLength(2)]],
      emailBeneficiaire: ['', [Validators.required, Validators.email]],
      compteSource: ['', Validators.required],
      montant: ['', [Validators.required, Validators.min(1)]],
      devise: ['GNF', Validators.required],
      objetTransfert: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  submitOrangeMoney(): void {
    if (this.orangeMoneyForm.invalid) {
      this.orangeMoneyForm.markAllAsTouched();
      return;
    }
  }
}
