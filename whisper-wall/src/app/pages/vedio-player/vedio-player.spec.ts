import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VedioPlayer } from './vedio-player';

describe('VedioPlayer', () => {
  let component: VedioPlayer;
  let fixture: ComponentFixture<VedioPlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VedioPlayer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VedioPlayer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
