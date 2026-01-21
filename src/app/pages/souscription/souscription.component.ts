import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SouscriptionsService } from '../../services/souscription/souscriptions.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-souscription',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './souscription.component.html',
  styleUrl: './souscription.component.css',
})
export class SouscriptionComponent {
  clientId: string = '';
  telephone!: number;
  resultat: any = null;
  erreur: string | null = null;

  loading: boolean = false;

  // Pour gérer l'affichage du modal
  showModal: boolean = false;

  constructor(
    private sousCription: SouscriptionsService,
    private toastr: ToastrService
  ) {}

  verifierNumeroCompte() {
    this.erreur = null;
    this.resultat = null;

    if (!this.clientId) {
      this.erreur = 'Veuillez entrer un ID client.';
      return;
    }

    this.loading = true;

    this.sousCription.verifierNumeroDeCompte(Number(this.clientId)).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.resultat = res;
          console.log(this.resultat);
          this.loading = false;

          if (res) {
            localStorage.setItem('vcJSONFullDetails', JSON.stringify(res));
          }
          // ✅ Stocker les comptes dans localStorage
          if (res.comptes) {
            localStorage.setItem('comptes', JSON.stringify(res.comptes));
          }

          // Tu peux aussi stocker les détails du client si besoin
          if (res.clientDetails) {
            localStorage.setItem(
              'clientDetails',
              JSON.stringify(res.clientDetails)
            );
            this.telephone = res.clientDetails.phoneNbr;
            localStorage.setItem(
              'msisdn',
              JSON.stringify(res.clientDetails.phoneNbr)
            );
          }

          // Affiche le modal
          this.showModal = true;
        } else {
        this.loading = false;
          this.toastr.error(res.message, '', {
            positionClass: 'toast-custom-center',
          });
        }
      },
      error: () => {
        this.erreur = 'Erreur : Impossible de récupérer les informations.';
        this.loading = false;
      },
    });
  }

  // Fermer le modal
  closeModal() {
    this.showModal = false;
  }

  onlyNumber(event: KeyboardEvent) {
    const char = event.key;

    // Autoriser uniquement les chiffres 0-9
    if (!/^[0-9]$/.test(char)) {
      event.preventDefault();
    }
  }
}
