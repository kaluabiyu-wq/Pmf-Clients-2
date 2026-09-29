import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding} from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { jwtInterceptor } from './interceptors/jwt-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [

     provideZonelessChangeDetection(),
     provideRouter(routes, withComponentInputBinding()),
     provideAnimationsAsync(),
     provideHttpClient(),
    provideHttpClient(withInterceptors([jwtInterceptor])),
  
  ],
};