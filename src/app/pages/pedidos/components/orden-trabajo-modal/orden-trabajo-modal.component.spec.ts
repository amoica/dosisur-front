import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenTrabajoModalComponent } from './orden-trabajo-modal.component';

describe('OrdenTrabajoModalComponent', () => {
  let component: OrdenTrabajoModalComponent;
  let fixture: ComponentFixture<OrdenTrabajoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdenTrabajoModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdenTrabajoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
