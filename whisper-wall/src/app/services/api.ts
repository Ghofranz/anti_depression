import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private base = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) { }

  private getAuthHeaders() {
    const token = localStorage.getItem('token') || '';

    return {
      headers: new HttpHeaders({
        Authorization: `Token ${token}`
      })
    };
  }

  post_confess(data: any) {
    return this.http.post(`${this.base}/confess/`, data, this.getAuthHeaders());
  }

  get_all_confess() {
    return this.http.get(`${this.base}/confess/`, this.getAuthHeaders());
  }

  getMatches(id: number) {
    return this.http.get(`${this.base}/matches/${id}/`, this.getAuthHeaders());
  }

  getChat(matchId: number) {
    return this.http.get(`${this.base}/chat/${matchId}/`, this.getAuthHeaders());
  }

  sendMessage(data: any) {
    return this.http.post(`${this.base}/chat/send/`, data, this.getAuthHeaders());
  }

  reveal(data: any) {
    return this.http.post(`${this.base}/reveal/`, data, this.getAuthHeaders());
  }

  signUp(data: { name: string; email: string; username: string; password: string }) {
    return this.http.post(`${this.base}/sign_up/`, data);
  }

  login(data: any) {
    return this.http.post(`${this.base}/login/`, data);
  }

  getRevealStatus(matchId: number) {
    return this.http.get(`${this.base}/reveal/status/${matchId}/`, this.getAuthHeaders());
  }

  activateProfileSharing(matchId: number) {
    return this.http.post(`${this.base}/reveal/activate/${matchId}/`, {}, this.getAuthHeaders());
  }
}