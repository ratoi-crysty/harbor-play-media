import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InvitationResponse } from '@auth-lib/common';

export interface DeleteInvitationEvent {
  invitationId: number;
}

export interface CopyTokenEvent {
  token: string;
}

@Component({
  selector: 'app-invitation-list',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './invitation-list.component.html',
  styleUrl: './invitation-list.component.scss',
})
export class InvitationListComponent {
  readonly invitations = input.required<InvitationResponse[]>();

  readonly deleteInvitation = output<DeleteInvitationEvent>();
  readonly copyToken = output<CopyTokenEvent>();

  readonly displayedColumns: string[] = ['email', 'status', 'createdBy', 'createdAt', 'expiresAt', 'actions'];

  isExpired(invitation: InvitationResponse): boolean {
    return new Date(invitation.expiresAt) < new Date();
  }

  getStatus(invitation: InvitationResponse): string {
    if (invitation.used) {
      return 'Used';
    }
    if (this.isExpired(invitation)) {
      return 'Expired';
    }
    return 'Active';
  }

  onDelete(invitationId: number): void {
    this.deleteInvitation.emit({ invitationId });
  }

  onCopyToken(token: string): void {
    this.copyToken.emit({ token });
  }
}
