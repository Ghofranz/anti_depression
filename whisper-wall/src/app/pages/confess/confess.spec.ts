import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Confess } from './confess';

describe('Confess', () => {
  let component: Confess;
  let fixture: ComponentFixture<Confess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Confess]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Confess);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
