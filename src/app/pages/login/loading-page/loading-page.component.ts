import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingServiceService } from '../../../services/loading/loading-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-loading-page',
  imports: [],
  standalone: true,
  templateUrl: './loading-page.component.html',
  styleUrl: './loading-page.component.css',
})
export class LoadingPageComponent implements OnInit {
  token!: string;
  email!: string;

  constructor(
    private loadingService: LoadingServiceService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    // Récupérer directement le paramètre "token" de l'URL
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];
      this.email = params['email'];

      localStorage.setItem('token_recu', this.token);
      localStorage.setItem('email_recu', this.email);

      this.loadingService.verifierToken(this.token, this.email).subscribe({
        next: (response) => {
          console.log(response);
          if (response.status === 200) {
            this.router.navigate(['/formNouveauMotPasse']);
          } else {
            this.router.navigate(['/reunitialiserMotPasse']);
            // console.log(response.message);
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
