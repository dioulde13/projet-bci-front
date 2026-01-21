import { AfterViewInit, Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import * as Papa from 'papaparse';
import flatpickr from 'flatpickr';
import { RouterLink } from '@angular/router';
import { French } from "flatpickr/dist/l10n/fr.js";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preparation-paie',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './preparation-paie.component.html',
  styleUrls: ['./preparation-paie.component.css']
})
export class PreparationPaieComponent implements OnInit, AfterViewInit {


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

  // ngAfterViewInit(){
  //   flatpickr("#datepicker", {
  //     mode: 'range',
  //     locale: French,
  //   });
  // }

  ngOnInit(): void {
    // const hasReloaded = localStorage.getItem('preparation_paie_reloaded');

    // // Ne recharge qu'une seule fois
    // if (!hasReloaded) {
    //   localStorage.setItem('preparation_paie_reloaded', 'true');
    //   location.reload(); // Recharge total
    // } else {
    //   // Nettoyage pour permettre un autre reload si besoin plus tard
    //   localStorage.removeItem('preparation_paie_reloaded');
    // }
  }
}
