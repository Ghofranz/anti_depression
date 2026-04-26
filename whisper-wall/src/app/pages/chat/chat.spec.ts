import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { Chat } from './chat';
import { Api } from '../../services/api';

describe('Chat', () => {
  let component: Chat;
  let fixture: ComponentFixture<Chat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chat],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ matchId: '1' })
            }
          }
        },
        {
          provide: Api,
          useValue: {
            getMatches: () => of([]),
            getContactExchangeStatus: () => of({
              my_contact_exchange_active: false,
              peer_contact_exchange_active: false,
              both_active: false,
              my_profile: null,
              peer_profile: null
            }),
            getChat: () => of([]),
            sendMessage: () => of({ message: 'ok', timestamp: '2026-01-01T00:00:00Z' }),
            saveAcademicProfile: () => of({})
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Chat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
