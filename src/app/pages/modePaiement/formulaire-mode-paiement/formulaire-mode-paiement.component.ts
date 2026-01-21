import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-formulaire-mode-paiement',
  imports: [ ReactiveFormsModule, CommonModule, RouterLink],
  standalone: true,
  templateUrl: './formulaire-mode-paiement.component.html',
  styleUrl: './formulaire-mode-paiement.component.css'
})
export class FormulaireModePaiementComponent implements OnInit {

  transfertForm!: FormGroup;

  // pour illustrer les options du type de paiement etc.
  typesPaiement = ['Interne', 'Domestique', 'Mobile Money'];
  fournisseursMobileMoney = ['Orange Money', 'MTN Mobile Money', 'Moov Money']; // etc.

  comptesSource = [
    { numero: '7308054285', solde: 247_200_000 },
    // ajouter d'autres si nécessaire
  ];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.transfertForm = this.fb.group({
      typePaiement: ['Mobile Money', Validators.required],
      fournisseur: ['Orange Money', Validators.required],
      numeroMobile: ['', [Validators.required, Validators.pattern(/^\d{8,15}$/)]],  // adapter le pattern
      nomCompte: ['', [Validators.required, Validators.minLength(2)]],
      emailBeneficiaire: ['', [Validators.required, Validators.email]],
      compteSource: [this.comptesSource[0].numero, Validators.required],
      montant: ['', [Validators.required, Validators.min(1)]],
      devise: ['GNF', Validators.required],
      objetTransfert: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  get f() {
    return this.transfertForm.controls;
  }

  onSubmit(): void {
    if (this.transfertForm.invalid) {
      this.transfertForm.markAllAsTouched();
      return;
    }
    const formValue = this.transfertForm.value;
    console.log('Transfert soumis :', formValue);
    // ici appeler le service pour traitement
  }
}
