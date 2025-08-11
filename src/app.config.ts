import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling, withRouterConfig } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { appRoutes } from './app.routes';
import { authInterceptorFn } from './app/core/interceptors/auth.interceptors';

import { APP_CONFIG, AppConfig } from './app/core/app-config';
import { ConfigLoaderService } from './app/core/config-loader.service';

export const appConfig: ApplicationConfig = {
  providers: [
    // 1) Router
    provideRouter(
      appRoutes,
      withRouterConfig({ onSameUrlNavigation: 'reload' }),
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withEnabledBlockingInitialNavigation()
    ),

    // 2) CARGA DE CONFIG ANTES QUE NADA
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [ConfigLoaderService],
      useFactory: (loader: ConfigLoaderService) => () => loader.load() // fetch('assets/config.json')
    },
    {
      provide: APP_CONFIG,
      deps: [ConfigLoaderService],
      useFactory: (loader: ConfigLoaderService) => {
        // Si querés, dejá un fallback silencioso mientras debugueás:
        return (loader.config ?? { production: false, apiUrl: 'http://localhost:3000/api' }) as AppConfig;
      }
    },

    // 3) HTTP client + interceptores (ahora sí)
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptorFn])
    ),

    // 4) Otros
    provideAnimationsAsync(),
    providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } })
  ]
};