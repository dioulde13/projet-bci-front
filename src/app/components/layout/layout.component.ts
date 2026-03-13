import {
  Component,
  Inject,
  OnInit,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { CommonModule, DatePipe, DOCUMENT } from '@angular/common';
import { Renderer2 } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import Papa from 'papaparse';
import { AuthService } from '../../services/authServices/auth.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { StatutBancaireService } from '../../servicesNodes/statutBancaire/statut-bancaire.service';
import { NotificationService } from '../../services/notification/notification.service';
import { SidebarService } from '../../services/sidebar/sidebar.service';
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    FormsModule,
    CommonModule,
    MatSnackBarModule,
    DatePipe,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent implements OnInit, OnDestroy, AfterViewInit {
  isDarkMode = false;

  constructor(
    private renderer: Renderer2,
    private authService: AuthService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    // private toastr: ToastrService,
    private notification: NotificationService,
    private statutBancaireService: StatutBancaireService,
    private sidebarService: SidebarService,
  ) {}

  userCurrentTimeZone: string = '';
  csvData: any[] = [];
  headers: string[] = [];
  selectedFile: File | null = null;

  // ── Polling ─────────────────────────────────────────────────────────────────
  statusCoreBanking: any;
  showNetworkNotification = false;
  private statusPolling$!: Subscription;

  // ── CSV ──────────────────────────────────────────────────────────────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onFormSubmit(event: Event): void {
    event.preventDefault();
    if (this.selectedFile) {
      this.parseCSV(this.selectedFile);
    } else {
      alert('Veuillez sélectionner un fichier CSV avant de charger.');
    }
  }

  parseCSV(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const csv = reader.result as string;
      Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          this.csvData = result.data;
          if (this.csvData.length > 0) {
            this.headers = Object.keys(this.csvData[0]);
          }
        },
      });
    };
    reader.readAsText(file);
  }

  // ── Utilisateur ──────────────────────────────────────────────────────────────
  getUser() {
    return this.authService.userInfo();
  }

  getUserInfoConfig() {
    const result = this.authService.userInfoConfig();
    if (result) {
      this.userCurrentTimeZone = result.organisation.find(
        (c: any) => c.vcKey === 'TimeZone',
      )?.vcValue;
    }
    return result;
  }

  currentUserInfo: any;

  // ── Core Banking Status ──────────────────────────────────────────────────────
  recuperStatusCoreBanking() {
    this.statutBancaireService.coreBankingStatus().subscribe({
      next: (response: any) => {
        this.statusCoreBanking = response.data;
        console.log('this.statusCoreBanking: ', this.statusCoreBanking);

        if (
          this.statusCoreBanking?.available === false &&
          this.statusCoreBanking?.status === 'ko'
        ) {
          // afficher notification seulement si service indisponible
          this.showNetworkNotification =
            this.statusCoreBanking?.available === true;
        } else {
          this.showNetworkNotification =
            this.statusCoreBanking?.available === false;
        }
      },
      error: () => {
        // en cas d’erreur API → considérer comme indisponible
        this.showNetworkNotification = false;
      },
    });
  }

  private startPolling(): void {
    this.statusPolling$ = interval(10_000).subscribe(() => {
      this.recuperStatusCoreBanking();
    });
  }

  // ── Notification ─────────────────────────────────────────────────────────────
  notificationEnCoursDeveloppement(): void {
    this.notification.error(
      'Cette fonctionnalité est en cours de développement.',
    );
  }

  // ── Sidebar ──────────────────────────────────────────────────────────────────
  private applySidebarState(): void {
    const size = this.sidebarService.isSidebarCollapsed ? 'sm' : 'lg';
    this.renderer.setAttribute(this.document.body, 'data-sidebar-size', size);

    if (this.sidebarService.isSidebarCollapsed) {
      this.renderer.removeClass(this.document.body, 'sidebar-enable');
    } else {
      this.renderer.addClass(this.document.body, 'sidebar-enable');
    }
  }

  toggleSidebar(): void {
    this.sidebarService.isSidebarCollapsed =
      !this.sidebarService.isSidebarCollapsed;
    this.applySidebarState();
  }

  toggleSubMenu(menuId: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.sidebarService.toggleSubMenu(menuId);
  }

  isSubMenuOpen(menuId: string): boolean {
    return this.sidebarService.isSubMenuOpen(menuId);
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    // 1. Theme initialization
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    }
    this.applyTheme(this.isDarkMode);

    // 2. Sidebar initialization
    this.applySidebarState();

    // 3. Listen for navigation to re-apply states
    // Some routes or external scripts might reset body attributes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.applySidebarState();
        this.applyTheme(this.isDarkMode);
      });

    this.recuperStatusCoreBanking(); // 1er appel immédiat
    this.startPolling(); // puis toutes les 10 secondes
  }

  ngOnDestroy(): void {
    this.statusPolling$?.unsubscribe(); // évite les fuites mémoire
  }

  ngAfterViewInit(): void {
    const modeButton = this.document.getElementById('mode-setting-btn');
    if (modeButton) {
      modeButton.addEventListener('click', () => {
        this.toggleTheme();
      });
    }
  }

  // ── Thème ────────────────────────────────────────────────────────────────────
  setLightThemeAsDefault(): void {
    this.isDarkMode = false;
    this.applyTheme(this.isDarkMode);
    localStorage.setItem('theme', 'light');
  }

  toggleTheme(): void {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'light') {
      this.isDarkMode = true;
      localStorage.setItem('theme', 'dark');
    } else {
      this.isDarkMode = false;
      localStorage.setItem('theme', 'light');
    }
    this.applyTheme(this.isDarkMode);
  }

  applyTheme(isDark: boolean): void {
    const body = this.document.body;
    if (isDark) {
      this.renderer.setAttribute(body, 'data-bs-theme', 'dark');
      this.renderer.setAttribute(body, 'data-sidebar', 'dark');
      this.renderer.setAttribute(body, 'data-topbar', 'dark');
    } else {
      this.renderer.setAttribute(body, 'data-bs-theme', 'light');
      this.renderer.setAttribute(body, 'data-sidebar', 'brand');
      this.renderer.setAttribute(body, 'data-topbar', 'brand');
    }
    this.renderer.setAttribute(body, 'data-layout-scrollable', 'false');
    this.renderer.setAttribute(body, 'data-layout-size', 'fluid');
    // We removed the hardcoded 'sm' size from here to allow toggleSidebar to manage it
    this.renderer.addClass(body, 'mat-typography');
  }

  // ── Déconnexion ──────────────────────────────────────────────────────────────
  isLoggingOut = false;

  logout(): void {
    this.isLoggingOut = true;

    this.notification.error('Déconnexion en cours...');
    // const toastRef = this.toastr.success('Déconnexion en cours...', '', {
    //   positionClass: 'toast-custom-center',
    //   disableTimeOut: true,
    // });

    this.authService.deConnexion().subscribe({
      next: (response) => {
        this.isLoggingOut = false;
        // this.toastr.clear(toastRef.toastId);

        if (response.status === 200) {
          this.notification.success('Déconnexion réussie...');
          // this.toastr.success('Déconnexion réussie...', '', {
          //   positionClass: 'toast-custom-center',
          // });
          this.router.navigate(['/login']);
        } else {
          this.notification.error(response.message);
          // this.toastr.error(response.message, '', {
          //   positionClass: 'toast-custom-center',
          // });
        }
      },
      error: (error) => {
        this.isLoggingOut = false;
        // this.toastr.clear(toastRef.toastId);
        console.error('Erreur lors de la déconnexion :', error);
        this.notification.success('Erreur lors de la déconnexion.');
        // this.toastr.error('Erreur lors de la déconnexion.', '', {
        //   positionClass: 'toast-custom-center',
        // });
      },
    });
  }
}
