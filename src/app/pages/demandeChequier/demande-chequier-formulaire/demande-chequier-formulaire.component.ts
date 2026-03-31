import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-demande-chequier-formulaire',
  imports: [CommonModule, FormsModule],
  templateUrl: './demande-chequier-formulaire.component.html',
  styleUrl: './demande-chequier-formulaire.component.css'
})
export class DemandeChequierFormulaireComponent {

  selectedCompte: string = '';
  selectedSuccursale: string = '';
  selectedFeuilles: string = '';

  onAnnuler(): void {
    this.selectedCompte = '';
    this.selectedSuccursale = '';
    this.selectedFeuilles = '';
  }

  onProceder(): void {
    if (!this.selectedCompte || !this.selectedSuccursale || !this.selectedFeuilles) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    console.log('Procéder avec:', {
      compte: this.selectedCompte,
      succursale: this.selectedSuccursale,
      feuilles: this.selectedFeuilles
    });
  }

}
