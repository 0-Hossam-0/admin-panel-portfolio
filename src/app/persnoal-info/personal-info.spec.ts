import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersnoalInfo } from './persnoal-info';

describe('PersnoalInfo', () => {
  let component: PersnoalInfo;
  let fixture: ComponentFixture<PersnoalInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersnoalInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersnoalInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
