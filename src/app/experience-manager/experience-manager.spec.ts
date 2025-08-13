import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperienceManager } from './experience-manager';

describe('ExperienceManager', () => {
  let component: ExperienceManager;
  let fixture: ComponentFixture<ExperienceManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperienceManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperienceManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
