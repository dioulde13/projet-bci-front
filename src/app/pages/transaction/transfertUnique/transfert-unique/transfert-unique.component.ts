import { Component, OnInit } from '@angular/core';
import { BeneficiaireService } from '../../../../services/beneficiaire/beneficiaire.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../../services/dashboard/dashboard.service';
import { GetAccountNameService } from '../../../../servicesNodes/verifierNomDebiteur/get-account-name.service';
import { BeneficiaireNodeService } from '../../../../servicesNodes/beneficiaireNode/beneficiaire-node.service';
import { BanqueNameVerifierService } from '../../../../servicesNodes/verifierBanqueName/banque-name-verifier.service';
import { PaiementInterneExterneService } from '../../../../servicesNodes/paiementInterneExterne/paiement-interne-externe.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-transfert-unique',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transfert-unique.component.html',
  styleUrls: ['./transfert-unique.component.css'],
})
export class TransfertUniqueComponent implements OnInit {
  loading = true;
  loadingFetch = false;
  errorMessage = '';

  userInfo: any;
  infosUser: any;
  idOrganisation!: number;
  iOrganisationID!: number;

  transferFormPaiementInterneExterne!: FormGroup;

  listeCompteClient: any[] = [];
  listeBeneficiaire: any[] = [];
  filteredBeneficiaire: any[] = [];
  filteredBeneficiaireOne: any[] = [];
  listeBanques: any[] = [];

  selectedTypeBeneficiaire = '';
  selectedBeneficiaire: any = null;
  selectedBeneficiaireId: any;
  selectedDebitAccount = '';
  selectedBicCode = '';

  nomDebiteur = '';
  soldeDebiteur: any = '';
  nomBanque = '';
  typesCompte = '';

  constructor(
    private fb: FormBuilder,
    private getAccount: GetAccountNameService,
    private beneficiaireService: BeneficiaireService,
    private listeCompteCLientService: DashboardService,
    private beneficiaireNodeService: BeneficiaireNodeService,
    private banqueNameVerifierService: BanqueNameVerifierService,
    private paiementInterneExterneService: PaiementInterneExterneService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
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

    this.getUserInfo();
    this.loadTypeBeneficiaires();
    this.getListeBeneficiaire();
    this.getListeBanques();
    this.initFormPaiementInterneExterne();
  }

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

