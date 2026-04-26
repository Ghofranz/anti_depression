import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-vedio-player',
  imports: [CommonModule, RouterModule],
  templateUrl: './vedio-player.html',
  styleUrl: './vedio-player.scss',
})
export class VedioPlayer implements OnInit {
  room: any;
  participants: Array<{ name: string; focus: string; avatar: string }> = [];
  loFiTracks = [
    'Rain Study',
    'Moonlight Beats',
    'Coffee & Loops',
    'Soft Keys',
  ];
  selectedTrack = this.loFiTracks[0];
  isPlaying = true;

  private rooms = [
    {
      id: 'focus-hall',
      title: 'Focus Hall',
      subtitle: 'A silent room for deep work and revision',
      description:
        'Join a room, see who is studying, and keep your attention on the task. Chat is disabled so everyone stays focused.',
      people: '18 students',
      color: 'linear-gradient(180deg, #020617, #1d4ed8)',
      track: 'Rain Study',
      participants: [
        { name: 'Maya', focus: 'Calculus notes', avatar: 'M' },
        { name: 'Noah', focus: 'Django revisions', avatar: 'N' },
        { name: 'Amina', focus: 'Flashcards', avatar: 'A' },
        { name: 'Leo', focus: 'Report writing', avatar: 'L' },
      ]
    },
    {
      id: 'night-library',
      title: 'Night Library',
      subtitle: 'Shared lo-fi room for late-night concentration',
      description:
        'This room is built for quiet co-study. You can join, watch everyone focusing, and choose a lo-fi mix to match the pace.',
      people: '42 students',
      color: 'linear-gradient(180deg, #111827, #7c3aed)',
      track: 'Moonlight Beats',
      participants: [
        { name: 'Sara', focus: 'Essay draft', avatar: 'S' },
        { name: 'Omar', focus: 'Exam prep', avatar: 'O' },
        { name: 'Hana', focus: 'Math practice', avatar: 'H' },
        { name: 'Zed', focus: 'Presentation deck', avatar: 'Z' },
      ]
    },
    {
      id: 'exam-rush',
      title: 'Exam Rush Room',
      subtitle: 'A calm room for focused revision sprints',
      description:
        'Use the room like a virtual library table: everyone is visible, nobody talks, and the background lo-fi keeps the energy steady.',
      people: '26 students',
      color: 'linear-gradient(180deg, #042f2e, #0f766e)',
      track: 'Coffee & Loops',
      participants: [
        { name: 'Iris', focus: 'Biology review', avatar: 'I' },
        { name: 'Sam', focus: 'Past papers', avatar: 'S' },
        { name: 'Jade', focus: 'Vocabulary', avatar: 'J' },
        { name: 'Ben', focus: 'Summary sheet', avatar: 'B' },
      ]
    },
    {
      id: 'desk-setup',
      title: 'Desk Setup Corner',
      subtitle: 'Aesthetic co-working room for planning and note-taking',
      description:
        'A soft room for getting organized. Join, see the other people, and stay in flow with a lo-fi track in the background.',
      people: '11 students',
      color: 'linear-gradient(180deg, #431407, #ea580c)',
      track: 'Soft Keys',
      participants: [
        { name: 'Ivy', focus: 'Note cleanup', avatar: 'I' },
        { name: 'Tom', focus: 'Reading plan', avatar: 'T' },
        { name: 'Nora', focus: 'Lecture recap', avatar: 'N' },
        { name: 'Ali', focus: 'To-do list', avatar: 'A' },
      ]
    }
  ];

  roomId = 'focus-hall';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('roomId')
      || this.route.snapshot.paramMap.get('id')
      || 'focus-hall';

    const selectedRoom = this.rooms.find((room) => room.id === this.roomId) || this.rooms[0];
    this.room = selectedRoom;
    this.participants = selectedRoom.participants;
    this.selectedTrack = selectedRoom.track;
  }

  togglePlayback() {
    this.isPlaying = !this.isPlaying;
  }

  selectTrack(track: string) {
    this.selectedTrack = track;
  }
}