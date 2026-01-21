import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BeneficiaireService } from '../../../services/beneficiaire/beneficiaire.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

declare const bootstrap: any; 

@Component({
  selector: 'app-modifier-beneficiaire',
  standalone: true,
  imports: [NgIf, NgForOf, NgClass, ReactiveFormsModule],
  templateUrl: './modifier-beneficiaire.component.html',
  styleUrls: ['./modifier-beneficiaire.component.css'],
})
export class ModifierBeneficiaireComponent implements OnInit {
  idBeneficiaire!: number;
  demande: any = null;
  isLoading = true;

  // Formulaire pour le modal
  modifyForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private beneficiaireService: BeneficiaireService,
    private fb: FormBuilder,
    private toastr: ToastrService,
  ) {}

  userInfo: any;
  iOrganisationID: any;

  ngOnInit(): void {
    const userInfoString = localStorage.getItem('userInfo');
    console.log('userInfo (raw) ', userInfoString);

    if (userInfoString) {
      try {
        this.userInfo = JSON.parse(userInfoString);
        console.log('userInfo (parsed) ', this.userInfo);

        // this.idResponsable = this.userInfo.id;
        this.iOrganisationID = this.userInfo.iOrganisationID;
      } catch (error) {
        console.error('Erreur lors du parsing de userInfo :', error);
      }
    } else {
      console.warn('Aucun userInfo trouvé dans localStorage.');
    }

    this.idBeneficiaire = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.getDetailBeneficiaire();

    this.loadTypeBeneficiaires();
    this.loadTypePaiements();
    this.listPays();
  }

  // Initialiser le formulaire
  initForm(): void {
    this.modifyForm = this.fb.group({
      vcFirstName: ['', Validators.required],
      vcLastName: ['', Validators.required],
      vcPhoneNumber: ['', Validators.required],
      vcEmail: ['', [Validators.required, Validators.email]],
      vcAddress: ['', Validators.required],
      vcCountry: ['', Validators.required],
      vcCity: ['', Validators.required],
      dtBirthDate: ['', Validators.required], 
      iBeneficiaryTypeID: ['', Validators.required],
      vcCurrency: ['', Validators.required],
      // vcPhoto: [''],
    });
  }

  // Charger les détails et préremplir le formulaire
  getDetailBeneficiaire(): void {
    this.isLoading = true;
    this.beneficiaireService.detailBeneficiaire(this.idBeneficiaire).subscribe({
      next: (response: any) => {
        const dataArray = response.data;
        if (dataArray && dataArray.length > 0) {
          const data = dataArray[0];

          console.log('detail beneficiaire:', data);

          this.demande = {
            vcPersonalID: data.BeneficiaryID,
            vcPersonalName: `${data.vcFirstName} ${data.vcLastName}`,
            vcCity: data.vcCity,
            vcPhoto: data.vcPhoto, 
            vcPhoneNumber: data.vcPhoneNumber,
            vcEmail: data.vcEmail,
            vcCountry: data.vcCountry,
            vcAddress: data.vcAddress,
            typeClient: data.BeneficiaryTypeName,
            statutDemande: data.vcStatus,
            nomOrganisation: data.BankName ?? '—',
            phoneOrganisation: null,
            emailOrganisation: null,
            vcMotherName: null,
            comptes: [
              {
                vcAccountNumber: data.vcAccountNumber,
                vcAccountType: data.vcAccountType ?? '—',
                vcCurrency: data.vcCurrency,
                mBalance: data.mBalance ?? 0,
              },
            ],
          };

          this.modifyForm.patchValue({
            vcFirstName: data.vcFirstName,
            vcLastName: data.vcLastName,
            vcCity: data.vcCity,
            // vcPhoto: data.vcPhoto,
            vcCountry: data.vcCountry,
            vcAddress: data.vcAddress,
            vcEmail: data.vcEmail,
            vcPhoneNumber: data.vcPhoneNumber,

            // ✅ DATE (format HTML input[type=date])
            dtBirthDate: data.dtBirthDate ? data.dtBirthDate.split(' ')[0] : '',

            // ✅ SELECT = même type (number)
            iBeneficiaryTypeID: Number(data.BeneficiaryTypeID),

            // ✅ SELECT devise
            vcCurrency: data.vcCurrency,
          });

          console.log('modifyForm values:', this.modifyForm.value);

          // Préremplir le formulaire
          // this.modifyForm.patchValue({
          //   vcFirstName: data.vcFirstName,
          //   vcLastName: data.vcLastName,
          //   vcCity: data.vcCity,
          //   vcPhoneNumber: data.vcPhoneNumber,
          //   vcEmail: data.vcEmail,
          //   vcAddress: data.vcAddress,
          //   vcCountry: data.vcCountry,
          // });
        } else {
          this.demande = null;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erreur lors du chargement du bénéficiaire :', err);
      },
    });
  }

  selectedFile: File | null = null;
  photoPreview: string | ArrayBuffer | null = null;
  listeTypePaiement: any[] = [];
  listePays: any[] = [];
  listeTypeBeneficiaire: any[] = [];

  /** Chargement type bénéficiaire */
  private loadTypeBeneficiaires(): void {
    this.beneficiaireService.getListeTypeBeneficiaire().subscribe({
      next: (res) => (this.listeTypeBeneficiaire = res.data),
      error: (err) => console.error('Erreur type bénéficiaire', err),
    });
  }

  /** Chargement type paiement */
  private loadTypePaiements(): void {
    this.beneficiaireService.getListeTypePaiement().subscribe({
      next: (res) => (this.listeTypePaiement = res.data),
      error: (err) => console.error('Erreur type paiement', err),
    });
  }

  private listPays(): void {
    this.beneficiaireService.getCurrency().subscribe({
      next: (res) => (this.listePays = res.data),
      error: (err) =>
        console.error('Erreur lors de la recupration du curent', err),
    });
  }

  /** Gestion fichier */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => (this.photoPreview = reader.result);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  loadingModication: boolean = false;

  // Soumettre le formulaire pour modifier le bénéficiaire
  onSubmit(): void {
    this.loadingModication = true;
    if (this.modifyForm.invalid) return;

     if (this.selectedFile) {
        console.log('📷 Fichier sélectionné', this.selectedFile.name);
      } else {
        this.loadingModication = false;
        this.toastr.error('📷 Aucune photo sélectionnée', '', {
          positionClass: 'toast-custom-center',
        });
        return;
      }

    const payload = {
      iBeneficiaryID: this.idBeneficiaire,
      iOrganisationID: this.iOrganisationID,
      ...this.modifyForm.value,
    };

    this.beneficiaireService.modifierBeneficiaire(payload).subscribe({
      next: (res: any) => {
        console.log('✅ Beneficiaire modifié avec succès', res);
        this.toastr.success(res.message, '', {
            positionClass: 'toast-custom-center',
          });
        // Fermer le modal Bootstrap
        const modalEl = document.getElementById('modifierModal');
        if (modalEl) {
          const modal = bootstrap.Modal.getInstance(modalEl);
          modal?.hide();
        }
        this.loadingModication = false;
        // Recharger les détails
        this.getDetailBeneficiaire();
      },
      error: (err) => {
         this.loadingModication = false;
        console.error('Erreur lors de la modification :', err);
      },
    });
  }
}
