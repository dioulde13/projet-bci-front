import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ValidationTransaction {
  compte: string;
  bic: string;
  devise: string;
  idtableau: number;
}

export interface ValidationResult {
  compte: string;
  bic: string;
  devise: string;
  idtableau: number;
  valid: boolean;
  errors: string[];
}

export interface ValidationResponse {
  status: number;
  message: string;
  data: ValidationResult[];
}

@Injectable({
  providedIn: 'root',
})
export class GenericFileService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  validateTransactions(
    transactions: ValidationTransaction[]
  ): Observable<ValidationResponse> {
    const body = { transactions };
    console.log('💡 validateBeneficiaireAfterUploadeCsv body:', body);
    return this.http.post<ValidationResponse>(
      `${this.baseUrl}/api/validateBeneficiaireAfterUploadeCsv`,
      body
    );
  }
}