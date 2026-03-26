import { NgModule, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
registerLocaleData(localeIt);

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { HttpRequestInterceptor } from './helpers/request.interceptor';

@NgModule({ declarations: [AppComponent],
    bootstrap: [AppComponent], imports: [CoreModule, AppRoutingModule], providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpRequestInterceptor,
            multi: true
        },
        {
            provide: LOCALE_ID,
            useValue: 'it-IT'
        },
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule {}
