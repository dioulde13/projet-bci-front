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
// import { ToastrService } from 'ngx-toastr';
import { GnfNumberFormatDirective } from '../../../../directives/gnf-number-format.directive';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-transfert-unique',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GnfNumberFormatDirective],
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
  devise: any = '';
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
    private router: Router,
    // private toastr: ToastrService,
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

  decodeMessage(encoded: string): string {
    if (!encoded) return encoded;

    return (
      encoded
        // replacement des séquences courantes
        .replace(/\+á/g, 'à')
        .replace(/\+é/g, 'é')
        .replace(/\+è/g, 'è')
        .replace(/\+®/g, 'é')
        .replace(/\+ç/g, 'ç')
        .replace(/\+ô/g, 'ô')
        .replace(/\+°/g, 'ô')
        .replace(/\+ù/g, 'ù')
        .replace(/\+/g, ' ') // transformer les + restants en espaces
        .trim()
    );
  }

  messageErreur: any;
  statusMessageErreur: any;
  status: boolean = false;
  infosCompteDebiteur: any;

  getAccountName(accountNumber: string): void {
    this.getAccount.getNomDebiteur(accountNumber).subscribe({
      next: (res) => {
        console.log('res: ', res);
        this.infosCompteDebiteur = res?.data;
        this.nomDebiteur = res?.data?.name;
        this.soldeDebiteur = res?.data?.soldeDisp;
        this.devise = res?.data?.devise;
        this.status = false;
      },
      error: (err: any) => {
        if (err.error.status === 404) {
          // décoder le message avant de l’affecter
          this.messageErreur = this.decodeMessage(err.error.message);
          this.status = true;
        } else {
          this.status = false;
        }

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
          this.listeBeneficiaires = response?.data.filter(
            (l: any) => l.btEnabled === '1',
          );
          console.log('this.listeBeneficiaires: ', this.listeBeneficiaires);
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
      dtPaymentDate: ['', Validators.required],
      vcPayerAccount: ['', Validators.required],
      beneficiaryCategory: ['', Validators.required],
      mAmount: ['', Validators.required],
    });
  }

  submitAttempt = false;
  loadingPaiementInterneExterne: boolean = false;

  submitFormPayementInterneExterne(): void {
    this.submitAttempt = true;
    this.transferFormPaiementInterneExterne.markAllAsTouched();

    this.loadingPaiementInterneExterne = true;

    const formValue = this.transferFormPaiementInterneExterne.value;
    if (formValue.mAmount > this.soldeDebiteur) {
      this.loadingPaiementInterneExterne = false;
      this.toastr.error(
        'Le montant saisi doit être inférieur ou égal au solde.',
        '',
        {
          positionClass: 'toast-custom-center',
        },
      );
      return;
    } else {
      const payload = {
        vcPayerName: this.nomDebiteur,
        dtPaymentDate: formValue.dtPaymentDate,
        vcPaymentReference: 'REF123',
        vcPayerAccount: formValue.vcPayerAccount,
        vcBenefName: this.selectedBeneficiaireName,
        mAmount: formValue.mAmount,
        vcBenefAccount: this.selectedBeneficiaire.vcAccountNumber,
        vcBenefBicCode: this.selectedBeneficiaire.vcBIC,
        vcCorrespBicCode: '',
        vcBenefCurrency: this.selectedBeneficiaire.vcCurrency,
      };

      // console.log('selectedBeneficiaire :', this.selectedBeneficiaire);
      // console.log('Payload Mobile Money :', payload);

      // Enregistrer dans le localStorage

      localStorage.setItem(
        'InfosSaisirDansFormulaire',
        JSON.stringify(payload),
      );
      localStorage.setItem(
        'selectedBeneficiaire',
        JSON.stringify(this.selectedBeneficiaire),
      );
      localStorage.setItem(
        'infosCompteDebiteur',
        JSON.stringify(this.infosCompteDebiteur),
      );
      // Simuler un petit délai pour voir le loading
      setTimeout(() => {
        this.router.navigate(['/recap']);
      }, 1000);
    }
  }
}
