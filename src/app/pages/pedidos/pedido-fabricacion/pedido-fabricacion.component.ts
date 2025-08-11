import { Component, OnInit, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { filter, finalize, forkJoin, lastValueFrom, of, take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService, MessageService } from 'primeng/api';

// PrimeNG
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SkeletonModule } from 'primeng/skeleton';
import { AccordionModule } from 'primeng/accordion';

import { PedidoFacade } from './pedido.facade';
import { RecetaService } from '../../service/receta.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FileUploadModule } from 'primeng/fileupload';

const makeUid = () => (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));

@Component({
  selector: 'app-pedido-fabricacion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule,
    CardModule, DividerModule, DropdownModule, MultiSelectModule, ButtonModule,
    ConfirmDialogModule, ToastModule, PanelModule, InputTextModule,
    InputNumberModule, ToggleButtonModule, SkeletonModule, AccordionModule, FileUploadModule
  ],
  templateUrl: './pedido-fabricacion.component.html',
  styleUrls: ['./pedido-fabricacion.component.scss'],
  providers: [PedidoFacade, ConfirmationService, MessageService]
})
export class PedidoFabricacionComponent implements OnInit {
  // VM (pedido + skid + catálogos)
  readonly facade = inject(PedidoFacade);
  readonly vm$ = this.facade.vm$;
  isLocked = false;
  loading = false;

