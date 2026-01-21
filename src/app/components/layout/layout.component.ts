import { Component, Inject, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe, DOCUMENT } from '@angular/common';
import { Renderer2 } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Papa from 'papaparse';
import { AuthService } from '../../services/authServices/auth.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';

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
export class LayoutComponent implements OnInit, AfterViewInit {
  isDarkMode = false; // Toujours light par défaut

  constructor(
    private renderer: Renderer2,
    private authService: AuthService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    private toastr: ToastrService
  ) {}

  userCurrentTimeZone: string = '';
  csvData: any[] = [];
  headers: string[] = [];
  selectedFile: File | null = null;

  // Quand on sélectionne un fichier, on le stocke mais on ne parse pas encore
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  // Quand on clique sur "Charger", on parse le fichier stocké
  onFormSubmit(event: Event): void {
    event.preventDefault(); // Empêche le rechargement de page
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

  // Ajoute une méthode getUser() pour exposer le signal value dans le template
  getUser() {
    const result = this.authService.userInfo();
    // console.log('Résultat de userInfo:', result);
    return result;
  }

  getUserInfoConfig() {
    const result = this.authService.userInfoConfig();
    // console.log('Résultat de userInfoConfig:', result);

     const dataConfig = result;
    // console.log('dataConfig : ', dataConfig);
    if (dataConfig) {
      this.userCurrentTimeZone = dataConfig.organisation.find(
        (c: any) => c.vcKey === 'TimeZone'
      )?.vcValue;
      // console.log('userCurrentTimeZone : ', this.userCurrentTimeZone);
    }
    return result;
  }

  currentUserInfo: any;

  ngOnInit(): void {
    // const dataConfig = this.getUserInfoConfig();
    // console.log('dataConfig : ', dataConfig);
    // if (dataConfig) {
    //   this.userCurrentTimeZone = dataConfig.organisation.find(
    //     (c: any) => c.vcKey === 'TimeZone'
    //   )?.vcValue;
    //   console.log('userCurrentTimeZone : ', this.userCurrentTimeZone);
    // }
  }

  ngAfterViewInit(): void {
    const modeButton = this.document.getElementById('mode-setting-btn');
    if (modeButton) {
      modeButton.addEventListener('click', () => {
        this.toggleTheme();
      });
    }
  }

  // On force toujours light au premier chargement
  setLightThemeAsDefault(): void {
    this.isDarkMode = false;
    this.applyTheme(this.isDarkMode);
    localStorage.setItem('theme', 'light');
  }

  toggleTheme(): void {
    // Au clic, on lit directement l'état du localStorage (pas la variable isDarkMode)
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

    // Attributs fixes
    this.renderer.setAttribute(body, 'data-layout-scrollable', 'false');
    this.renderer.setAttribute(body, 'data-layout-size', 'fluid');
    this.renderer.setAttribute(body, 'data-sidebar-size', 'sm');
    this.renderer.addClass(body, 'mat-typography');
  }

  isLoggingOut = false;

  logout(): void {
    this.isLoggingOut = true;

    // 🔹 afficher le toast et récupérer la référence
    const toastRef = this.toastr.success('Déconnexion en cours...', '', {
      positionClass: 'toast-custom-center',
      disableTimeOut: true, // pour qu'il reste visible jusqu'à suppression
    });

    this.authService.deConnexion().subscribe({
      next: (response) => {
        this.isLoggingOut = false;

        // 🔹 supprimer le toast "en cours"
        this.toastr.clear(toastRef.toastId);

        if (response.status === 200) {
          console.log('Déconnexion réussie :', response);
          this.toastr.success('Déconnexion réussie...', '', {
            positionClass: 'toast-custom-center',
          });
          this.router.navigate(['/login']);
        } else {
          this.toastr.error(response.message, '', {
            positionClass: 'toast-custom-center',
          });
        }
      },
      error: (error) => {
        this.isLoggingOut = false;

        // 🔹 supprimer le toast "en cours" si erreur aussi
        this.toastr.clear(toastRef.toastId);

        console.error('Erreur lors de la déconnexion :', error);
        this.toastr.error('Erreur lors de la déconnexion.', '', {
          positionClass: 'toast-custom-center',
        });
      },
    });
  }
}
