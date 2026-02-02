import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-formulaire-mode-paiement',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  standalone: true,
  templateUrl: './formulaire-mode-paiement.component.html',
  styleUrl: './formulaire-mode-paiement.component.css',
})
export class FormulaireModePaiementComponent implements OnInit {
  transfertForm!: FormGroup;

  typeOperateur!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.typeOperateur =
      this.route.snapshot.paramMap.get('typeOperateur') || '';

    console.log('Type opérateur reçu : ', this.typeOperateur);

    this.transfertForm = this.fb.group({
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
  }
}
