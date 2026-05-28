import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private base = 'https://anti-depression.onrender.com/api';
  //private base = 'https://127.0.0.1:8000/api';

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

  getContactExchangeStatus(matchId: number) {
    return this.http.get(`${this.base}/contact-exchange/status/${matchId}/`, this.getAuthHeaders());
  }

  getNews() {
    return this.http.get(`${this.base}/news/`);
  }

  getLofiTracks() {
    return this.http.get(`${this.base}/lofi/`);
  }

  getStudyRooms() {
    return this.http.get(`${this.base}/study/rooms/`, this.getAuthHeaders());
  }

  getStudyRoom(roomId: string) {
    return this.http.get(`${this.base}/study/rooms/${roomId}/`, this.getAuthHeaders());
  }

  createStudyRoom(data: any) {
    return this.http.post(`${this.base}/study/rooms/`, data, this.getAuthHeaders());
  }

  joinStudyRoom(roomId: string, data: any = {}) {
    return this.http.post(`${this.base}/study/rooms/${roomId}/join/`, data, this.getAuthHeaders());
  }

  leaveStudyRoom(roomId: string) {
    return this.http.post(`${this.base}/study/rooms/${roomId}/leave/`, {}, this.getAuthHeaders());
  }

  getStudyRoomMessages(roomId: string) {
    return this.http.get(`${this.base}/study/rooms/${roomId}/messages/`, this.getAuthHeaders());
  }

  sendStudyRoomMessage(roomId: string, data: any) {
    return this.http.post(`${this.base}/study/rooms/${roomId}/messages/`, data, this.getAuthHeaders());
  }

  activateContactExchange(matchId: number) {
    return this.http.post(`${this.base}/contact-exchange/activate/${matchId}/`, {}, this.getAuthHeaders());
  }

  getAcademicProfile() {
    return this.http.get(`${this.base}/profile/me/`, this.getAuthHeaders());
  }

  saveAcademicProfile(data: any) {
    return this.http.post(`${this.base}/profile/me/`, data, this.getAuthHeaders());
  }

  getEvents() {
    return this.http.get(`${this.base}/events/`, this.getAuthHeaders());
  }

  getNotifications() {
    return this.http.get(`${this.base}/notifications/`, this.getAuthHeaders());
  }

  getUnreadNotifications() {
    return this.http.get(`${this.base}/notifications/unread/`, this.getAuthHeaders());
  }

  markNotificationAsRead(notificationId: number) {
    return this.http.patch(`${this.base}/notifications/${notificationId}/read/`, {}, this.getAuthHeaders());
  }

  markAllNotificationsAsRead() {
    return this.http.patch(`${this.base}/notifications/mark-all-read/`, {}, this.getAuthHeaders());
  }
}
