import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatesManager } from './updates-manager';

describe('UpdatesManager', () => {
  let component: UpdatesManager;
  let fixture: ComponentFixture<UpdatesManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatesManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdatesManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
