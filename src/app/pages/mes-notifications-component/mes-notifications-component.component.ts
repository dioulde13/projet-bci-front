import { Component, OnInit } from '@angular/core';
import { MesNotifsService } from '../../services/mesNotifs/mes-notifs-service.service';
import { AuthService } from '../../services/authServices/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { DataTableDirective } from '../../directives/data-table/data-table.directive';

declare var bootstrap: any;

@Component({
  selector: 'app-mes-notifications-component',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, DataTableDirective],
  templateUrl: './mes-notifications-component.component.html',
  styleUrls: ['./mes-notifications-component.component.css'],
})
export class MesNotificationsComponentComponent implements OnInit {
   isLoading: boolean = false;
  notifications: any[] = [];
  currentUser: any = null;

  selectedUserId: number | null = null;
  btEnabled: boolean = false;
  errorMessage: string = '';
  isloadingBloquerDebloquer: boolean = false;

  constructor(
    private mesNotifsService: MesNotifsService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUserInfo();
    this.loadNotifications();
  }

  private loadNotifications(): void {
    this.isLoading = true;

    this.mesNotifsService.mesNotifications(this.currentUser.id).subscribe({
      next: (res) => {
        if (res?.status && res?.status === 200) {
          this.notifications = res.data;
          console.log('res api => ', res);
        } else {
          this.toastr.error(res?.message);
          console.log('Erreur chargement mes notifs : ', res);
        }
        this.isLoading = false;
      },

      error: (err) => {
          this.toastr.error(err?.error?.message === "Unauthenticated." ? "Votre session a expiré." : 'Erreur lors du chargement des pays',
          '',
          {
            positionClass: 'toast-custom-center',
          }
        );
        this.isLoading = false;
      },
    });
  }

  openModalBloquerDebloquer(notification: any) {
    this.selectedUserId = notification.id;
    this.btEnabled = notification.btEnabled === '0';
  }

  closeModalBloquerDebloquer() {
    const modalElement = document.getElementById('bloquerDebloquerModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }

    if (this.isloadingBloquerDebloquer) return; // 🔒 bloque la fermeture pendant le chargement
  }

  bloquerEtDebloquer(): void {
    if (this.isloadingBloquerDebloquer) return; // 🔒 empêche le double clic
    if (this.selectedUserId === null) {
      this.toastr.error('Aucune notification sélectionnée.');
      return;
    }

    this.isloadingBloquerDebloquer = true;

    const params = {
      idNotification: this.selectedUserId,
      btEnabled: this.btEnabled,
    };

    this.mesNotifsService.setToggleNotification(params).subscribe({
      next: (res) => {
        if (res?.status && res?.status === 200) {
          this.toastr.success(res?.message);
          this.loadNotifications();
        } else {
          this.toastr.error(res?.message);
        }
        this.isloadingBloquerDebloquer = false;
        this.closeModalBloquerDebloquer();
      },

      error: (err) => {
         this.toastr.error(err?.error?.message === "Unauthenticated." ? "Votre session a expiré." : 'Erreur lors du chargement des pays',
          '',
          {
            positionClass: 'toast-custom-center',
          }
        );
        this.isloadingBloquerDebloquer = false;
        this.closeModalBloquerDebloquer();
      },
    });
  }
}
