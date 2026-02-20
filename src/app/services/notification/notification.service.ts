import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

   constructor(private toastr: ToastrService) {}

  error(message: string, title: string = ''): void {
    this.toastr.error(message, title, {
      positionClass: 'toast-custom-center',
      timeOut: 12000,
      extendedTimeOut: 3000,
      closeButton: true,
    });
  }

  success(message: string, title: string = ''): void {
    this.toastr.success(message, title, {
      positionClass: 'toast-custom-center',
      timeOut: 12000,
      closeButton: true,
    });
  }

  warning(message: string, title: string = ''): void {
    this.toastr.warning(message, title, {
      positionClass: 'toast-custom-center',
      timeOut: 12000,
      closeButton: true,
    });
  }

  info(message: string, title: string = ''): void {
    this.toastr.info(message, title, {
      positionClass: 'toast-custom-center',
      timeOut: 12000,
      closeButton: true,
    });
  }
}
