import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { TransfertMultipleSideMenuComponent } from '../side-menu/side-menu.component';

@Component({
  selector: 'app-execution-distribution',
  imports: [RouterLink, TransfertMultipleSideMenuComponent, CommonModule],
  standalone: true,
  templateUrl: './execution-distribution.component.html',
  styleUrl: './execution-distribution.component.css'
})
export class ExecutionDistributionComponent implements OnInit {
  activeTabId: string = 'v-pills-recapitulatifDesInformations';

  handleTabChange(tabId: string) {
    this.activeTabId = tabId;
  }

  isTabActive(tabId: string): boolean {
    return this.activeTabId === tabId;
  }

  isNotTabActive(tabId: string): boolean {
    return this.activeTabId !== tabId;
  }


  ngOnInit(): void {
    // const hasReloaded = localStorage.getItem('execute_distribution_reloaded');

    // // Ne recharge qu'une seule fois
    // if (!hasReloaded) {
    //   localStorage.setItem('execute_distribution_reloaded', 'true');
    //   location.reload(); // Recharge total
    // } else {
    //   // Nettoyage pour permettre un autre reload si besoin plus tard
    //   localStorage.removeItem('execute_distribution_reloaded');
    // }
  }
}