          if (this.listeCompteClient.length > 0) {
            const firstAccount = this.listeCompteClient[0].vcAccountNumber;
            this.selectedDebitAccount = firstAccount;
            this.onDebitAccountChange(firstAccount);
          }
        },
        error: (err) => {
          this.errorMessage = err.message;
          this.loading = false;
        },
      });
  }

  onDebitAccountSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement)?.value;
    if (value) this.onDebitAccountChange(value);
  }

  onDebitAccountChange(accountNumber: string): void {
    this.getAccountName(accountNumber);
    this.transferFormPaiementInterneExterne.patchValue({
      vcPayerAccount: accountNumber,
    });
  }

  getAccountName(accountNumber: string): void {
    this.getAccount.getNomDebiteur(accountNumber).subscribe({
      next: (res) => {
        this.nomDebiteur = res?.data?.name;
        this.soldeDebiteur = res?.data?.soldeDisp;
      },
      error: () => {
        this.nomDebiteur = '';
        this.soldeDebiteur = '';
      },
    });
  }

  getListeBanques(): void {
    this.beneficiaireNodeService.getListeBanque().subscribe({
      next: (res) => {
        this.listeBanques = res?.data ?? [];
        if (this.listeBanques.length > 0) {
          this.selectedBicCode = this.listeBanques[0].vcBICCode;
          this.onBicCodeChange(this.selectedBicCode);
        }
      },
    });
  }

  onBicCodeSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement)?.value;
    if (value) this.onBicCodeChange(value);
  }

  onBicCodeChange(bicCode: string): void {
    this.getNomBanque(bicCode);
    this.transferFormPaiementInterneExterne.patchValue({
      vcBenefBicCode: bicCode,
    });
  }

  getNomBanque(bicCode: string): void {
    this.banqueNameVerifierService.getNomBanque(bicCode).subscribe({
      next: (res) => (this.nomBanque = res?.data?.name ?? ''),
      error: () => (this.nomBanque = ''),
    });
  }

  private getUserInfo(): void {
    const user = localStorage.getItem('userInfo');
    if (!user) return;
    this.userInfo = JSON.parse(user);
    this.idOrganisation = this.userInfo?.iOrganisationID;
  }

  listeTypeBeneficiaire: any[] = [];

  private loadTypeBeneficiaires(): void {
    this.beneficiaireService.getListeTypeBeneficiaire().subscribe({
      next: (res) => {
        this.listeTypeBeneficiaire = res?.data ?? [];
      },
      error: (err) => console.error(err),
    });
  }

  private getListeBeneficiaire(): void {
    if (!this.idOrganisation) return;
    this.loadingFetch = true;
    this.beneficiaireService
      .getListeBeneficiaire(this.idOrganisation)
      .subscribe({
        next: (res: any) => {
          this.listeBeneficiaire = res?.data ?? [];
          this.filteredBeneficiaire = [...this.listeBeneficiaire];
          this.loadingFetch = false;
        },
        error: () => (this.loadingFetch = false),
      });
  }

  selectedBeneficiaireName = '';
  listeBeneficiaires: any[] = [];

  onCategoryChange(event: Event) {
    const selectedType = this.transferFormPaiementInterneExterne.get(
      'beneficiaryCategory',
    )?.value;

    this.selectedBeneficiaireId = selectedType?.id;
    this.selectedBeneficiaireName = selectedType?.vcName;
    this.getListeBeneficiaireByCategorie();
  }

  getListeBeneficiaireByCategorie(): void {
    if (!this.selectedBeneficiaireId) return;
    this.paiementInterneExterneService
      .getListeBeneficiaireByCategorie(this.selectedBeneficiaireId)
      .subscribe({
        next: (response: any) => {
          this.listeBeneficiaires = response?.data || [];
        },
        error: () => {
          this.listeBeneficiaires = [];
        },
      });
  }

  onBeneficiaireChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    if (!id) {
      this.selectedBeneficiaire = null;
      return;
    }
    this.selectedBeneficiaire = this.listeBeneficiaires.find(
      (b) => b?.BeneficiaryID?.toString() === id,
    );
    if (this.selectedBeneficiaire) {
      this.transferFormPaiementInterneExterne.patchValue({
        vcBenefName: `${this.selectedBeneficiaire.vcFirstName} ${this.selectedBeneficiaire.vcLastName}`,
        vcBenefAccount: this.selectedBeneficiaire.vcAccountNumber,
      });
    }
  }

  initFormPaiementInterneExterne(): void {
    this.transferFormPaiementInterneExterne = this.fb.group({
      vcPayerName: ['', Validators.required],
      dtPaymentDate: ['', Validators.required],
      vcPaymentReference: ['', Validators.required],
      vcPayerAccount: ['', Validators.required],
      beneficiaryCategory: ['', Validators.required],
      mAmount: ['', Validators.required],
      vcCorrespBicCode: ['', Validators.required],
    });
  }

  loadingPayementInterneExterne: boolean = false;

  submitFormPayementInterneExterne(): void {
    let vcBenefAccountNumber = this.selectedBeneficiaire?.vcAccountNumber;
    let vcBenefBicCode = this.selectedBeneficiaire?.vcBIC;
    let vcBenefCurrency = this.selectedBeneficiaire?.vcCurrency;

    this.loadingPayementInterneExterne = true;
    const formValue = this.transferFormPaiementInterneExterne.value;

    const payload = {
      vcPayerName: this.nomDebiteur,
      dtPaymentDate: formValue.dtPaymentDate,
      vcPaymentReference: 'REF123',
      vcPayerAccount: formValue.vcPayerAccount,
      vcBenefName: this.selectedBeneficiaireName,
      mAmount: formValue.mAmount,
      vcBenefAccount: vcBenefAccountNumber,
      vcBenefBicCode: vcBenefBicCode,
      vcCorrespBicCode: '',
      vcBenefCurrency: vcBenefCurrency,
    };

    // console.log('Payload Mobile Money :', payload);
    // this.paiementInterneExterneService
    //  .payementInterneExterne(payload)
    //  .subscribe({  next: (res) => { 
    // console.log('Paiement réussi :', res);
    //  this.loadingPayementInterneExterne = false; 
    // this.toastr.success(res.data.message, '', { 
    // positionClass: 'toast-custom-center', 
    // }); // }, 
    // error: (err) => { 
    // this.toastr.error(err.error.message, '', { 
    // positionClass: 'toast-custom-center',
    //  }); // this.loadingPayementInterneExterne = false; 
    // console.error('Erreur paiement :', err); // 
    // }); 
    // console.log('✅ DONNÉES FORMULAIRE :', formValue);
  }
}
