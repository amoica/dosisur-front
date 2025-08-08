import { Injectable } from "@angular/core";
import { GenericDataService } from "../../core/service/generic-data.service";
import { User } from "../user/user.interface";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class UserService extends GenericDataService<User> {
  protected apiUrl = 'http://localhost:3000/api/user';

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
}