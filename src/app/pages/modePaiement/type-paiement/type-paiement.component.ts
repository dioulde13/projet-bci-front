import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MobileMoneyService } from '../../../servicesNodes/modePaiementOperateur/mobileMoney/mobile-money.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-type-paiement',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './type-paiement.component.html',
  styleUrl: './type-paiement.component.css',
})
export class TypePaiementComponent implements OnInit {
  // [src]="
  //                       'https://dev-api-bcibankjs.ecash-guinee.com/api/webdav/read-image/' +
  //                       facturier.vcLogoPath
  //                     "

  constructor(
    private mobileMoneyService: MobileMoneyService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.recupererListeOperateur();
  }

  nextPages(typeOperateur: string): void {
    if (!typeOperateur) {
      console.error('Nom du facturier manquant');
      return;
    }

    this.router.navigate(['/modePaiment', typeOperateur]);
  }

  listeOperateur: any[] = [];
  loadingOperateur: boolean = false;

  recupererListeOperateur() {
    this.loadingOperateur = true;
    this.mobileMoneyService.listeMobileOperators().subscribe({
      next: (response: any) => {
        this.listeOperateur = (response?.data ?? []).filter(
          (f: any) => f.btEnabled === true,
        );
        this.loadingOperateur = false;
      },
      error: (err) => console.error(err),
    });
  }
}
