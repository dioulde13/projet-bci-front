import { Component, OnInit } from '@angular/core';
import { MarchandService } from '../../../servicesNodes/paiementsMarchandEGD/marchand.service';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { GnfNumberFormatDirective } from '../../../directives/gnf-number-format.directive';

@Component({
  selector: 'app-paiements-de-factures-edg',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GnfNumberFormatDirective,
  ],
  templateUrl: './paiements-de-factures-edg.component.html',
  styleUrl: './paiements-de-factures-edg.component.css',
})
export class PaiementsDeFacturesEDGComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private marchandService: MarchandService,
    private listeCompteCLientService: DashboardService,
    private toastr: ToastrService,
  ) {}

  paymentForm!: FormGroup;

  facturiers: any[] = [];
  selectedFacturier: any = null;

  iOrganisationID!: number;
  infosUser: any;

  selectedDebitAccount = '';

  loading = true;
  errorMessage = '';
  typesCompte = '';
  listeCompteClient: any[] = [];

  ngOnInit(): void {
    this.initForm();

    this.getAllFacturiers();

    const userJson = localStorage.getItem('userInfo');
    if (userJson) {
      try {
        this.infosUser = JSON.parse(userJson);
      } catch {
        this.infosUser = null;
      }
    }

    if (this.infosUser?.iOrganisationID) {
      this.iOrganisationID = this.infosUser.iOrganisationID;
      this.getListeCompteClient();
    } else {
      console.warn('iOrganisationID non défini');
      this.loading = false;
    }
  }

  activeTab: string = 'tab1';


  // =====================
  initForm(): void {
    this.paymentForm = this.fb.group({
      debitAccount: ['', Validators.required],
      facturier: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      // feesBCI: [200, Validators.required],
      // feesIncluded: [1, Validators.required],
      notes: ['', Validators.required],
    });
  }

  // =====================
  getAllFacturiers(): void {
    this.marchandService.getAllFacturiers().subscribe({
      next: (res) => {
        this.facturiers = res?.data ?? [];
        console.log('this.facturiers: ', this.facturiers);
      },
      error: (err) => {
        console.error('Erreur chargement facturiers', err);
      },
    });
  }

  loadingEdg: boolean = false;

  // =====================
  submitPaiement(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.loadingEdg = true;

    const v = this.paymentForm.value;

    // Montant de base
    const montant = Number(v.amount);

    // Détermine si les frais sont inclus
    const feesIncluded = v.facturier?.btFeesIncluded;

    // Calcul des frais
    const feesEcash = feesIncluded ? 0 : Number(v.facturier?.nFees ?? 0);

    // Si nFeesBank est un pourcentage (ex: 0.025 pour 2.5%)
    const feesBCI = (Number(v.facturier?.nFeesBank ?? 0) * montant) / 100;

    // Total envoyé dans l’API
    const payload = {
      vcPayerAccount: v.debitAccount,
      vcBenefName: v.facturier?.FacturierName ?? '',
      vcBenefAccount: v.facturier?.vcAccountNumber ?? '',
      mAmount: feesIncluded ? montant : montant,
      mFeesEcash: feesEcash,
      mFeesBCI: feesBCI,
      btFeesIncluded: feesIncluded ? 1 : 0,
      vcNotes: v.notes ?? '',
    };

    console.log('PAYLOAD ENVOYÉ 👉', payload);

    this.marchandService
      .postPaiementMarchant(
        payload.vcPayerAccount,
        payload.vcBenefName,
        payload.vcBenefAccount,
        payload.mAmount,
        payload.mFeesEcash,
        payload.mFeesBCI,
        payload.vcNotes,
        payload.btFeesIncluded,
      )
      .subscribe({
        next: (response: any) => {
          console.log('Réponse API 👉', response);
          if (response.status === 200) {
            this.toastr.success('Le paiement a été effectué avec succès', '', {
              positionClass: 'toast-custom-center',
            });
            this.loadingEdg = false;
            this.paymentForm.reset();
          }
        },
        error: (err) => {
          this.toastr.error(err.error.message, '', {
            positionClass: 'toast-custom-center',
          });
          this.loadingEdg = false;
          console.error('Erreur API 👉', err);
        },
      });
  }

  onDebitAccountSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement)?.value;
    if (value) this.onDebitAccountChange(value);
  }

  onDebitAccountChange(accountNumber: string): void {
    console.log(accountNumber);
  }

  // =====================
  getListeCompteClient(): void {
    if (!this.iOrganisationID) return;

    this.listeCompteCLientService
      .getListeCompteClient(this.iOrganisationID)
      .subscribe({
        next: (response: any) => {
          this.listeCompteClient = response?.data?.[0]?.comptes ?? [];
          this.loading = false;

          this.typesCompte = [
            ...new Set(this.listeCompteClient.map((c) => c.vcAccountType)),
          ].join(' - ');

          // ✅ sélection auto injectée dans le Reactive Form
          if (this.listeCompteClient.length > 0) {
            const firstAccount = this.listeCompteClient[0].vcAccountNumber;

            this.selectedDebitAccount = firstAccount;

            this.paymentForm.patchValue({
              debitAccount: firstAccount,
            });

            this.onDebitAccountChange(firstAccount);
          }
        },
        error: (err) => {
          this.errorMessage = err.message;
          this.loading = false;
        },
      });
  }
}
