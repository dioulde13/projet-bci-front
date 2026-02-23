import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CurrencyPipe, NgClass, NgForOf, NgIf } from '@angular/common';

import { BeneficiaireEnAttenteService } from '../../../servicesNodes/beneficiaireEnAttente/beneficiaire-en-attente.service';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '../../../services/notification/notification.service';

declare var bootstrap: any;

@Component({
  selector: 'app-detail-beneficiaire',
  standalone: true,
  imports: [NgIf, NgForOf, NgClass, CurrencyPipe, ReactiveFormsModule],
  templateUrl: './detail-beneficiaire.component.html',
  styleUrl: './detail-beneficiaire.component.css',
})
export class DetailBeneficiaireComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private beneficiaireService: BeneficiaireEnAttenteService,
    private fb: FormBuilder,
    // private toastr: ToastrService,
    private notification: NotificationService,
    private router: Router
  ) {}

  /* =======================
   * VARIABLES
   * ======================= */
  idDemande!: number;
  isLoading = true;


  bloqueForm!: FormGroup;
  valideForm!: FormGroup;

  // reasons: any[] = [];

  /* =======================
   * INIT
   * ======================= */

  infosUser: any;
  idUser!: number;

  ngOnInit(): void {
    const userJson = localStorage.getItem('userInfo');
    if (userJson) {
      try {
        this.infosUser = JSON.parse(userJson);
      } catch (e) {
        console.error('Erreur parsing userInfo depuis localStorage', e);
        this.infosUser = null;
      }
    } else {
      this.infosUser = null;
    }

    if (this.infosUser) {
      this.idUser = this.infosUser.id;
    }

    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      console.error('❌ ID manquant dans l’URL');
      return;
    }

    this.idDemande = Number(idParam);

    this.initForms();
    this.getDetailBeneficiaire();
    this.loadRejectRaisons();
  }

  /* =======================
   * FORMULAIRES
   * ======================= */

  atLeastOneRequired(group: FormGroup) {
    const reason = group.get('rejectReason')?.value;
    const note = group.get('vcNotes')?.value;
    return reason || note ? null : { atLeastOneRequired: true };
  }

  demande: any = null;

  getDetailBeneficiaire(): void {
    this.isLoading = true;

    this.beneficiaireService
      .detailBeneficiaireEnAttente(this.idDemande)
      .subscribe({
        next: (res: any) => {
          if (res?.status === 200 && res?.data) {
            const data = res.data;

            // 🔹 Mapping API → UI
            this.demande = {
              vcPersonalID: data.BeneficiaryID,
              vcPersonalName: `${data.vcFirstName} ${data.vcLastName}`,
              vcPhoneNumber: data.vcPhoneNumber,
              vcEmail: data.vcEmail,
              vcCountry: data.vcCountry,
              vcAddress: data.vcAddress,

              typeClient: data.BeneficiaryTypeName,
              statutDemande: data.vcStatus,

              nomOrganisation: data.BankName,
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
          } else {
            this.demande = null;
          }

          this.isLoading = false;
        },
        error: (err) => {
          console.error('❌ Erreur chargement bénéficiaire', err);
          this.isLoading = false;
        },
      });
  }

  initForms(): void {
    this.bloqueForm = this.fb.group(
      {
        rejectReason: [''],
        vcNotes: [''],
      },
      { validators: this.atLeastOneRequired }
    );

    this.valideForm = this.fb.group({
      vcNotes: ['', Validators.required],
    });
  }

  onRejectAsk(): void {
    if (this.bloqueForm.invalid) return;

    // Calcul de vcNotes à envoyer
    const vcNotesToSend = this.bloqueForm.value.rejectReason
      ? this.bloqueForm.value.rejectReason
      : this.bloqueForm.value.vcNotes;

    const payload = {
      idDemande: this.idDemande,
      vcNotes: vcNotesToSend,
      iValidatorID: this.idUser,
    };

    console.log('✅ Validation demande', payload);

    this.beneficiaireService
      .detailBeneficiaireRejeter(
        payload.idDemande,
        payload.vcNotes,
        payload.iValidatorID
      )
      .subscribe({
        next: (res) => {
          this.notification.success(res.message);
          // this.toastr.success(res.message, '', {
          //   positionClass: 'toast-custom-center',
          // });
          this.router.navigate(['/beneficiaireEnAttente']);
          // console.log('✅ Demande validée avec succès', res);
          this.closeModal('valideModal');
          this.valideForm.reset();
        },
        error: (err) => {
          console.error('❌ Erreur lors de la validation', err);
        },
      });

    this.closeModal('unblockModal');
    this.bloqueForm.reset();
  }

  onValidateAsk(): void {
    if (this.valideForm.invalid) return;

    const payload = {
      idDemande: this.idDemande,
      ...this.valideForm.value,
      iValidatorID: this.idUser,
    };

    console.log('✅ Validation demande', payload);

    // Appel du service pour valider le bénéficiaire
    this.beneficiaireService
      .detailBeneficiaireValider(
        payload.idDemande,
        payload.vcNotes, // Assure-toi que vcNotes est bien un champ du formulaire
        payload.iValidatorID
      )
      .subscribe({
        next: (res) => {
          // console.log('res', res);
          this.notification.success(res.message);
          this.router.navigate(['/beneficiaireEnAttente']);
          this.closeModal('valideModal');
          this.valideForm.reset();
        },
        error: (err) => {
          this.notification.error('Une erreur interne est survenue.');
          // console.error('❌ Erreur lors de la validation', err);
          // Gérer l'erreur (toast, message, etc.)
        },
      });

    this.closeModal('valideModal');
    this.valideForm.reset();
  }

  /* =======================
   * MODALS
   * ======================= */
  openModal(id: string): void {
    const modalEl = document.getElementById(id);
    if (!modalEl) return;

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

  closeModal(id: string): void {
    const modalEl = document.getElementById(id);
    if (!modalEl) return;

    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
  }

  reasons: any[] = [];

  private loadRejectRaisons() {
    this.beneficiaireService.getListeRejectReasons().subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.reasons = res.data.reasons;
          console.log('reasons:', this.reasons);
        } else {
          console.log('err demandes:', this.reasons);
        }
        console.log('res load reject reasons', res);
      },

      error: (err) => {
        console.log('err load reject reasons :', err);
      },
    });
  }
}
