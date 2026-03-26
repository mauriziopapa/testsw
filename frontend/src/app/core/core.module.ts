import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { CacheService } from './cache.service';
import { HttpErrorInterceptor } from './error.interceptor';
import { NetworkInterceptor } from './network.interceptor';
import { ErrorComponent } from './error/error.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [MainLayoutComponent, ErrorComponent],
  imports: [
    //vendor
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule,

    //material
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatMenuModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatMomentDateModule
  ],
  providers: [
    CacheService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
    { provide: HTTP_INTERCEPTORS, useClass: NetworkInterceptor, multi: true }
  ],
  exports: [MainLayoutComponent, ErrorComponent]
})
export class CoreModule {}
