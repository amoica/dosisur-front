import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticuloDetailsComponent } from './articulo-details.component';

describe('ArticuloDetailsComponent', () => {
  let component: ArticuloDetailsComponent;
  let fixture: ComponentFixture<ArticuloDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticuloDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticuloDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
