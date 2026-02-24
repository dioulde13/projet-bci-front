import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MobileMoneyService } from '../../../servicesNodes/modePaiementOperateur/mobileMoney/mobile-money.service';
import { CommonModule } from '@angular/common';
import { NavigationCancel, NavigationEnd, NavigationError } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-type-paiement',
  imports: [CommonModule, RouterLink],
  standalone: true,
  templateUrl: './type-paiement.component.html',
  styleUrl: './type-paiement.component.css',
})
export class TypePaiementComponent implements OnInit {

  constructor(
    private mobileMoneyService: MobileMoneyService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.recupererListeOperateur();
  }

  // ===== LOADER NAVIGATION =====
  isLoading = false;
  private navigationSubscription!: Subscription;

  showLoader() {
    if (this.isLoading) return; // bloque double-clic
    this.isLoading = true;

    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }

    this.navigationSubscription = this.router.events.subscribe((event) => {
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.isLoading = false;
        this.navigationSubscription.unsubscribe();
      }
    });
  }
  // =============================

  nextPages(typeOperateur: string): void {
    if (!typeOperateur) {
      console.error('Nom du facturier manquant');
      return;
    }
    this.showLoader();
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
      error: (err) => {
        console.error(err);
        this.loadingOperateur = false;
      },
    });
  }
}