import {
  Component,
  ViewChildren,
  QueryList,
  ElementRef,
  OnInit,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OtpAfterSouscriptionService } from '../../services/validerOtpAfterSouscription/otp-after-souscription.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-otp-validation',
  imports: [RouterLink, FormsModule],
  standalone: true,
  templateUrl: './otp-validation.component.html',
  styleUrl: './otp-validation.component.css',
})
export class OtpValidationComponent implements OnInit {
  constructor(
    private verifierOtp: OtpAfterSouscriptionService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  msisdn!: string;

  ngOnInit(): void {
    const msisdn = localStorage.getItem('msisdn');

    if (msisdn) {
      // Enlever les guillemets ajoutés par JSON.stringify
      this.msisdn = msisdn.replace(/"/g, '');
      console.log('MSISDN récupéré =', this.msisdn);
    }
  }

  // ♥ Correction ici : une seule référence #otpInput dans le HTML
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  otpValues: string[] = ['', '', '', ''];

  onOtpInput(event: any, index: number) {
    const value = event.target.value;

    this.otpValues[index] = value;

    if (value.length === 1 && index < this.otpValues.length - 1) {
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  moveToNext(event: any, index: number) {
    const input = event.target;
    const value = input.value;

    // avancer
    if (value.length === 1 && index < this.otpInputs.length - 1) {
      const nextInput = this.otpInputs.toArray()[index + 1].nativeElement;
      nextInput.focus();
    }

    // retour
    if (event.key === 'Backspace' && value.length === 0 && index > 0) {
      const prevInput = this.otpInputs.toArray()[index - 1].nativeElement;
      prevInput.focus();
    }
  }

  isOtpComplete(): boolean {
    return this.otpValues.every((value) => value.trim() !== '');
  }

  isLoadingVerification: boolean = false;

  retourApi: any;

  verifyOTPSouscription() {
    const otp = this.otpValues.join(''); // ex: "1234"

    if (otp.length !== 4) {
      this.toastr.error('Veuillez saisir un OTP complet.', '', {
        positionClass: 'toast-custom-center',
      });
      // alert('Veuillez saisir un OTP complet.');
      return;
    }

    this.isLoadingVerification = true;

    this.verifierOtp.verifyOTPSouscription(otp, this.msisdn).subscribe({
      next: (response) => {
        this.retourApi = response;
        console.log(this.retourApi);

        if (this.retourApi.status === 200) {
          this.isLoadingVerification = false;
          this.toastr.success(this.retourApi.message, '', {
            positionClass: 'toast-custom-center',
          });
          this.router.navigate(['/configPersonalisation']);
        } else if(this.retourApi.status === 500){
          this.isLoadingVerification = false;
          this.toastr.error("Une erreur interne est survenue", '', {
            positionClass: 'toast-custom-center',
          });
          // console.log(this.retourApi.message);
        }else {
          this.isLoadingVerification = false;
          this.toastr.error(this.retourApi.message, '', {
            positionClass: 'toast-custom-center',
          });
          // console.log(this.retourApi.message);
        }
      },
      error: (error: any) => {
        this.toastr.error("Une erreur interne est survenue", '', {
          positionClass: 'toast-custom-center',
        });
        this.isLoadingVerification = false;
        console.error(error);
      },
    });
  }

  isLoadingRenvoiOtp: boolean = false;
  dataRenvoiApi: any;

  renvoiOTPAfterSouscription() {
    // console.log(this.msisdn);
    this.isLoadingRenvoiOtp = true;
    this.verifierOtp.renvoiOtpAfterSouscription(this.msisdn).subscribe({
      next: (response) => {
        this.dataRenvoiApi = response;
        console.log(this.dataRenvoiApi);

        if (this.dataRenvoiApi.status === 200) {
          this.isLoadingRenvoiOtp = false;
          this.toastr.success(this.dataRenvoiApi.message, '', {
            positionClass: 'toast-custom-center',
          });
          // console.log(this.dataRenvoiApi);
        } else {
          this.isLoadingRenvoiOtp = false;
          this.toastr.error(this.dataRenvoiApi.message, '', {
            positionClass: 'toast-custom-center',
          });
          // console.log(this.dataRenvoiApi);
        }
      },
      error: (error: any) => {
          this.isLoadingRenvoiOtp = false;
        this.toastr.error(error.error.message, '', {
          positionClass: 'toast-custom-center',
        });
        console.error(error);
      },
    });
  }
}