  private route = inject(ActivatedRoute);
  private confirm = inject(ConfirmationService);
  private toast = inject(MessageService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private recetaSrv = inject(RecetaService);

  form!: FormGroup;

  // accesores
  get panelesFA(): FormArray { return this.form.get('paneles') as FormArray; }
  get bombasFA(): FormArray { return this.form.get('bombas') as FormArray; }
  get skidFA(): FormArray { return this.form.get('seccionesSkid') as FormArray; }
  get tabsFA(): FormArray { return this.form.get('seccionesTableros') as FormArray; }
  get instFA(): FormArray { return this.form.get('seccionesInstrumentos') as FormArray; }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id) || id <= 0) {
      this.toast.add({ severity: 'warn', summary: 'ID inválido', detail: 'No se encontró la orden.' });
      return;
    }

    this.vm$.pipe(
      filter(vm => !vm.loading && !!vm.pedido),
      take(1)
    ).subscribe(vm => {
      const snap = vm.pedido!.snapshotSkid || {};
      this.buildFormFromSnapshot(snap);

      if (this.panelesFA.length === 0) this.addPanelRow();
      if (this.bombasFA.length === 0) this.addBombaRow();

      this.materializeSkidFromApi(vm.skid);
      this.materializeSelectedRecetas(snap.tableros || [], snap.instrumentos || []);
      this.applyLockFromEstado(vm.pedido?.estado);
    });

    this.vm$.pipe(
      filter(vm => !vm.loading && !!vm.pedido && !!this.form),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(vm => {
      const s = vm.pedido!.snapshotSkid || {};
      this.patchBasicsFromSnapshot(s);
      this.applyLockFromEstado(vm.pedido?.estado);
    });
  }

  // ---------- Form ----------
  private buildFormFromSnapshot(s: any) {
    this.form = this.fb.group({
      baterias: [s.baterias ?? 'No aplica'],
      tanque: [!!s.tanque],
      calibracion: [!!s.calibracion],
      psv: [s.psv ?? ''],

      paneles: this.fb.array((s.paneles ?? []).map((p: any) => this.rowGroup(p))),
      bombas: this.fb.array((s.bombas ?? []).map((b: any) => this.rowGroup(b))),

      tablerosIds: [s.tableros ?? []],
      instrumentosIds: [s.instrumentos ?? []],

      seccionesSkid: this.fb.array([]),
      seccionesTableros: this.fb.array([]),
      seccionesInstrumentos: this.fb.array([]),

      estadoDestino: [null]
    });
  }

  private buildSnapshotFromForm() {
    const raw = this.form.getRawValue();
    const normalizeRows = (rows: any[]) =>
      (rows || [])
        .filter(r => r?.insumoId && r?.cantidad)
        .map(r => ({ insumoId: Number(r.insumoId), cantidad: Number(r.cantidad) }));

    const mergeSecs = (arr: any[]) => (arr || []).map((s: any) => ({
      tipo: s.tipo,
      nombre: s.nombre,
      baseComponenteId: s.baseComponenteId ?? null,
      items: (s.items || []).map((it: any) => ({
        insumoId: Number(it.insumoId),
        cantidad: Number(it.cantidad)
      }))
    }));

    return {
      baterias: raw.baterias ?? 'No aplica',
      tanque: !!raw.tanque,
      calibracion: !!raw.calibracion,
      psv: raw.psv ?? '',
      paneles: normalizeRows(raw.paneles),
      bombas: normalizeRows(raw.bombas),
      tableros: raw.tablerosIds || [],
      instrumentos: raw.instrumentosIds || [],
      seccionesExtras: [
        ...mergeSecs(raw.seccionesSkid),
        ...mergeSecs(raw.seccionesTableros),
        ...mergeSecs(raw.seccionesInstrumentos)
      ]
    };
  }

  private applyLockFromEstado(estado?: string) {
    const lock = estado === 'APROBADA';
    this.isLocked = lock;
    if (this.form) {
      lock ? this.form.disable({ emitEvent: false }) : this.form.enable({ emitEvent: false });
    }
  }

  private patchBasicsFromSnapshot(s: any) {
    if (!this.form) return;
    this.form.patchValue({
      baterias: s.baterias ?? 'No aplica',
      tanque: !!s.tanque,
      calibracion: !!s.calibracion,
      psv: s.psv ?? '',
      tablerosIds: s.tableros ?? [],
      instrumentosIds: s.instrumentos ?? []
    }, { emitEvent: false });

    const rebuildArray = (fa: FormArray, list: any[]) => {
      while (fa.length) fa.removeAt(0, { emitEvent: false });
      list.forEach(item => fa.push(this.rowGroup(item), { emitEvent: false }));
    };
    rebuildArray(this.panelesFA, s.paneles ?? []);
    rebuildArray(this.bombasFA, s.bombas ?? []);
  }

  // ---------- helpers de grupos ----------
  private rowGroup(row?: any) {
    const fg = this.fb.group({
      insumoId: [row?.insumoId ?? null, Validators.required],
      cantidad: [row?.cantidad ?? 1, [Validators.required, Validators.min(1)]]
    });
    (fg as any).__uid = row?.__uid ?? makeUid();
    return fg;
  }

  private seccionGroup(sec?: any) {
    const items = (sec?.items ?? []).map((it: any) => this.rowGroup(it));
    const fg = this.fb.group({
      tipo: [sec?.tipo ?? 'receta', Validators.required],
      nombre: [sec?.nombre ?? '', Validators.required],
      baseComponenteId: [sec?.baseComponenteId ?? null],
      items: this.fb.array(items)
    });
    (fg as any).__uid = sec?.__uid ?? makeUid();
    return fg;
  }

  // ---------- mapeos/materialización ----------
  private mapSkidSeccionToForm(sec: any) {
    return {
      tipo: sec?.baseComponenteId ? 'receta' : 'personalizada',
      nombre: sec?.nombre ?? '',
      baseComponenteId: sec?.baseComponenteId ?? null,
      items: (sec?.items ?? []).map((it: any) => ({
        insumoId: it?.insumoId ?? it?.insumo?.id ?? null,
        cantidad: Number(it?.cantidad ?? 1)
      }))
    };
  }

  private materializeSkidFromApi(skid: any) {
    const secs = Array.isArray(skid?.secciones) ? skid.secciones : [];
    while (this.skidFA.length) this.skidFA.removeAt(0);
    secs.map((s: any) => this.mapSkidSeccionToForm(s)).forEach((s: any) => this.skidFA.push(this.seccionGroup(s)));
  }

  private mapRecetaToSeccion(receta: any) {
    return {
      tipo: 'receta',
      nombre: receta?.nombre ?? 'Receta',
      baseComponenteId: receta?.id ?? null,
      items: (receta?.componentes || []).map((c: any) => ({
        insumoId: c.insumo?.id ?? c.insumoId,
        cantidad: c.cantidad ?? 1
      }))
    };
  }

  private rebuildGroup(fa: FormArray, secciones: any[]) {
    while (fa.length) fa.removeAt(0);
    secciones.forEach(s => fa.push(this.seccionGroup(s)));
  }

  private materializeSelectedRecetas(tabIds: number[], instIds: number[]) {
    const all = Array.from(new Set([...(tabIds || []), ...(instIds || [])]));
    if (!all.length) {
      this.rebuildGroup(this.tabsFA, []);
      this.rebuildGroup(this.instFA, []);
      return;
    }

    forkJoin(all.map(id => this.recetaSrv.getRecetaById(id).pipe(take(1))))
      .subscribe((recetas: any[]) => {
        const tabSet = new Set(tabIds || []);
        const instSet = new Set(instIds || []);
        const tabs = recetas.filter(r => tabSet.has(r.id)).map(r => this.mapRecetaToSeccion(r));
        const inst = recetas.filter(r => instSet.has(r.id)).map(r => this.mapRecetaToSeccion(r));
        this.rebuildGroup(this.tabsFA, tabs);
        this.rebuildGroup(this.instFA, inst);
      });
  }

  // ---------- eventos UI ----------
  onTablerosIdsChange(ids: number[]) {
    this.form.get('tablerosIds')?.setValue(ids);
    this.materializeSelectedRecetas(ids, this.form.get('instrumentosIds')?.value || []);
  }

  onInstrumentosIdsChange(ids: number[]) {
    this.form.get('instrumentosIds')?.setValue(ids);
    this.materializeSelectedRecetas(this.form.get('tablerosIds')?.value || [], ids);
  }

  // secciones util
  private getGroupFA(group: 'skid' | 'tableros' | 'instrumentos'): FormArray {
    if (group === 'skid') return this.skidFA;
    if (group === 'tableros') return this.tabsFA;
    return this.instFA;
  }

  addCustomSection(group: 'skid' | 'tableros' | 'instrumentos') {
    this.getGroupFA(group).push(this.seccionGroup({ tipo: 'personalizada', nombre: '' }));
  }

  removeSection(group: 'skid' | 'tableros' | 'instrumentos', idx: number) {
    const fa = this.getGroupFA(group);
    const sec = fa.at(idx).value;

    if (group !== 'skid' && sec?.tipo === 'receta' && sec?.baseComponenteId) {
      const ctrlName = group === 'tableros' ? 'tablerosIds' : 'instrumentosIds';
      const ids: number[] = [...(this.form.get(ctrlName)?.value || [])].filter(id => id !== sec.baseComponenteId);
      this.form.get(ctrlName)?.setValue(ids);
    }
    fa.removeAt(idx);
  }

  itemsFA(group: 'skid' | 'tableros' | 'instrumentos', secIdx: number): FormArray {
    return this.getGroupFA(group).at(secIdx).get('items') as FormArray;
  }
  addItem(group: 'skid' | 'tableros' | 'instrumentos', secIdx: number) {
    this.itemsFA(group, secIdx).push(this.rowGroup());
  }
  removeItem(group: 'skid' | 'tableros' | 'instrumentos', secIdx: number, itemIdx: number) {
    this.itemsFA(group, secIdx).removeAt(itemIdx);
  }

  // trackBy
  trackByCtrl = (_: number, ctrl: any) => ctrl?.__uid ?? (ctrl?.value?.__uid ?? ctrl);

  // ---------- Guardar / Aprobar ----------
  guardarCambios(vm: any) {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.add({ severity: 'warn', summary: 'Faltan datos', detail: 'Revisá los campos requeridos.' });
      return;
    }
    const snapshot = this.buildSnapshotFromForm();

    this.confirm.confirm({
      header: 'Confirmar cambios',
      message: 'Se guardará una nueva revisión (sin aprobar).',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Confirmar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.facade.updateOrden(vm.pedido.id, { snapshotSkid: snapshot }).subscribe(() => {
          this.toast.add({ severity: 'success', summary: 'Guardado', detail: 'Cambios guardados' });
          this.facade.reloadOrden(vm.pedido.id).subscribe();
        });
      }
    });
  }


  aprobarPedido(vm: any) {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.add({ severity: 'warn', summary: 'Faltan datos', detail: 'Revisá los campos requeridos.' });
      return;
    }

    const snapshot = this.buildSnapshotFromForm();
    // opcional: flag de loading si querés deshabilitar el botón
    this.loading = true;

    this.confirm.confirm({
      header: 'Aprobar pedido',
      message: 'Al aprobar no podrás editar más este pedido. ¿Continuar?',
      icon: 'pi pi-lock',
      acceptLabel: 'Aprobar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.facade.updateOrden(vm.pedido.id, {
          snapshotSkid: snapshot,
          estado: 'APROBADA',
          // si tenés default de depósito en backend, no hace falta mandarlo
        })
          .pipe(finalize(() => this.loading = false))
          .subscribe({
            next: () => {
              this.toast.add({ severity: 'success', summary: 'Aprobado', detail: 'Pedido aprobado (solo lectura)' });
              this.applyLockFromEstado('APROBADA');
              this.facade.reloadOrden(vm.pedido.id).subscribe();
            },
            error: (err: HttpErrorResponse) => this.handleUpdateError(err)
          });
      }
    });
  }

  // --- manejo centralizado del error ---
  private handleUpdateError(err: HttpErrorResponse) {
    // Mensaje que suele venir del backend: err.error.message
    const backendMsg = (err?.error as any)?.message || err?.message || 'Error inesperado';

    // Caso específico: “Falta stock para X insumo(s).”
    if (err.status === 400 && /Falta stock para \d+ insumo\(s\)\./i.test(backendMsg)) {
      // Si querés extraer el número:
      const match = backendMsg.match(/Falta stock para (\d+) insumo/i);
      const faltantes = match ? Number(match[1]) : undefined;

      this.toast.add({
        severity: 'error',
        summary: 'Stock insuficiente',
        detail: faltantes
          ? `No hay stock para ${faltantes} insumo(s). Revisá existencias o ajustá cantidades.`
          : backendMsg
      });

      // Opcional: marcá visualmente las filas sin stock si las tenés identificadas
      // this.marcarInsumosSinStock(ids);
      return;
    }

    // Otros 400 con mensaje claro del backend
    if (err.status === 400 && backendMsg) {
      this.toast.add({ severity: 'warn', summary: 'Validación', detail: backendMsg });
      return;
    }

    // Genérico (timeouts, 500, network, etc.)
    this.toast.add({
      severity: 'error',
      summary: `Error ${err.status || ''}`.trim(),
      detail: backendMsg
    });
  }

  darCurso(vm: any) {
    const id = vm?.pedido?.id;
    if (!id) {
      this.toast.add({ severity: 'warn', summary: 'Atención', detail: 'No se encontró el ID de la orden' });
      return;
    }
    this.facade.updateOrden(id, { estado: 'EN_PROCESO' }).subscribe(() => {
      this.toast.add({ severity: 'success', summary: 'Éxito', detail: 'Orden puesta en curso' });
      this.facade.reloadOrden(id).subscribe();
    });
  }

  addPanelRow() { this.panelesFA.push(this.rowGroup()); }
  removePanelRow(i: number) { this.panelesFA.removeAt(i); }

  addBombaRow() { this.bombasFA.push(this.rowGroup()); }
  removeBombaRow(i: number) { this.bombasFA.removeAt(i); }

  async uploadOCHandler(event: any, ordenId?: number) {
    const file: File = event.files?.[0];
    if (!file) return;

    const ok = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!ok.includes(file.type)) {
      this.toast.add({ severity: 'warn', summary: 'Archivo', detail: 'Solo PDF/JPG/PNG' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.toast.add({ severity: 'warn', summary: 'Archivo', detail: 'Máx 10 MB' });
      return;
    }

    try {

      if (ordenId) {
        this.loading = true;

        const { url } = await lastValueFrom(this.facade.uploadOC(file));
        await lastValueFrom(this.facade.setPedidoAdjunto(ordenId, url));

        this.toast.add({ severity: 'success', summary: 'Adjunto', detail: 'OC cargada' });
        this.facade.reloadOrden(ordenId).subscribe(); // refresca VM
      }

    } catch (e: any) {
      const msg = e?.error?.message || e?.message || 'Error al subir adjunto';
      this.toast.add({ severity: 'error', summary: 'Adjunto', detail: msg });
    } finally {
      this.loading = false;
    }
  }
}
