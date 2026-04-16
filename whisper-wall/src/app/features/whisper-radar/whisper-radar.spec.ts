import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhisperRadar } from './whisper-radar';

describe('WhisperRadar', () => {
  let component: WhisperRadar;
  let fixture: ComponentFixture<WhisperRadar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhisperRadar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhisperRadar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
