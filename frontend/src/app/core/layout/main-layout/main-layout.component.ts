import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';
import { LoadingService } from '../../../services/loading.service';
import { MenuVoice } from 'src/app/models/menu-voice';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'main-layout',
    templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.scss'],
    standalone: false
})
export class MainLayoutComponent implements OnInit, AfterViewInit {
  test = false;
  localhost = false;

  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;

  user = '';
  userRole = '';
  username = '';

  loading$ = this.loader.loading$;
  // Menu a scomparsa abilitato per default
  isTablet = true; //false;

  titoloTablet = '';
  dash = '';

  menuVoices = new Array<MenuVoice>();

  backgroundColor = '#058a41';

  constructor(
    private observer: BreakpointObserver,
    private router: Router,
    private loginService: LoginService,
    private loader: LoadingService
  ) {
    if (environment.test) {
      this.test = true;
    }
    if (environment.local) {
      this.localhost = true;
    }

    const currentUser = this.loginService.getCurrentUser();
    if (currentUser?.username) {
      if (currentUser.theme === 'red') {
        this.backgroundColor = '#c31421';
      } else {
        this.backgroundColor = '#058a41';
      }
      this.user = `${this.capitalizeFirstLetter(currentUser.username)} ${this.capitalizeFirstLetter(
        currentUser.surname
      )}`;
      this.username = currentUser.username;
      this.userRole = 'test';
      this.menuVoices = currentUser.dashboards.map((sec) => new MenuVoice(sec.name, sec.url));
    }

    this.dash = this.router.url.replace('/', '');
  }

  ngOnInit(): void {}

  // Menu a scomparsa abilitato per default
  ngAfterViewInit(): void {
    this.isTablet = true;
    this.sidenav.mode = 'over';
    void this.sidenav.close();
  }

  /*
  Observer per far comparire/scomparire il menu laterale
  ngAfterViewInit(): void {
    this.observer
      .observe(['(max-width: 1100px)'])
      .pipe(delay(1))
      .subscribe((res) => {
        if (res.matches) {
          this.isTablet = true;
          this.sidenav.mode = 'over';
          void this.sidenav.close();
        } else {
          this.isTablet = false;
          this.sidenav.mode = 'side';
          void this.sidenav.open();
        }
      });
  }
  */

  logout(): void {
    this.loginService.logout().subscribe(() => {
      void this.router.navigate(['/login']);
    });
  }

  setTitoloTablet(voice: MenuVoice) {
    this.dash = voice.url;
    this.titoloTablet = voice.name;
  }

  setTitoloTabelle(voice: string): void {
    this.titoloTablet = voice;
  }

  capitalizeFirstLetter(string: string): string {
    if (string != null) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    return '';
  }
}
