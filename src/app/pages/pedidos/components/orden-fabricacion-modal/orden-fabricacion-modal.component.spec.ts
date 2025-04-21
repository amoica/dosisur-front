import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenFabricacionModalComponent } from './orden-fabricacion-modal.component';

describe('OrdenFabricacionModalComponent', () => {
  let component: OrdenFabricacionModalComponent;
  let fixture: ComponentFixture<OrdenFabricacionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdenFabricacionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdenFabricacionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
