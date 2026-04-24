import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private base = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  post_confess(data: any) {
    const url = `${this.base}/confess/`;
    console.log('Calling API:', url, 'Token:', localStorage.getItem('token'));
    return this.http.post(url, data);
  }

  get_all_confess(data: any) {
    const url = `${this.base}/confess/`;
    console.log('Calling API:', url, 'Token:', localStorage.getItem('token'));
    return this.http.get(url, data);
  }

  getMatches(id: number) {
    const url = `${this.base}/matches/${id}/`;
    console.log('Calling API:', url, 'Token:', localStorage.getItem('token'));
    return this.http.get(url);
  }

  getChat(matchId: number) {
    const url = `${this.base}/chat/${matchId}/`;
    console.log('Calling API:', url, 'Token:', localStorage.getItem('token'));
    return this.http.get(url);
  }

  sendMessage(data: any) {
    const url = `${this.base}/chat/send/`;
    console.log('Calling API:', url, 'Token:', localStorage.getItem('token'));
    return this.http.post(url, data);
  }

  reveal(data: any) {
    const url = `${this.base}/reveal/`;
    console.log('Calling API:', url, 'Token:', localStorage.getItem('token'));
    return this.http.post(url, data);
  }

  signUp(data: { name: string; email: string; username: string; password: string }) {
    const url = `${this.base}/sign_up`;
    console.log('Calling API:', url, 'Token:', localStorage.getItem('token'));
    console.log('Signup data sent:', data);
    return this.http.post(url, data);
  }
}
