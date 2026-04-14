import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CollectionModel, MediaModel } from '@harbor-play-media/shared-api';
import {
  BreadcrumbComponent,
  BreadcrumbSegment,
  CollectionCardComponent,
  CollectionPickerDialogComponent,
  CollectionPickerDialogData,
  CollectionPickerResult,
  ConfirmDialogComponent,
  ConfirmDialogData,
  MediaCardComponent,
  RenameDialogComponent,
  RenameDialogData,
} from '@harbor-play-media/ui';
import { CollectionApiService } from '../../core/services/collection-api.service';
import { MediaApiService } from '../../core/services/media-api.service';

interface CollectionPageState {
  loading: boolean;
  currentCollection: CollectionModel | undefined;
  collections: CollectionModel[];
  media: MediaModel[];
  breadcrumbs: BreadcrumbSegment[];
}

@Component({
  selector: 'app-collection-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    BreadcrumbComponent,
    CollectionCardComponent,
    MediaCardComponent,
  ],
  templateUrl: './collection-page.component.html',
  styleUrl: './collection-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionPageComponent implements OnInit {
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly collectionApi: CollectionApiService = inject(CollectionApiService);
  private readonly mediaApi: MediaApiService = inject(MediaApiService);

  readonly state = signal<CollectionPageState>({
    loading: true,
    currentCollection: undefined,
    collections: [],
    media: [],
    breadcrumbs: [],
  });

  readonly selectMode = signal<boolean>(false);
  readonly selectedIds = signal<Set<string>>(new Set());
  readonly selectedCount = computed<number>(() => this.selectedIds().size);
  readonly batchLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id: string | undefined = params.get('id') ?? undefined;
      this.loadCollection(id);
    });
  }

  onNewCollection(): void {
    const data: RenameDialogData = { title: 'New Collection', currentName: '', saveLabel: 'Create' };
    const ref = this.dialog.open<RenameDialogComponent, RenameDialogData, string>(
      RenameDialogComponent,
      { data, width: '440px' },
    );

    ref.afterClosed().subscribe((name: string | undefined) => {
      if (!name) return;
      const parentId: string | undefined = this.state().currentCollection?.id;
      this.collectionApi.createCollection({ name, parentId }).subscribe({
        next: (): void => this.loadCollection(parentId),
      });
    });
  }

  onRenameCollection(collection: CollectionModel): void {
    const data: RenameDialogData = { title: 'Rename Collection', currentName: collection.name };
    const ref = this.dialog.open<RenameDialogComponent, RenameDialogData, string>(
      RenameDialogComponent,
      { data, width: '440px' },
    );

    ref.afterClosed().subscribe((name: string | undefined) => {
      if (!name) return;
      this.collectionApi.updateCollection(collection.id, { name }).subscribe({
        next: (): void => this.loadCollection(this.state().currentCollection?.id),
      });
    });
  }

  onDeleteCollection(collection: CollectionModel): void {
    const data: ConfirmDialogData = {
      title: 'Delete Collection',
      message: `Are you sure you want to delete "${collection.name}"? This will permanently delete the collection and all media inside it.`,
      confirmLabel: 'Delete',
      confirmColor: 'warn',
      icon: 'delete',
    };
    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      { data, width: '440px' },
    );

    ref.afterClosed().subscribe((confirmed: boolean | undefined) => {
      if (!confirmed) return;
      this.collectionApi.deleteCollection(collection.id).subscribe({
        next: (): void => this.loadCollection(this.state().currentCollection?.id),
      });
    });
  }

  onMoveCollection(collection: CollectionModel): void {
    const data: CollectionPickerDialogData = {
      title: 'Move Collection',
      loadCollections: () => this.collectionApi.getAllCollections(),
      excludeIds: [collection.id],
      allowRoot: true,
      currentCollectionId: collection.parentId,
    };
    const ref = this.dialog.open<CollectionPickerDialogComponent, CollectionPickerDialogData, CollectionPickerResult>(
      CollectionPickerDialogComponent,
      { data, width: '440px' },
    );

    ref.afterClosed().subscribe((result: CollectionPickerResult | undefined) => {
      if (!result) return;
      this.collectionApi.moveCollection(collection.id, result.collectionId).subscribe({
        next: (): void => this.loadCollection(this.state().currentCollection?.id),
      });
    });
  }

  onUploadHere(): void {
    const collectionId: string | undefined = this.state().currentCollection?.id;
    void this.router.navigate(['/upload'], {
      queryParams: collectionId ? { collectionId } : {},
    });
  }

  toggleSelectMode(): void {
    const next = !this.selectMode();
    this.selectMode.set(next);
    if (!next) {
      this.selectedIds.set(new Set());
    }
  }

  onSelectionChanged(id: string, selected: boolean): void {
    this.selectedIds.update((set: Set<string>) => {
      const next: Set<string> = new Set(set);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  onDeleteSelected(): void {
    const ids: string[] = Array.from(this.selectedIds());
    if (ids.length === 0) return;

    this.batchLoading.set(true);
    const deletes: Observable<void>[] = ids.map((id: string) => this.mediaApi.delete(id));

    forkJoin(deletes).subscribe({
      next: (): void => {
        this.selectedIds.set(new Set());
        this.selectMode.set(false);
        this.batchLoading.set(false);
        this.loadCollection(this.state().currentCollection?.id);
      },
      error: (): void => {
        this.batchLoading.set(false);
      },
    });
  }

  onMoveSelected(): void {
    const ids: string[] = Array.from(this.selectedIds());
    if (ids.length === 0) return;

    const data: CollectionPickerDialogData = {
      title: 'Move Selected Media',
      loadCollections: () => this.collectionApi.getAllCollections(),
      allowRoot: true,
      currentCollectionId: this.state().currentCollection?.id,
    };
    const ref = this.dialog.open<CollectionPickerDialogComponent, CollectionPickerDialogData, CollectionPickerResult>(
      CollectionPickerDialogComponent,
      { data, width: '440px' },
    );

    ref.afterClosed().subscribe((result: CollectionPickerResult | undefined) => {
      if (!result) return;
      this.batchLoading.set(true);
      const moves: Observable<MediaModel>[] = ids.map((id: string) =>
        this.mediaApi.move(id, result.collectionId),
      );

      forkJoin(moves).subscribe({
        next: (): void => {
          this.selectedIds.set(new Set());
          this.selectMode.set(false);
          this.batchLoading.set(false);
          this.loadCollection(this.state().currentCollection?.id);
        },
        error: (): void => {
          this.batchLoading.set(false);
        },
      });
    });
  }

  private loadCollection(id: string | undefined): void {
    this.state.update((s: CollectionPageState) => ({ ...s, loading: true }));

    if (id) {
      this.collectionApi.getCollection(id).subscribe({
        next: (collection: CollectionModel): void => {
          this.state.update((s: CollectionPageState) => ({
            ...s,
            currentCollection: collection,
            breadcrumbs: [{ id: collection.id, name: collection.name }],
          }));
          this.loadChildren(id);
        },
      });
    } else {
      this.state.update((s: CollectionPageState) => ({
        ...s,
        currentCollection: undefined,
        breadcrumbs: [],
      }));
      this.loadChildren(undefined);
    }
  }

  private loadChildren(parentId: string | undefined): void {
    this.collectionApi.getCollections(parentId).subscribe({
      next: (collections: CollectionModel[]): void => {
        this.state.update((s: CollectionPageState) => ({ ...s, collections }));
        this.loadMedia();
      },
    });
  }

  private loadMedia(): void {
    this.mediaApi.getAll().subscribe({
      next: (media: MediaModel[]): void => {
        const currentId: string | undefined = this.state().currentCollection?.id;
        const filtered: MediaModel[] = currentId
          ? media.filter((m: MediaModel) => m.collectionId === currentId)
          : media;

        this.state.update((s: CollectionPageState) => ({
          ...s,
          media: filtered,
          loading: false,
        }));
      },
    });
  }
}
