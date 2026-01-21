import { Component, Renderer2 } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

    constructor(private router: Router, private rendered: Renderer2) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const isLoginPage = this.router.url === '/login';
        if (isLoginPage) {
          this.rendered.removeAttribute(document.body, 'data-sidebar-size');
        } else {
          this.rendered.setAttribute(document.body, 'data-sidebar-size', 'sm');
        }
      });
  }
}
