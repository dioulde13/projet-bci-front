import { AfterViewInit, Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import flatpickr from 'flatpickr';
import { RouterLink } from '@angular/router';
import { French } from "flatpickr/dist/l10n/fr.js";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-validation-approbation',
  imports: [RouterLink, CommonModule],
  standalone: true,
  templateUrl: './validation-approbation.component.html',
  styleUrl: './validation-approbation.component.css'
})
export class ValidationApprobationComponent implements OnInit , AfterViewInit {

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


    ngOnInit(): void {
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

 isActive: boolean = false;

  toggleTabPaiements(active: boolean) {
    this.isActive = active;
    console.log(this.isActive ? 'Affiché' : 'Masqué');
  }

}
