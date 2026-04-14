import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface RenameDialogData {
  title: string;
  currentName: string;
  saveLabel?: string;
}

@Component({
  selector: 'lib-rename-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './rename-dialog.component.html',
  styleUrl: './rename-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RenameDialogComponent {
  protected readonly data: RenameDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef: MatDialogRef<RenameDialogComponent, string> = inject(MatDialogRef);

  readonly name = signal<string>(this.data.currentName);

  protected get saveLabel(): string {
    return this.data.saveLabel ?? 'Save';
  }

  protected get canSave(): boolean {
    return this.name().trim().length > 0;
  }

  protected onNameInput(event: Event): void {
    this.name.set((event.target as HTMLInputElement).value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.canSave) {
      event.preventDefault();
      this.onSave();
    }
  }

  protected onSave(): void {
    const trimmed: string = this.name().trim();
    if (trimmed) {
      this.dialogRef.close(trimmed);
    }
  }
}
