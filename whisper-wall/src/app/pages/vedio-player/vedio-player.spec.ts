import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { VedioPlayer } from './vedio-player';

describe('VedioPlayer', () => {
  let component: VedioPlayer;
  let fixture: ComponentFixture<VedioPlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VedioPlayer],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ roomId: 'night-library' })
            }
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VedioPlayer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the selected room', () => {
    expect(component.room.title).toContain('Night Library');
    expect(component.selectedTrack).toBe('Moonlight Beats');
    expect(component.participants.length).toBeGreaterThan(0);
  });
});
