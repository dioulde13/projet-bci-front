import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ValiderUtilisateurServiceService } from '../../../../services/validerUtilisateurService/valider-utilisateur-service.service';

@Component({
  selector: 'app-verifier-validiter-email',
  imports: [],
  standalone: true,
  templateUrl: './verifier-validiter-email.component.html',
  styleUrl: './verifier-validiter-email.component.css'
})
export class VerifierValiditerEmailComponent implements OnInit {
  token!: string;
  email!: string;

  constructor(
    private validerTokeEmailService: ValiderUtilisateurServiceService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    // Récupérer directement le paramètre "token" de l'URL
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];
      this.email = params['email'];

      console.log(this.token);
      console.log(this.email);

      localStorage.setItem('token_recu', this.token);
      localStorage.setItem('email_recu', this.email);

      this.validerTokeEmailService.verifierTokenEtEmail(this.token, this.email).subscribe({
        next: (response) => {
          console.log(response);
          if (response.status === 200) {
            this.router.navigate(['/verifierOtpSiValide']);
          } else {
            // this.router.navigate(['/reunitialiserMotPasse']);
            this.toastr.error(response.message, '', {
              positionClass: 'toast-custom-center',
            });
          }
        },
        error: (err) => {
          console.log(err);
          this.toastr.error(err.message, '', {
              positionClass: 'toast-custom-center',
            });
        },
      });
      // }
    });
  }
}

