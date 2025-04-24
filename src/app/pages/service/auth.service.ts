import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';

interface LoginResponse{
  token:string,
  user:any
}

@Injectable({
  providedIn: 'root'
})


export class AuthService {

  private apiUrl = 'http://localhost:3000/api';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());

  isLoggedIn$ = this.isLoggedInSubject.asObservable();


  constructor(private http: HttpClient) { }



  login(credentials: {email:string, password: string}){

    console.log(credentials);
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((res)=>{
        this.setToken(res.token);
        this.isLoggedInSubject.next(true);
        
      })
    )
  
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
