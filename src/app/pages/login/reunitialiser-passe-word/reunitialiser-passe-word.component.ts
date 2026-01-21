import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/authServices/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reunitialiser-passe-word',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reunitialiser-passe-word.component.html',
  styleUrls: ['./reunitialiser-passe-word.component.css']
})
export class ReunitialiserPasseWordComponent {

  forgotPasswordForm: FormGroup;
  loading = false;
  message = '';
  success = false;

  constructor(
    private fb: FormBuilder,
     private authService: AuthService, 
     private router: Router,
     private toastr: ToastrService
    ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.loading = true;
    this.message = '';

    const { email } = this.forgotPasswordForm.value;

    // ✅ Enregistrer l'email dans le localStorage
    // localStorage.setItem('email_recu', email);

    this.authService.requestResetPassword(email).subscribe({
      next: (res) => {
        console.log(res);
        // this.success = true;
        if (res.status === 200) {
          this.toastr.success(res.message, '', {
            positionClass: 'toast-custom-center',
          });
        this.router.navigate(['/login']);
        } else {
          this.toastr.error(res.message, '', {
            positionClass: 'toast-custom-center',
          });
        }
        this.loading = false;
      },
      error: (err) => {
        this.success = false;
        this.toastr.error(err.message, '', {
          positionClass: 'toast-custom-center',
        });
        // this.message = err.error?.message || 'Une erreur est survenue.';
        this.loading = false;
      }
    });
  }

}
