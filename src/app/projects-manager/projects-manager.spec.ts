import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsManager } from './projects-manager';

describe('ProjectsManager', () => {
  let component: ProjectsManager;
  let fixture: ComponentFixture<ProjectsManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectsManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
