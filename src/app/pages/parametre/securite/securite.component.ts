import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ConfigPersonnalitionService } from '../../../services/configPersonnalition/config-personnalition.service';
import { CommonModule } from '@angular/common';

interface SecurityQuestion {
  vcQuestion: string;
  btEnabled: string;
  controlName: string;
}

@Component({
  selector: 'app-securite',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './securite.component.html',
  styleUrl: './securite.component.css',
})
export class SecuriteComponent implements OnInit {
  listesQuestions: SecurityQuestion[] = [];
  securiteForm!: FormGroup;
  isLoading = false;

  constructor(
    private configurationPer: ConfigPersonnalitionService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.getListeSecuriteQuestion();
  }

  // ── Helpers pour la barre de progression ──────────────────────────────────
  getFilledCount(): number {
    return this.listesQuestions.filter(
      (q) => this.securiteForm?.get(q.controlName)?.value?.trim()
    ).length;
  }

  getProgressPercent(): number {
    if (!this.listesQuestions.length) return 0;
    return Math.round((this.getFilledCount() / this.listesQuestions.length) * 100);
  }

  // ── Sauvegarde ─────────────────────────────────────────────────────────────
  saveSecuriteQuestionsSecurite(): void {
    if (this.securiteForm.invalid) {
      this.securiteForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const payload = this.securiteForm.value;

    // TODO : appeler votre service de sauvegarde
    // this.configurationPer.saveSecuriteQuestions(payload).subscribe({ ... })

    console.log('Sauvegarde :', payload);

    // Simulation — à retirer quand le service est branché
    setTimeout(() => (this.isLoading = false), 1500);
  }

  // ── Chargement des questions ───────────────────────────────────────────────
  getListeSecuriteQuestion(): void {
    this.configurationPer.getListeSecuriteQuestion().subscribe({
      next: (response: any) => {
        this.listesQuestions = response.data
          .filter((q: any) => q.btEnabled === '1')
          .map((q: any, index: number) => ({
            ...q,
            controlName: `q${index + 1}`,
          }));

        const group: Record<string, any> = {};
        this.listesQuestions.forEach((q) => {
          // ✅ Correction : toutes les questions sont obligatoires
          group[q.controlName] = ['', [Validators.required, Validators.minLength(2)]];
        });

        this.securiteForm = this.fb.group(group);
      },
      error: (err) => console.error('Erreur chargement questions :', err),
    });
  }
}