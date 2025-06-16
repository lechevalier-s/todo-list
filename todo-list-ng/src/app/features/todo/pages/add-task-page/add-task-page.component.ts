import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Pour la navigation
import { FormsModule } from '@angular/forms'; // Importer FormsModule
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { TasksService } from '../../services/tasks.service'; // Supposons que vous ayez un service
import { Task } from '../../models/task.model'; // Modèle de tâche
import { AlertComponent } from '../../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-add-task-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './add-task-page.component.html',
  styleUrl: './add-task-page.component.scss'
})
export class AddTaskPageComponent {

  constructor(
    private router: Router,
    private tasksService: TasksService,
    private readonly dialog: MatDialog
  ) {}

  // Valeurs par défaut pour une nouvelle tâche
  newTask: Partial<Task> = {
    label: '',
    description: '',
    completed: false
  };
  /** Attente le temps du chargement des données */
  loading: boolean = false;

  /**
   * Demande de sauvegarde de la tâche créée
   */
  onSubmit(): void {
    if (this.newTask.label) {
      this.loading = true;
      this.tasksService.addTask(this.newTask as Task).subscribe({
        next: (createdTask) => {
          this.loading = false;
          // Rediriger vers la liste des tâches
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          this.loading = false;
          console.error('Erreur lors de l\'ajout de la tâche:', error);
          this.dialog.open(AlertComponent, {data: "Erreur lors de la sauvegarde des données", width: "50%"});
        }
      });
    }
  }

  /**
   * Demande d'annulation de création de la tâche
   */
  goBack(): void {
    // Rediriger vers la liste des tâches
    this.router.navigate(['/tasks']);
  }
}
