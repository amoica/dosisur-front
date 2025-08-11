import { inject, Injectable } from "@angular/core";
import { GenericDataService } from "../../core/service/generic-data.service";
import { User } from "../user/user.interface";
import { BehaviorSubject, catchError, map, Observable, of, tap } from "rxjs";
import { APP_CONFIG, AppConfig } from "../../core/app-config";


export interface UserMe {
  id: number;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string; // <- ya completa (host+puerto)
}

@Injectable({ providedIn: 'root' })
export class UserService extends GenericDataService<User> {


  private readonly cfg = inject<AppConfig>(APP_CONFIG);
  protected apiUrl = `${this.cfg.apiUrl}/user`;

  private _me$ = new BehaviorSubject<UserMe | null>(null);
  private _fetched = false;

  resetPassword(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/reset-password`, {});
  }

  createUserFormData(user: FormData) {
    for (const [key, value] of user.entries()) {
      console.log(`FormData[${key}] =`, value);
    }
    return this.http.post(`${this.apiUrl}`, user);
  }

  updateUserFormData(id: string, data: FormData) {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

  get snapshot(): UserMe | null { return this._me$.value; }
  meStream() { return this._me$.asObservable(); }

  loadMe(force = false): Observable<UserMe | null> {
    if (this._fetched && !force) return of(this._me$.value);
    this._fetched = true;

    return this.http.get<{ data: UserMe }>(`${this.cfg.apiUrl}/user/me`).pipe(
      map(r => r.data),
      tap(u => this._me$.next(u)),
      catchError(() => { this._me$.next(null); return of(null); })
    );
  }

  clear() { this._fetched = false; this._me$.next(null); }
}