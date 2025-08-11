import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';
import { APP_CONFIG, AppConfig } from '../../core/app-config';

interface LoginResponse{
  token:string,
  user:any
}

@Injectable({
  providedIn: 'root'
})


export class AuthService {

  private readonly cfg = inject<AppConfig>(APP_CONFIG);
  private apiUrl = this.cfg.apiUrl;
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());

  isLoggedIn$ = this.isLoggedInSubject.asObservable();


  constructor(private http: HttpClient, private router: Router) { }



  login(credentials: {email:string, password: string}){

    console.log(credentials);
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((res)=>{
        this.setToken(res.token);
        this.isLoggedInSubject.next(true);
        
      })
    )
  
  }

  logout() {
    // Limpia token y datos de sesión
    localStorage.removeItem('token'); // o el nombre que uses
    localStorage.removeItem('user');  // si guardás info del usuario
    sessionStorage.clear();           // opcional, por si usás sessionStorage

    // Redirige al login
    this.router.navigate(['/auth/login']);
  }


  isAuthenticated(): boolean {
    return this.hasToken();
    // si manejamos la sesión por storage
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');

  }

  getToken():string | null {
    return localStorage.getItem('token');
  }

  private setToken(token: string): void{
    localStorage.setItem('token', token)
  }
}
