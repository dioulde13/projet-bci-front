import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
// import { BeneficiaireService } from '../../../services/beneficiaire/beneficiaire.service';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { MobileMoneyService } from '../../../servicesNodes/modePaiementOperateur/mobileMoney/mobile-money.service';
import { ToastrService } from 'ngx-toastr';
import { GetAccountNameService } from '../../../servicesNodes/verifierNomDebiteur/get-account-name.service';
import { GnfNumberFormatDirective } from '../../../directives/gnf-number-format.directive';

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

  // typeOperateur!: 'ORANGE MONEY' | 'MOBILE MONEY';

  orangeMoneyForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    // private beneficiaireService: BeneficiaireService,
    private listeCompteCLientService: DashboardService,
    private mobileMoneyService: MobileMoneyService,
    private toastr: ToastrService,
    private getAccount: GetAccountNameService,
  ) {}

  mobileMoneyForm!: FormGroup;

  /** Récupération infos utilisateur */
  private getUserInfo(): void {
    const user = localStorage.getItem('userInfo');
    console.log('user: ', user);
    if (user) {
      this.userInfo = JSON.parse(user);
      this.idOrganisation = this.userInfo.iOrganisationID;
    }
  }

  listeOperateur:any[] = [];
  operateur: any;

  recupererListeOperateur(){
    this.mobileMoneyService.listeMobileOperators().subscribe({
       next: (response: any) => {
        this.listeOperateur = (response?.data ?? []).filter(
          (f: any) => f.btEnabled === true
        );
        this.operateur = (response?.data ?? []).filter(
          (f: any) => f.FacturierName === this.typeOperateur
        );
        console.log('operateur: ', this.operateur);
      },
      error: (err) => console.error(err),
    })
  }

  typeOperateur: string | null = null;

  ngOnInit(): void {
    const rawNomFacture = this.route.snapshot.paramMap.get('typeOperateur');

    this.typeOperateur = rawNomFacture
      ? decodeURIComponent(rawNomFacture).trim().toUpperCase()
      : null;

    console.log('this.typeOperateur: ', this.typeOperateur);

    this.recupererListeOperateur();

    // 1️⃣ récupérer l'utilisateur
    this.getUserInfo();

    // 2️⃣ vérifier que l'id organisation existe
    if (this.idOrganisation) {
      // this.getListeBeneficiaire();
      this.getListeCompteClient();
    } else {
      console.error('ID Organisation introuvable');
    }

    // 3️⃣ récupérer type opérateur
    this.typeOperateur =
      (this.route.snapshot.paramMap.get('typeOperateur') as
        | 'ORANGE MONEY'
        | 'MOBILE MONEY') || 'MOBILE MONEY';

    // 4️⃣ init formulaires
    this.initOrangeMoneyForm();
    this.initMobileMoneyForm();

    console.log('Type opérateur :', this.typeOperateur);
  }

  phoneMaxLength = 9;

  // Autoriser uniquement les chiffres + touches utiles
  onlyDigits(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
      'Tab',
    ];

    if (allowedKeys.includes(event.key)) return;

    // Bloquer tout sauf chiffres
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    const input = event.target as HTMLInputElement;

    // Bloquer si longueur max atteinte
    if (input.value.length >= this.phoneMaxLength) {
      event.preventDefault();
    }
  }

  // Bloquer le collage invalide
  onPaste(event: ClipboardEvent): void {
    const pastedData = event.clipboardData?.getData('text') || '';

    // Autoriser uniquement chiffres
    if (!/^\d+$/.test(pastedData)) {
      event.preventDefault();
      return;
    }

    const input = event.target as HTMLInputElement;

    // Bloquer si dépasse 9 chiffres
    if (input.value.length + pastedData.length > this.phoneMaxLength) {
      event.preventDefault();
    }
  }

  // 🔷 MOBILE MONEY
  // 🔷 MOBILE MONEY
  initMobileMoneyForm(): void {
    this.mobileMoneyForm = this.fb.group({
      compteSource: ['', Validators.required],
      telephone: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]{9,12}$'), // numéro valide
        ],
      ],
      montant: ['', [Validators.required, Validators.min(1)]],
      frais: [''],
      description: ['', Validators.required],
      typeTransactionMM: ['B2W', Validators.required],
    });

    // Écouter le changement du compte sélectionné
    this.mobileMoneyForm
      .get('compteSource')
      ?.valueChanges.subscribe((accountNumber) => {
        if (accountNumber) {
          this.getAccountName(accountNumber);
        } else {
          this.soldeDebiteur = '';
        }
      });
  }

  soldeDebiteur: any;

  getAccountName(accountNumber: string): void {
    this.getAccount.getNomDebiteur(accountNumber).subscribe({
      next: (res) => {
        this.soldeDebiteur = res?.data?.soldeDisp;
        console.log('this.soldeDebiteur: ', this.soldeDebiteur);
      },
      error: () => {
        this.soldeDebiteur = '';
      },
    });
  }

  loadingMobileMoney: boolean = false;

  // 🔥 SUBMIT MOBILE
  submitMobileMoney(): void {
    if (this.mobileMoneyForm.invalid) {
      this.mobileMoneyForm.markAllAsTouched();
      return;
    }

    this.loadingMobileMoney = true;

    const formValue = this.mobileMoneyForm.value;

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
      vcOperatorAccount: this.typeOperateur,
      mFees: 200,
      vcNotes: formValue.description,
      vcOperationType: formValue.typeTransactionMM,
    };

    // console.log('Payload Mobile Money :', payload);

    this.mobileMoneyService.payerMobileMoney(payload).subscribe({
      next: (res) => {
        // console.log('Paiement réussi :', res);
        this.toastr.success(res.data.message, '', {
          positionClass: 'toast-custom-center',
        });
        this.loadingMobileMoney = false;
      },
      error: (err) => {
        this.toastr.error("Une erreur est survenu lors de l'ajout", '', {
          positionClass: 'toast-custom-center',
        });
        this.loadingMobileMoney = false;
        console.error('Erreur paiement :', err);
        // toast erreur ic
      },
    });
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

  // 🔶 ORANGE MONEY
  initOrangeMoneyForm(): void {
    this.orangeMoneyForm = this.fb.group({
      typePaiement: ['Mobile Money', Validators.required],
      fournisseur: ['Orange Money', Validators.required],
      numeroMobile: [
        '',
        [Validators.required, Validators.pattern(/^\d{8,15}$/)],
      ],
      nomCompte: ['', [Validators.required, Validators.minLength(2)]],
      emailBeneficiaire: ['', [Validators.required, Validators.email]],
      compteSource: ['', Validators.required],
      montant: ['', [Validators.required, Validators.min(1)]],
      devise: ['GNF', Validators.required],
      objetTransfert: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  // 🔥 SUBMIT ORANGE
  submitOrangeMoney(): void {
    if (this.orangeMoneyForm.invalid) {
      this.orangeMoneyForm.markAllAsTouched();
      return;
    }
    console.log('Orange Money :', this.orangeMoneyForm.value);
  }
}
