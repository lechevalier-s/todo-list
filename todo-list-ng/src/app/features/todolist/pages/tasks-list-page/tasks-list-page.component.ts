import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { TasksService } from '../../services/tasks.service';
import { Task } from '../../models/task.model';
import { Pagination } from '../../models/pagination.model';
import { MyCustomPaginatorIntl } from '../../../../shared/components/paginator/my-custom-paginator-intl.component';
import { TaskDetailsComponent } from "../../components/task-details/task-details.component";
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { QuestionComponent } from "../../../../shared/components/question/question.component";
import { AlertComponent } from "../../../../shared/components/alert/alert.component";

@Component({
  selector: 'app-tasks-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTableModule,
    ErrorMessageComponent
],
  templateUrl: './tasks-list-page.component.html',
  styleUrl: './tasks-list-page.component.scss',
  providers: [{provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl}],
})
export class TasksListPageComponent implements OnInit {

  constructor(
    private readonly tasksService: TasksService,
    private readonly router: Router,
    private readonly dialog: MatDialog
  ){
    // Valeur par défaut de la pagination
    this.pagination = {length: 0, pageSize: this.pageSizeDef, idxPage: 0, idxPremiereLigne: 0, idxDerniereLigne: 0};
  }

  /** Liste des tâches à afficher */
  tasks: Task[] = [];
  /** Ordre des colonnes du tableau */
  displayedColumns: string[] = ['label', 'description', 'completed', 'details', 'supprimer'];
  /** Filtre à appliquer ou non sur les tâches terminées */
  filter: boolean = false;
  /** Si erreur de lecture des données, permet l'affichage d'un message d'erreur */
  errorMessage: string | null = null;
  /** Attente le temps du chargement des données */
  loading: boolean = true;

  // --------------- Gestion de la pagination en local -----------------
  /** Liste des tâches à afficher */
  displayedTasks: Task[] = [];
  /** Nombre de lignes par défaut dans une page du tableau */
  pageSizeDef = 10;
  /** Données de la pagination */
  pagination: Pagination;

  /**
   * Initialisation de la liste des tâches à afficher et de la pagination suite à une nouvelle lecture des données
   */
  initPage(){
    // Mise à jour du nombre de lignes dans la pagination
    this.pagination.length = this.tasks.length;
    // Mise à jour des index des première et dernière lignes de la page
    this.pagination.idxDerniereLigne = Math.min(this.tasks.length, this.pagination.idxPremiereLigne + this.pagination.pageSize);
    if (this.pagination.idxDerniereLigne <= this.pagination.idxPremiereLigne) {
      this.pagination.idxPremiereLigne = Math.max(0, this.pagination.idxPremiereLigne - this.pagination.pageSize);
      this.pagination.idxDerniereLigne = this.tasks.length;
    }
    // Mise à jour de l'index de la page
    this.pagination.idxPage = Math.floor(this.pagination.idxPremiereLigne / this.pagination.pageSize);
    // Mise à jour de la liste des tâches à afficher en fonction de la page sélectionnée
    this.displayedTasks = this.tasks.slice(this.pagination.idxPremiereLigne, this.pagination.idxDerniereLigne);
  }

  /**
   * Mise à jour de la liste des tâches à afficher et de la pagination suite à action sur les boutons de pagination
   * @param event Données de la pagination
   */
  changePagination(event: PageEvent){
    this.pagination.pageSize = event.pageSize;
    this.pagination.idxPage = event.pageIndex;
    this.pagination.idxPremiereLigne = event.pageIndex * event.pageSize;
    this.pagination.idxDerniereLigne = Math.min(this.pagination.length, this.pagination.idxPremiereLigne + event.pageSize);
    // Mise à jour de la liste des tâches à afficher en fonction de la page sélectionnée
    this.displayedTasks = this.tasks.slice(this.pagination.idxPremiereLigne, this.pagination.idxDerniereLigne);
  }
  // --------------- Fin gestion de la pagination -----------------

  ngOnInit() {
    this.getAllTasks();
  }

  /**
   * Récupération de la liste de toutes les tâches, terminées ou non
   */
  getAllTasks(){
    this.loading = true;
    this.tasksService.getAllTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.initPage();
        this.loading = false;
        this.errorMessage = null;
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
        this.errorMessage = "Données indisponibles";
      },
    });
  }

  /**
   * Récupération de la liste des tâches restant à effectuer
   */
  getTodoTasks(){
    this.loading = true;
    this.tasksService.getTodoTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.initPage();
        this.loading = false;
        this.errorMessage = null;
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
        this.errorMessage = "Données indisponibles";
      },
    });
  }

  /**
   * Clic sur la demande d'ajout d'une nouvelle tâche
   */
  displayAddTaskForm(){
    this.router.navigate(['add-task']);
  }

  /**
   * Demande de modification du statut de la tâche
   * @param task Tâche modifiée dans l'IHM, à sauvegarder
   */
  updateTask(task: Task){
    this.loading = true;
    this.tasksService.updateTask(task).subscribe({
      next: (updatedTask) => {
        this.loading = false;
        const index = this.tasks.findIndex(t => t.id === updatedTask.id);
        if (index !== -1) {
          // Remplacer l'ancien objet tâche par le nouveau du serveur pour s'assurer que toutes les données sont à jour.
          this.tasks[index] = updatedTask;
          // Créer une nouvelle référence de tableau pour déclencher la détection de changement de mat-table.
          this.tasks = [...this.tasks];
          this.initPage();
        }
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
        this.dialog.open(AlertComponent, {data: "Erreur lors de la sauvegarde des données", width: "50%"});
      },
    });
  }

  /**
   * Clic sur le bouton d'affichage des détails d'une tâche
   * @param task Tâche à afficher
   */
  onDetailsTaskClick(task: Task){
    this.dialog.open(TaskDetailsComponent, {data: task.id, width: "50%"});
  }

  /**
   * Demande de suppression d'une tâche
   * @param id Identifiant de la tâche à supprimer
   */
  onDeleteTaskClick(id: number){
    this.dialog.open(QuestionComponent, {data: "Êtes-vous sûr de vouloir supprimer cette tâche ?", width: "50%"})
      .afterClosed()
      .subscribe((confirmeSupprime: boolean) => {
        // Si suppression confirmée
        if (confirmeSupprime) {
          this.loading = true;
          this.tasksService.removeTask(id).subscribe({
            next: (data) => {
              this.loading = false;
              // Relecture de la liste des tâches pour mise à jour du tableau
              if (this.filter) {
                this.getTodoTasks();
              } else {
                this.getAllTasks();
              }
            },
            error: (error) => {
              this.loading = false;
              console.error(error);
              this.dialog.open(AlertComponent, {data: "Erreur lors de la suppression de la tâche", width: "50%"});
            },
          });
        }
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
   * Clic sur le bouton de filtre d'affichage des tâches
   * @param filter Nouvelle valeur du filtre à appliquer
   */
  toggleFilter(filter: boolean){
    this.filter = filter;
    // Relecture de la liste des tâches, en fonction de la valeur du filtre à appliquer
    if (this.filter === true){
      this.getTodoTasks();
    } else {
      this.getAllTasks();
    }
  }
}
