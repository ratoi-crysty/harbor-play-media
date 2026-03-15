import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

import {
  CopyTokenEvent,
  DeleteInvitationEvent,
  InvitationListComponent,
} from './invitation-list/invitation-list.component';
import { InvitationService } from '@auth-lib/angular';
import { InvitationResponse } from '@auth-lib/common';

@Component({
  selector: 'app-invitation-management',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    InvitationListComponent,
  ],
  templateUrl: './invitation-management.component.html',
  styleUrl: './invitation-management.component.scss',
})
export class InvitationManagementComponent implements OnInit {
  private readonly invitationService = inject(InvitationService);
  private readonly snackBar = inject(MatSnackBar);

  readonly invitations = signal<InvitationResponse[] | undefined>(undefined);
  readonly creating = signal<boolean>(false);
  readonly error = signal<string>('');
  readonly newEmail = signal<string>('');

  ngOnInit(): void {
    this.loadInvitations();
  }

  private loadInvitations(): void {
    this.error.set('');

    this.invitationService.getInvitations().subscribe({
      next: (response) => {
        this.invitations.set(response.invitations);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load invitations');
      },
    });
  }

  onCreateInvitation(): void {
    const email: string = this.newEmail().trim();
    if (!email) {
      return;
    }

    this.creating.set(true);
    this.error.set('');

    this.invitationService.createInvitation({ email }).subscribe({
      next: (invitation: InvitationResponse) => {
        this.invitations.update((invs: InvitationResponse[] = []): InvitationResponse[] => [invitation, ...invs]);
        this.newEmail.set('');
        this.creating.set(false);
        this.snackBar.open('Invitation created', 'Dismiss', { duration: 3000 });
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to create invitation');
        this.creating.set(false);
      },
    });
  }

  onDeleteInvitation(event: DeleteInvitationEvent): void {
    this.invitationService.deleteInvitation(event.invitationId).subscribe({
      next: () => {
        this.invitations.update((invs: InvitationResponse[] = []): InvitationResponse[] =>
          invs.filter((i: InvitationResponse) => i.id !== event.invitationId),
        );
        this.snackBar.open('Invitation deleted', 'Dismiss', { duration: 3000 });
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to delete invitation');
      },
    });
  }

  onCopyToken(event: CopyTokenEvent): void {
    const inviteUrl = `${window.location.origin}/auth/register?token=${event.token}`;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      this.snackBar.open('Invite link copied to clipboard', 'Dismiss', { duration: 3000 });
    });
  }
}
