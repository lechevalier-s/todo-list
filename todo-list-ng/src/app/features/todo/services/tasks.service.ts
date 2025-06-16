import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Task } from '../models/task.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  constructor(private http: HttpClient) { }

  /**
   * Récupération de la liste de toutes les tâches, terminées ou non
   * @returns Observable vers la liste des tâches renvoyée par le serveur
   */
  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(environment.url + 'all');
  }

  /**
   * Récupération de la liste des les tâches restant à effectuer
   * @returns Observable vers la liste des tâches renvoyée par le serveur
   */
  getTodoTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(environment.url + 'todo');
  }

  /**
   * Récupération des données d'une tâche
   * @param id Identifiant de la tâche souhaitée
   * @returns Observable vers les données de la tâche renvoyées par le serveur
   */
  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(environment.url + id);
  }

  /**
   * Sauvegarde d'une nouvelle tâche
   * @param task Tâche à sauvegarder
   * @returns Observable vers les données de la tâche sauvegardée renvoyées par le serveur
   */
  addTask(task: Task): Observable<Task> {
    return this.http.post<Task>(environment.url + 'add', task);
  }

  /**
   * Mise à jour du statut d'une tâche
   * @param task Tâche à mettre à jour, avec la nouvelle valeur de son statut
   * @returns Observable vers les données de la tâche sauvegardée renvoyées par le serveur
   */
  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(environment.url+ 'update', task);
  }

  /**
   * Suppression d'une tâche
   * @param id Identifiant de la tâche à supprimer
   * @returns Observable
   */
  removeTask(id: number): Observable<void> {
    return this.http.delete<void>(environment.url + id);
  }


  /**
   * Renvoit le statut à afficher pour une tâche
   * @param completed Valeur du statut de la tâche
   * @returns Statut à afficher
   */
  getTaskStatus(completed: boolean): string{
    if (completed){
      return "Terminée"
    } else {
      return "A faire"
    }
  }
}
