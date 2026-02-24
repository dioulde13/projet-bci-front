import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MarchandService } from '../../../servicesNodes/paiementsMarchandEGD/marchand.service';
import { environment } from '../../../../environments/environment';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
} from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-paiements-de-factures',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paiements-de-factures.component.html',
  styleUrl: './paiements-de-factures.component.css',
})
export class PaiementsDeFacturesComponent implements OnInit {
  listeFacturier: any[] = [];
  environment = environment;
  baseLogoUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw8NDxANDRAPDQ0NDw8NDg4NDxANDQ0NFRIXFhYRFRUYHSggGBomHRUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OFxAQGC0lHiUzLi0tLS0tLS8tNS0tLTctLS4tNSswLy8tLisrKy8tKy0tLS0rLS0tLSstLS0vLSstLf/AABEIAL8BBwMBEQACEQEDEQH';

  constructor(
    private marchandService: MarchandService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getAllFacturiers();
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

  nextPages(nomFacture: string): void {
    if (!nomFacture) {
      console.error('Nom du facturier manquant');
      return;
    }
    this.showLoader();
    this.router.navigate(['/paiementFactureEDG', nomFacture]);
  }

  loadingFacturier: boolean = false;

  getAllFacturiers(): void {
    this.loadingFacturier = true;
    this.marchandService.getAllFacturiers().subscribe({
      next: (response: any) => {
        this.listeFacturier = (response?.data ?? []).filter(
          (f: any) => f.btEnabled === true,
        );
        this.loadingFacturier = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingFacturier = false;
      },
    });
  }
}