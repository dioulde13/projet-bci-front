import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormNouveauPasseService } from '../../../../services/formNouveauPasse/form-nouveau-passe.service';
import { NotificationService } from '../../../../services/notification/notification.service';

@Component({
  selector: 'app-creer-mot-de-passe',
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true,
  templateUrl: './creer-mot-de-passe.component.html',
  styleUrl: './creer-mot-de-passe.component.css',
})
export class CreerMotDePasseComponent implements OnInit {
  form!: FormGroup;
  message = '';
  success = false;
  loading = false;

  showPassword = false; // 👁 pour afficher/masquer mot de passe
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private formNouveauPasseService: FormNouveauPasseService,
    private router: Router,
    private toastr: ToastrService,
    private notification: NotificationService,
  ) {}

  ngOnInit(): void {
    // ✅ Création du formulaire réactif avec deux champs
    this.form = this.fb.group({
      nouveauPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmerPassword: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    const { nouveauPassword, confirmerPassword } = this.form.value;

    // ⚠️ Vérifier la correspondance des mots de passe
    if (nouveauPassword !== confirmerPassword) {
      this.form.get('confirmerPassword')?.setErrors({ mismatch: true });
      return;
    }

    this.loading = true;

    this.formNouveauPasseService.verifierToken(nouveauPassword).subscribe({
      next: (res) => {
        // console.log(res);
        if (res.status && res.status === 200) {
          // console.log(res.message);
          // this.toastr.success(res.message, '', {
          //   positionClass: 'toast-custom-center',
          // });
          this.notification.success(res.message);
          this.success = true;
          localStorage.removeItem('email_recu');
          localStorage.removeItem('token_recu');
          this.router.navigate(['/login']);
        } else {
          // console.log(res.message);
          this.notification.error(res.message);
          // this.toastr.error(res.message, '', {
          //   positionClass: 'toast-custom-center',
          // });
          this.success = false;
        }
        this.loading = false;
      },
      error: (err) => {
        this.success = false;
        this.notification.error(err.message);
        // this.toastr.error(err?.message, '', {
        //   positionClass: 'toast-custom-center',
        // });
        this.loading = false;
      },
    });
  }
}
