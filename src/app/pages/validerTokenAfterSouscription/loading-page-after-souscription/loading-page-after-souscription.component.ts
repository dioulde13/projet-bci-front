import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { VerifierTokenAfterSouscriptionService } from '../../../services/verifierTokenAfterSouscription/verifier-token-after-souscription.service';

@Component({
  selector: 'app-loading-page-after-souscription',
  imports: [],
  standalone: true,
  templateUrl: './loading-page-after-souscription.component.html',
  styleUrl: './loading-page-after-souscription.component.css',
})
export class LoadingPageAfterSouscriptionComponent {
  token!: string;
  email!: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: VerifierTokenAfterSouscriptionService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];
      this.email = params['email'];

      // Recuperation des informations dans l'url
      localStorage.setItem('token_recu', this.token);
      localStorage.setItem('email_recu', this.email);

      // this.token, this.email
      this.loadingService.verifierToken(this.token, this.email).subscribe({
        next: (res) => {
          if (res?.status && res?.status === 200) {
            // 👉 Ajout demandé
            // localStorage.setItem('emailAfterVToken', this.email);
            // console.log(res);
            this.router.navigate(['/pageOtpAfterVerifierTokenSouscription']);
            this.toastr.success(res.message, '', {
              positionClass: 'toast-custom-center',
            });
          } else {
            this.router.navigate(['/lien-expire']);
            this.toastr.error(res?.message, '', {
              positionClass: 'toast-custom-center',
            });
          }

          console.warn('DEBUG: After set token and email : ', res);
        },
        error: (err) => {
          this.toastr.error(
            err?.message || 'Erreur lors de la vérification du token',
            '',
            {
              positionClass: 'toast-custom-center',
            }
          );
          console.error('❌ Erreur lors de la vérification du token :', err);
        },
      });
    });
  }
}
