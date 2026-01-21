import { AfterViewInit, Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import flatpickr from 'flatpickr';
import { RouterLink } from '@angular/router';
import { French } from "flatpickr/dist/l10n/fr.js";

@Component({
  selector: 'app-calcul-paie',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './calcul-paie.component.html',
  styleUrl: './calcul-paie.component.css'
})
export class CalculPaieComponent implements OnInit , AfterViewInit {

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
    // const hasReloaded = localStorage.getItem('calcul_paie_reloaded');

    // // Ne recharge qu'une seule fois
    // if (!hasReloaded) {
    //   localStorage.setItem('calcul_paie_reloaded', 'true');
    //   location.reload(); // Recharge total
    // } else {
    //   // Nettoyage pour permettre un autre reload si besoin plus tard
    //   localStorage.removeItem('calcul_paie_reloaded');
    // }
  }
}
