import { importProvidersFrom } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptors';

export const CORE_PROVIDERS = [
  importProvidersFrom(HttpClientModule),
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true,
  },
  // aquí podrías añadir otros providers (p.ej. CacheModule, TranslateModule via importProvidersFrom, etc.)
];