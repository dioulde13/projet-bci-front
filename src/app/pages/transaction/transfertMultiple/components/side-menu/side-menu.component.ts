import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../../services/authServices/auth.service';

@Component({
  selector: 'app-transfert-multiple-side-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css']
})
export class TransfertMultipleSideMenuComponent implements OnInit {
  @Input() currentPage: string = '';
  @Output() tabChange = new EventEmitter<string>();

  private authService = inject(AuthService);
  userRoleId: string | number | null = null;

  ngOnInit(): void {
    const userInfo: any = this.authService.getUserInfo();
    if (userInfo && userInfo.iRoleID) {
      this.userRoleId = userInfo.iRoleID;
    }
  }

  onTabClick(tabId: string) {
    this.tabChange.emit(tabId);
  }

  // Helpers for template visibility
  canSeePreparation(): boolean {
    // Initiateur (11), Assistant (12), Comptable (13), Chef (14)
    const roles = [11, 12, 13, 14, '11', '12', '13', '14'];
    return roles.includes(this.userRoleId as any);
  }

  canSeeCalcul(): boolean {
    // Same as preparation
    return this.canSeePreparation();
  }

  canSeeValidation(): boolean {
    // Assistant (12), Comptable (13), Chef (14)
    const roles = [12, 13, 14, '12', '13', '14'];
    return roles.includes(this.userRoleId as any);
  }

  canSeeExecution(): boolean {
    // DAF (15)
    return this.userRoleId == 15 || this.userRoleId == '15';
  }

  canSeeReporting(): boolean {
    // Everyone in the list (11-15) can see reporting based on notes
    const roles = [11, 12, 13, 14, 15, '11', '12', '13', '14', '15'];
    return roles.includes(this.userRoleId as any);
  }
}
