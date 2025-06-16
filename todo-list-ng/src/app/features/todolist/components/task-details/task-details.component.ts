import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';

import { Task } from '../../models/task.model';
import { TasksService } from '../../services/tasks.service';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatTableModule,
    ErrorMessageComponent
  ],
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.scss'
})
export class TaskDetailsComponent implements OnInit {

  constructor(
    private readonly tasksService: TasksService){
  }

  readonly dialogRef = inject(MatDialogRef<TaskDetailsComponent>);
  /** Identifiant de la tâche à afficher */
  readonly taskId: number = inject<number>(MAT_DIALOG_DATA);

  /** Données de la tâche à afficher */
  task: Task | null = null;
  /** Ordre des colonnes du tableau */
  displayedColumns: string[] = ['headers', 'data'];
  /** Données à afficher dans le tableau */
  displayedData: any[] = [];
  /** Si erreur de lecture des données, permet l'affichage d'un message d'erreur */
  error: boolean = false;
  /** Attente le temps du chargement des données */
  loading: boolean = true;


  ngOnInit(): void {
    // Lecture des données de la tâche
    this.tasksService.getTask(this.taskId).subscribe({
      next: (data) => {
        this.task = data;
        this.loading = false;
        this.error = false;

        // Construction des données à afficher dans le tableau (headers en première colonne)
        this.displayedData = [];    // Nouvelle référence d'objet pour mise à jour de l'affichage
        this.displayedData.push(['id', this.task.id]);
        this.displayedData.push(['Label', this.task.label]);
        this.displayedData.push(['Description', this.task.description]);
        this.displayedData.push(['Etat', this.getStatus(this.task.completed)]);
      },
      error: (error) => {
        this.loading = false;
        this.error = true;
        console.error(error);
      },
    });
  }

  /**
   * Renvoit le statut à afficher pour une tâche
   * @param completed Valeur du statut de la tâche
   * @returns Statut à afficher
   */
  getStatus(completed: boolean){
    return this.tasksService.getTaskStatus(completed);
  }

  /**
   * Demande de fermeture de la boîte de dialogue
   */
  onCloseClick(): void {
    this.dialogRef.close();
  }
}
