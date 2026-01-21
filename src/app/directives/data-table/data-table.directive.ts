import { AfterViewInit, Directive } from '@angular/core';

declare var initMyDatatable: any;

@Directive({
  selector: '[appDataTable]',
})
export class DataTableDirective implements AfterViewInit {
  ngAfterViewInit() {
    setTimeout(() => {
      initMyDatatable();
    }, 0);
  }
}

// import { Directive, Input, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';

// @Directive({
//   selector: '[appDataTable]'
// })
// export class DataTableDirective implements AfterViewInit {

//   @Input() pageSize: number = 5;

//   private currentPage = 1;
//   private tbody!: HTMLTableSectionElement;
//   private rows: HTMLTableRowElement[] = [];
//   private paginationDiv!: HTMLElement;

//   constructor(private el: ElementRef, private renderer: Renderer2) {}

//   ngAfterViewInit(): void {
//     const table: HTMLTableElement = this.el.nativeElement;

//     // Récupérer tbody existant
//     this.tbody = table.querySelector('tbody')!;
//     if (!this.tbody) return;

//     // Récupérer toutes les lignes
//     this.rows = Array.from(this.tbody.querySelectorAll('tr')) as HTMLTableRowElement[];

//     // Créer pagination
//     this.createOrUpdatePagination();

//     // Afficher la première page
//     this.showPage(this.currentPage);
//   }

//   private showPage(page: number) {
//     this.currentPage = page;

//     const startIndex = (page - 1) * this.pageSize;
//     const endIndex = startIndex + this.pageSize;

//     this.rows.forEach((row, index) => {
//       if (index >= startIndex && index < endIndex) {
//         this.renderer.setStyle(row, 'display', '');
//       } else {
//         this.renderer.setStyle(row, 'display', 'none');
//       }
//     });
//   }

//   private createOrUpdatePagination() {
//     const parent = this.el.nativeElement.parentNode as HTMLElement;

//     // Crée le div de pagination si inexistant
//     if (!this.paginationDiv) {
//       this.paginationDiv = this.renderer.createElement('div');
//       this.renderer.setStyle(this.paginationDiv, 'margin-top', '10px');
//       this.renderer.setStyle(this.paginationDiv, 'text-align', 'center');
//       this.renderer.appendChild(parent, this.paginationDiv);
//     }

//     this.paginationDiv.innerHTML = ''; // Reset pagination

//     const totalPages = Math.ceil(this.rows.length / this.pageSize);

//     // Boutons Précédent
//     const prevBtn = this.renderer.createElement('button');
//     prevBtn.innerHTML = 'Précédent';
//     this.renderer.setStyle(prevBtn, 'margin-right', '5px');
//     this.renderer.listen(prevBtn, 'click', () => {
//       if (this.currentPage > 1) {
//         this.showPage(this.currentPage - 1);
//       }
//     });
//     this.renderer.appendChild(this.paginationDiv, prevBtn);

//     // Boutons page
//     for (let i = 1; i <= totalPages; i++) {
//       const btn = this.renderer.createElement('button');
//       btn.innerHTML = i.toString();
//       this.renderer.setStyle(btn, 'margin-right', '5px');
//       if (i === this.currentPage) {
//         this.renderer.setStyle(btn, 'font-weight', 'bold');
//       }
//       this.renderer.listen(btn, 'click', () => {
//         this.showPage(i);
//       });
//       this.renderer.appendChild(this.paginationDiv, btn);
//     }

//     // Boutons Suivant
//     const nextBtn = this.renderer.createElement('button');
//     nextBtn.innerHTML = 'Suivant';
//     this.renderer.listen(nextBtn, 'click', () => {
//       const totalPages = Math.ceil(this.rows.length / this.pageSize);
//       if (this.currentPage < totalPages) {
//         this.showPage(this.currentPage + 1);
//       }
//     });
//     this.renderer.appendChild(this.paginationDiv, nextBtn);
//   }
// }
