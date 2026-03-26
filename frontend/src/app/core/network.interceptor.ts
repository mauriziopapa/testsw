import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpContextToken
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

export const BYPASS = new HttpContextToken(() => false);

@Injectable()
export class NetworkInterceptor implements HttpInterceptor {
  totalRequests = 0;
  requestsCompleted = 0;

  constructor(private loader: LoadingService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // per bypassare l'interceptor ed evitare il loader
    if (request.context.get(BYPASS) === true) return next.handle(request);

    this.loader.show();
    this.totalRequests++;

    return next.handle(request).pipe(
      finalize(() => {
        this.requestsCompleted++;

        if (this.requestsCompleted === this.totalRequests) {
          this.loader.hide();
          this.totalRequests = 0;
          this.requestsCompleted = 0;
        }
      })
    );
  }
}
