import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TasksService } from './tasks.service';
import { Task } from '../models/task.model';
import { environment } from '../../../../environments/environment';

describe('TasksService', () => { // Correction du nom de la suite de tests pour correspondre au service
  let service: TasksService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.url;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(TasksService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // S'assurer qu'il n'y a pas de requêtes en attente
  });

  describe('Test de l\'initialisation', () => {
      it('devrait créer le service', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('getAllTasks', () => {
    it('devrait retourner une liste de tâches', () => {
      const mockTasks: Task[] = [
        { id: 1, label: 'Task 1', description: 'Description 1', completed: false },
        { id: 2, label: 'Task 2', description: 'Description 2', completed: true }
      ];

      service.getAllTasks().subscribe(tasks => {
        expect(tasks.length).toBe(2);
        expect(tasks).toEqual(mockTasks);
      });

      const req = httpMock.expectOne(`${apiUrl}all`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTasks);
    });
  });

  describe('getTodoTasks', () => {
    it('devrait retourner une liste de tâches à faire', () => {
      const mockTodoTasks: Task[] = [
        { id: 1, label: 'Task 1', description: 'Description 1', completed: false }
      ];

      service.getTodoTasks().subscribe(tasks => {
        expect(tasks.length).toBe(1);
        expect(tasks[0].completed).toBeFalse();
        expect(tasks).toEqual(mockTodoTasks);
      });

      const req = httpMock.expectOne(`${apiUrl}todo`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTodoTasks);
    });
  });

  describe('getTask', () => {
    it('devrait retourner une tâche spécifique par son ID', () => {
      const mockTask: Task = { id: 1, label: 'Task 1', description: 'Description 1', completed: false };

      service.getTask(1).subscribe(task => {
        expect(task).toEqual(mockTask);
      });

      const req = httpMock.expectOne(`${apiUrl}1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTask);
    });
  });

  describe('addTask', () => {
    it('devrait ajouter une tâche et la retourner', () => {
      const newTask: Partial<Task> = { label: 'Task 1', description: 'Description 1', completed: false };
      const returnedTask: Task = { id: 3, label: 'Task 1', description: 'Description 1', completed: false };

      service.addTask(newTask as Task).subscribe(task => {
        expect(task).toEqual(returnedTask);
      });

      const req = httpMock.expectOne(`${apiUrl}add`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newTask);
      req.flush(returnedTask);
    });
  });

  describe('updateTask', () => {
    it('devrait mettre à jour une tâche et la retourner', () => {
      const taskToUpdate: Task = { id: 1, label: 'Updated Task', description: 'Updated Description', completed: true };

      service.updateTask(taskToUpdate).subscribe(task => {
        expect(task).toEqual(taskToUpdate);
      });

      const req = httpMock.expectOne(`${apiUrl}update`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(taskToUpdate);
      req.flush(taskToUpdate);
    });
  });

  describe('removeTask', () => {
    it('devrait supprimer une tâche', () => {
      const taskId = 1;

      service.removeTask(taskId).subscribe(() => {
        // S'attendre à ce que la requête aboutisse sans erreur
      });

      const req = httpMock.expectOne(`${apiUrl}${taskId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' }); // Simuler une réponse de suppression réussie
    });
  });

  describe('getTaskStatus', () => {
    it('devrait retourner "Terminée" si completed est true', () => {
      expect(service.getTaskStatus(true)).toBe('Terminée');
    });

    it('devrait retourner "A faire" si completed est false', () => {
      expect(service.getTaskStatus(false)).toBe('A faire');
    });
  });
});
