import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
    MatIconModule
  ],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss'
})
export class AlertComponent {

  readonly dialogRef = inject(MatDialogRef<AlertComponent>);
  /** Message à afficher */
  readonly message: string = inject<string>(MAT_DIALOG_DATA);

  onCloseClick(): void {
    this.dialogRef.close();
  }
}
