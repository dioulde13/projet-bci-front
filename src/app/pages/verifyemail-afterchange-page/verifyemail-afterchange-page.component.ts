import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoadingServiceService } from '../../services/loading/loading-service.service';

@Component({
  selector: 'app-verifyemail-afterchange-page',
  imports: [],
  standalone: true,
  templateUrl: './verifyemail-afterchange-page.component.html',
  styleUrl: './verifyemail-afterchange-page.component.css',
})
export class VerifyemailAfterchangePageComponent {
  token!: string;
  email!: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingServiceService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];
      this.email = params['email'];

      // Recuperation des informations dans l'url
      localStorage.setItem('urlValidateToken', this.token);
      localStorage.setItem('urlValidateEmail', this.email);

      console.log('url params : ', { email: this.email, token: this.token });

      // this.token, this.email
      this.loadingService.verifyUserUpdate(this.token, this.email).subscribe({
        next: (res) => {
          if (res?.status && res?.status === 200) {
            this.router.navigate(['/login']);
            this.toastr.success('Adresse email vérifié avec succès', '', {
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
