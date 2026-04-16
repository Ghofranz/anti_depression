import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private base = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  post_confess(data: any) {
    return this.http.post(`${this.base}/confess/`, data);
  }

  get_all_confess(data: any) {
    return this.http.get(`${this.base}/confess/`, data);
  }

  getMatches(id: number) {
    return this.http.get(`${this.base}/matches/${id}/`);
  }

  getChat(matchId: number) {
    return this.http.get(`${this.base}/chat/${matchId}/`);
  }

  sendMessage(data: any) {
    return this.http.post(`${this.base}/chat/send/`, data);
  }

  reveal(data: any) {
    return this.http.post(`${this.base}/reveal/`, data);
  }

   signUp(data: { name: string; email: string; username: string; password: string }) {
    return this.http.post(`${this.base}/sign_up/`, data);
    console.log('Signup data sent:', data);
  }
}
