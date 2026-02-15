import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit,
} from '@angular/core';
// import Papa from 'papaparse';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { TransactionService } from '../../servicesNodes/transactionService/transaction.service';
import { FormsModule } from '@angular/forms';
import { BalanceService } from '../../servicesNodes/balance/balance.service';
// import * as XLSX from 'xlsx';
// import { SaveFichierCSVService } from '../../servicesNodes/saveFichierCSVTransaction/save-fichier-csv.service';
import { BciLoaderService } from '../../servicesNodes/bciLoader/bci-loader.service';
import { SaveFichierCSVService } from '../../servicesNodes/saveFichierCSVTransaction/save-fichier-csv.service';
import { ToastrService } from 'ngx-toastr';

// import { GnfFormatPipe } from '../gnfFormat/gnf-format.pipe';
// export interface BeneficiaireExcel {
//   prenom: string;
//   nom: string;
//   typeBeneficiaire: string;
//   numeroCompte: string;
//   bic: string;
//   montant: number;
//   devise: string;
//   modePaiement: string;
//   nomBanque: string;
//   adresseBanque: string;
//   objetPaiement: string;
// }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule,
    // GnfFormatPipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardComponent implements OnInit {
  // beneficiaires: BeneficiaireExcel[] = [];
  // columns: string[] = [];

  // onFileChange(event: any) {
  //   const file = event.target.files[0];
  //   if (!file) return;

  //   const reader = new FileReader();

  //   reader.onload = (e: any) => {
  //     const data = new Uint8Array(e.target.result);
  //     const workbook = XLSX.read(data, { type: 'array' });

  //     const sheetName = workbook.SheetNames[0];
  //     const worksheet = workbook.Sheets[sheetName];

  //     const rows: any[] = XLSX.utils.sheet_to_json(worksheet, {
  //       defval: '',
  //     });

  //     this.beneficiaires = rows.map((row) => ({
  //       prenom: row['Prénom'],
  //       nom: row['Nom'],
  //       typeBeneficiaire: row['Type de bénéficiaire'],
  //       numeroCompte: row['Numéro de compte'],
  //       bic: row['BIC'],
  //       montant: Number(row['Montant']),
  //       devise: row['Devise'],
  //       modePaiement: row['Mode paiement'],
  //       nomBanque: row['Nom de la banque du bénéficiaire'],
  //       adresseBanque: row['Adresse de la banque du bénéficiaire'],
  //       objetPaiement: row['Objet du paiement'],
  //     }));

  //     this.columns = Object.keys(this.beneficiaires[0] || {});
  //   };

  //   reader.readAsArrayBuffer(file);
  // }

  // csvData: any[] = [];
  // headers: string[] = [];
  // selectedFile: File | null = null;
  listeCompteClient: any[] = [];

  // onFileSelected(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length > 0) {
  //     this.selectedFile = input.files[0];
  //   }
  // }

  // onFormSubmit(event: Event): void {
  //   event.preventDefault();
  //   if (this.selectedFile) {
  //     this.parseCSV(this.selectedFile);
  //   } else {
  //     alert('Veuillez sélectionner un fichier CSV avant de charger.');
  //   }
  // }

  // parseCSV(file: File): void {
  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     const csv = reader.result as string;
  //     Papa.parse(csv, {
  //       header: true,
  //       skipEmptyLines: true,
  //       complete: (result) => {
  //         this.csvData = result.data;
  //         if (this.csvData.length > 0) {
  //           this.headers = Object.keys(this.csvData[0]);
  //         }
  //       },
  //     });
  //   };
  //   reader.readAsText(file);
  // }

  constructor(
    private listeCompteCLientService: DashboardService,
    private dixTransactionServiceNode: TransactionService,
    private balanceService: BalanceService,
    private saveFichierCSVService: SaveFichierCSVService,
    private bciLoaderService: BciLoaderService,
    private toastr: ToastrService,
  ) {}

  //   totalSolde: any;

  // processAccounts(): void {
  //   console.log('this.listeCompteClient: ', this.listeCompteClient);
  //   if (!this.listeCompteClient || this.listeCompteClient.length === 0) {
  //     console.log('Aucun compte à traiter');
  //     return;
  //   }

  //   // On ne prend que les 3 premiers comptes
  //   this.listeCompteClient.slice(0, 3).forEach((compte: any) => {
  //     const accountNumber = compte.vcAccountNumber;

  //     if (!accountNumber) {
  //       console.warn('Compte sans numéro:', compte);
  //       return;
  //     }

  //     console.log('Traitement du compte:', accountNumber);

  //     this.balanceService.getBalance(accountNumber).subscribe({
  //       next: (response) => {
  //         console.log('Réponse complète pour', accountNumber, ':', response);

  //         if (response?.data) {
  //           console.log('Balance pour', accountNumber, ':', response.data);
  //           this.totalSolde = response.data.soldeDisp;
  //           console.log('Total Solde: ', this.totalSolde);
  //         }
  //       },
  //       error: (error) => {
  //         console.error('Erreur pour', accountNumber, ':', error);
  //       },
  //     });
  //   });
  // }

  // totalSolde: any;

  // processAccounts(): void {
  //   console.log('this.listeCompteClient: ', this.listeCompteClient);
  //   if (!this.listeCompteClient || this.listeCompteClient.length === 0) {
  //     console.log('Aucun compte à traiter');
  //     return;
  //   }

  //   this.listeCompteClient.forEach((compte: any) => {
  //     const accountNumber = compte.vcAccountNumber;

  //     if (!accountNumber) {
  //       console.warn('Compte sans numéro:', compte);
  //       return;
  //     }

  //     console.log('Traitement du compte:', accountNumber);

  //     this.balanceService.getBalance(accountNumber).subscribe({
  //       next: (response) => {
  //         console.log('Réponse complète pour', accountNumber, ':', response);

  //         if (response?.data) {
  //           console.log('Balance pour', accountNumber, ':', response.data);
  //           this.totalSolde = response.data.soldeDisp;
  //           console.log('Total Solde: ', this.totalSolde);
  //         }
  //       },
  //       error: (error) => {
  //         console.error('Erreur pour', accountNumber, ':', error);
  //       },
  //     });
  //   });
  // }

  // processAccounts() {
  //   this.accountNumbers.forEach((accNum: string) => {
  //     this.balanceService.getBalance(accNum).subscribe({
  //       next: (response) => {
  //         console.log('Réponse pour', accNum, ':', response.data);
  //       },
  //       error: (error) => {
  //         console.error('Erreur pour', accNum, ':', error);
  //       },
  //     });
  //   });
  // }

  selectedAccountNumber: string = '';
  loading = true;
  errorMessage = '';
  typesCompte: string = '';

  getListeCompteClient(): void {
    if (!this.iOrganisationID) {
      console.warn(
        'Impossible de récupérer la liste : iOrganisationID non défini',
      );
      return;
    }

    this.listeCompteCLientService
      .getListeCompteClient(this.iOrganisationID)
      .subscribe({
        next: (response) => {
          this.listeCompteClient = response.data?.[0]?.comptes ?? [];
          this.loading = false;

          console.log('Liste des comptes client :', this.listeCompteClient);

          // Extraire les types
          const types = [
            ...new Set(this.listeCompteClient.map((c: any) => c.vcAccountType)),
          ];
          this.typesCompte = types.join(' - ');

          // 🔥 Sélection automatique du premier compte
          if (this.listeCompteClient.length > 0) {
            this.selectedAccountNumber =
              this.listeCompteClient[0].vcAccountNumber;
            console.log('selectedAccountNumber :', this.selectedAccountNumber);

            this.dixTransactionsRecentsListe();
            this.onDebitAccountChange(this.selectedAccountNumber);
            // ✅ ICI SEULEMENT
            // this.processAccounts();
          }
        },
        error: (err: any) => {
          this.errorMessage = err.message;
          this.loading = false;
          console.error('Erreur getListeCompteClient', err);
        },
      });
  }

  onDebitAccountSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement)?.value;
    if (value) this.onDebitAccountChange(value);
  }

  soldeDebiteur: any = '';

  onDebitAccountChange(accountNumber: string): void {
    this.getBalance(accountNumber);
  }

  getBalance(accountNumber: string): void {
    this.balanceService.getBalance(accountNumber).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.soldeDebiteur = this.formatSolde(res?.data?.soldeDisp);
        } else {
          this.soldeDebiteur = 0;
        }
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du solde :', error);
        this.soldeDebiteur = 0;
      },
    });
  }

  formatSolde(solde: any): number {
    if (solde === null || solde === undefined) return 0;

    // Si c'est déjà un number
    if (typeof solde === 'number') return solde;

    // Si c'est une string avec virgule (ex: "2416,51")
    if (typeof solde === 'string') {
      return Number(solde.replace(',', '.')) || 0;
    }

    return 0;
  }

  loadingDixPremiereTransactions: boolean = false;

  // états
  allTransactions: any[] = [];
  listeDixPremiereTransactions: any[] = [];
  page = 0;
  limit = 2; // combien d’éléments à afficher à chaque scroll
  loadingMore = false;

  dixTransactionsRecentsListe() {
    this.loadingDixPremiereTransactions = true;

    this.dixTransactionServiceNode
      .dixTransactionsRecents(this.selectedAccountNumber)
      .subscribe({
        next: (response) => {
          // sauve toutes les transactions en mémoire
          this.allTransactions = response.data.statement ?? [];

          // affiche le premier lot
          this.addItemsOnScroll();

          this.loadingDixPremiereTransactions = false;
        },
        error: (error) => {
          console.error(error);
          this.loadingDixPremiereTransactions = false;
        },
      });
  }

  addItemsOnScroll() {
    if (this.loadingMore) return;

    this.loadingMore = true;

    const nextBatch = this.allTransactions.slice(
      this.page * this.limit,
      (this.page + 1) * this.limit,
    );

    this.listeDixPremiereTransactions.push(...nextBatch);

    this.page++;
    this.loadingMore = false;
  }

  @HostListener('window:scroll', [])
  onScroll() {
    const pos = window.innerHeight + window.scrollY;
    const max = document.documentElement.scrollHeight;

    // si l’utilisateur est proche de la fin
    if (
      pos >= max - 100 &&
      this.page * this.limit < this.allTransactions.length
    ) {
      this.addItemsOnScroll();
    }
  }

  // loadingDixPremiereTransactions: boolean = false;

  // listeDixPremiereTransactions: any[] = [];

  // dixTransactionsRecentsListe() {
  //   this.loadingDixPremiereTransactions = true;

  //   this.dixTransactionServiceNode
  //     .dixTransactionsRecents(this.selectedAccountNumber)
  //     .subscribe({
  //       next: (response) => {
  //         this.listeDixPremiereTransactions = response.data.statement;
  //         this.loadingDixPremiereTransactions = false;
  //       },
  //       error: (error) => {
  //         console.error(error);
  //         this.loadingDixPremiereTransactions = false;
  //       },
  //     });
  // }

  formatDateOper(dateOper: string): string {
    if (!dateOper || dateOper.length !== 6) return dateOper;

    const year = 2000 + Number(dateOper.substring(0, 2));
    const month = Number(dateOper.substring(2, 4)) - 1;
    const day = Number(dateOper.substring(4, 6));

    const date = new Date(year, month, day);

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatMontant(t: any): string {
    const montant = t.amountOper ?? t.AmountOper ?? 0;
    // const signe = t.sigOper === 'D' ? '-' : '+'; ${signe}

    const sign = t.devise;

    return `${montant.toLocaleString('fr-FR')} ${sign}`;
  }

  getBciLoader() {
    this.bciLoaderService.load();
  }

  iOrganisationID!: number;
  infosUser: any;

  ngOnInit(): void {
    this.getBciLoader();
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

    // this.dixTransactionsRecentsListe();
    // this.processAccounts();
  }

  // title = 'generic file import';
  openModal = false;
  fields: any[] = [
    { key: 'prenom', label: 'Prénom', required: true },
    { key: 'nom', label: 'Nom', required: true },
    {
      key: 'typeBeneficiaire',
      label: 'Type de bénéficiaire',
      required: true,
    },
    { key: 'numeroCompte', label: 'Numéro de compte', required: true },
    { key: 'bic', label: 'BIC', required: true },
    { key: 'montant', label: 'Montant', required: true, type: 'number' },
    { key: 'devise', label: 'Devise', required: true },
    { key: 'modePaiement', label: 'Mode paiement', required: true },
    {
      key: 'nomBanque',
      label: 'Nom de la banque du bénéficiaire',
    },
    {
      key: 'adresseBanque',
      label: 'Adresse de la banque du bénéficiaire',
    },
    { key: 'objetPaiement', label: 'Objet du paiement' },
  ];

  loadingValidation: boolean = false;

  onImportedData(event: any) {
    console.log('event:', event);
    this.loadingValidation = true;

    // Vérifie si c’est un CustomEvent
    const file: File = event?.detail?.file;

    if (!(file instanceof File)) {
      console.error('Le fichier CSV est invalide ou non trouvé');
      return;
    }

    console.log('Fichier reçu :', file);

    // Maintenant tu peux l’envoyer au backend
    this.saveFichierCSVService
      .saveFichierCSVTransaction(file, 1, this.iOrganisationID)
      .subscribe({
        next: (res) => {
          this.toastr.success(res.message, '', {
            positionClass: 'toast-custom-center',
          });
          this.openModal = false;
          this.loadingValidation = false;
          console.log('Import réussi', res);
        },
        error: (err) => {
          console.error('Erreur import', err);
        },
      });
  }

  notificationEnCoursDeveloppement() {
    this.toastr.error(
      'Cette fonctionnalité est en cours de développement.',
      '',
      {
        positionClass: 'toast-custom-center',
      },
    );
  }

  // onImportedData(event: any) {
  //   const tableData = event.detail || event;

  //   console.log('Données du tableau :', tableData);

  //   // if (confirmDemande) {
  //   // this.saveFichierCSVService.saveFichierCSVTransaction(payload).subscribe({
  //   //   next: (res) => {
  //   //     console.log('response:', res);
  //   //     this.toastr.success('Données envoyées avec succès', '', {
  //   //       positionClass: 'toast-custom-center',
  //   //     });
  //   //     // alert('Données envoyées avec succès !');
  //   //   },
  //   //   error: (error: any) => {
  //   //     this.toastr.error("Erreur lors de l'envoie des données ", '', {
  //   //       positionClass: 'toast-custom-center',
  //   //     });
  //   //     // alert('Erreur lors de l’envoi des données.');
  //   //   },
  //   // });
  //   // } else {
  //   //   console.log('Validation annulée par l’utilisateur.');
  //   // }
  // }
}
