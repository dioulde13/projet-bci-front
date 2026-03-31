import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface ChequeRequest {
  accountNumber: string;
  transactionReference: string;
  numberOfLeaves: number;
  transactionDate: string;
  transactionDate2: string;
  status: string;
}


@Component({
  selector: 'app-demande-chequier-liste',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './demande-chequier-liste.component.html',
  styleUrl: './demande-chequier-liste.component.css'
})
export class DemandeChequierListeComponent implements OnInit {

  columns = [
    { key: 'accountNumber', label: 'Numéro de compte' },
    { key: 'transactionReference', label: 'Référence de transaction' },
    { key: 'numberOfLeaves', label: 'Nombre de feuilles' },
    { key: 'transactionDate', label: 'Date de transaction' },
    { key: 'transactionDate2', label: 'Date de transaction' },
    { key: 'status', label: 'Statut' },
  ];

  // Replace with real data from your service
  allData: ChequeRequest[] = [];

  searchTerm = '';
  filteredData: ChequeRequest[] = [];

  pageSize = 10;
  currentPage = 1;
  sortColumn = '';
  sortDirection: 'asc' | 'desc' | '' = '';

  get totalEntries(): number { return this.allData.length; }
  get totalPages(): number { return Math.max(1, Math.ceil(this.filteredData.length / this.pageSize)); }
  get showingFrom(): number { return this.filteredData.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; }
  get showingTo(): number { return Math.min(this.currentPage * this.pageSize, this.filteredData.length); }

  get pagedData(): ChequeRequest[] {
    let data = [...this.filteredData];

    if (this.sortColumn) {
      data.sort((a: any, b: any) => {
        const valA = a[this.sortColumn];
        const valB = b[this.sortColumn];
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const start = (this.currentPage - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  }

  ngOnInit(): void {
    // Load data here, e.g.:
    // this.chequeService.getPendingRequests().subscribe(data => {
    //   this.allData = data;
    //   this.filteredData = data;
    // });
    this.filteredData = [...this.allData];
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredData = [...this.allData];
    } else {
      this.filteredData = this.allData.filter(row =>
        row.accountNumber.toLowerCase().includes(term) ||
        row.transactionReference.toLowerCase().includes(term) ||
        row.numberOfLeaves.toString().includes(term) ||
        row.transactionDate.toLowerCase().includes(term) ||
        row.transactionDate2.toLowerCase().includes(term) ||
        row.status.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  sortBy(key: string): void {
    if (this.sortColumn === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = key;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
  }

  getSortDir(key: string): string {
    return this.sortColumn === key ? this.sortDirection : '';
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
    };
    return map[status.toLowerCase()] ?? status;
  }

}
