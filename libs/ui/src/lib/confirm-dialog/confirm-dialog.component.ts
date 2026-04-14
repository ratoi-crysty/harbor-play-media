import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  confirmColor?: string;
  icon?: string;
}

@Component({
  selector: 'lib-confirm-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  protected readonly data: ConfirmDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef: MatDialogRef<ConfirmDialogComponent, boolean> = inject(MatDialogRef);

  protected get icon(): string {
    return this.data.icon ?? 'warning';
  }

  protected get confirmLabel(): string {
    return this.data.confirmLabel ?? 'Confirm';
  }

  protected get isWarn(): boolean {
    return (this.data.confirmColor ?? 'warn') === 'warn';
  }

  protected onConfirm(): void {
    this.dialogRef.close(true);
  }
}
