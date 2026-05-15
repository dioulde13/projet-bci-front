import { AfterViewInit, Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import flatpickr from 'flatpickr';
import { RouterLink } from '@angular/router';
import { French } from "flatpickr/dist/l10n/fr.js";
import { CommonModule } from '@angular/common';

import { TransfertMultipleSideMenuComponent } from '../side-menu/side-menu.component';

@Component({
  selector: 'app-validation-approbation',
  imports: [RouterLink, CommonModule, TransfertMultipleSideMenuComponent],
  standalone: true,
  templateUrl: './validation-approbation.component.html',
  styleUrl: './validation-approbation.component.css'
})
export class ValidationApprobationComponent implements OnInit, AfterViewInit {
  activeTabId: string = "v-pills-DetailsDesPaiements";

  @ViewChild('datepickerInput') datepickerInput!: ElementRef;
  calendarInstance: any;

  ngAfterViewInit() {
    this.calendarInstance = flatpickr(this.datepickerInput.nativeElement, {
      mode: 'range',
      locale: French
    });
  }

  openCalendar() {
    if (this.calendarInstance) {
      this.calendarInstance.open();
    }
  }

  infosUser: any;

  ngOnInit(): void {
    const userJson = localStorage.getItem('userInfo');
    if (userJson) {
      try {
        this.infosUser = JSON.parse(userJson);
      } catch {
        this.infosUser = null;
      }
    }
    // const hasReloaded = localStorage.getItem('validation_approbation_reloaded');

    // // Ne recharge qu'une seule fois
    // if (!hasReloaded) {
    //   localStorage.setItem('validation_approbation_reloaded', 'true');
    //   location.reload(); // Recharge total
    // } else {
    //   // Nettoyage pour permettre un autre reload si besoin plus tard
    //   localStorage.removeItem('validation_approbation_reloaded');
    // }
  }



  handleTabChange(tabId: any) {
    this.activeTabId = tabId;
  }

  isTabActive(tabId: string): boolean {
    return this.activeTabId === tabId;
  }

  isNotTabActive(tabId: string): boolean {
    return this.activeTabId !== tabId;
  }

  toggleTabPaiements(active: boolean) {
    this.activeTabId = active ? 'v-pills-DetailsDesPaiements' : 'v-pills-recapitulatifDesInformations';
  }

}
