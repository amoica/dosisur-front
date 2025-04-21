import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoFabricacionComponent } from './pedido-fabricacion.component';

describe('PedidoFabricacionComponent', () => {
  let component: PedidoFabricacionComponent;
  let fixture: ComponentFixture<PedidoFabricacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidoFabricacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedidoFabricacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
