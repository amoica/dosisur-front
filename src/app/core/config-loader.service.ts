import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfigLoaderService {
  private _config: any;

  get config() { return this._config; }

  load(): Promise<void> {
    // Evita caching agresivo en CDNs si querés: añade `?v=${Date.now()}` en dev.
    return fetch('assets/config.json', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Config fetch failed: ${res.status}`);
        this._config = await res.json();
      })
      .catch((err) => {
        console.error('Failed to load config.json', err);
        // Fallbacks seguros para levantar la app igual:
        this._config = { production: false, apiUrl: 'http://localhost:3000/api' };
      });
  }
}
