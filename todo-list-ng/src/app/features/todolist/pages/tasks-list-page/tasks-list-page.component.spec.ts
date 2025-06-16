import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { TasksService } from '../../services/tasks.service';
import { Task } from '../../models/task.model';
import { TasksListPageComponent } from './tasks-list-page.component';
import { QuestionComponent } from '../../../../shared/components/question/question.component';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { TaskDetailsComponent } from '../../components/task-details/task-details.component';
import { Pagination } from '../../models/pagination.model';
import { PageEvent } from '@angular/material/paginator';

// Mocks
const mockTasks: Task[] = [
  { id: 1, label: 'Task 1', description: 'Description 1', completed: false },
  { id: 2, label: 'Task 2', description: 'Description 2', completed: true },
  { id: 3, label: 'Task 3', description: 'Description 3', completed: false },
];

const mockTodoTasks: Task[] = [
  { id: 1, label: 'Task 1', description: 'Description 1', completed: false },
  { id: 3, label: 'Task 3', description: 'Description 3', completed: false },
];

class MockTasksService {
  getAllTasks() { return of(mockTasks); }
  getTodoTasks() { return of(mockTodoTasks); }
  updateTask(task: Task) { return of(task); }
  removeTask(id: number) { return of(null); } // Simule une suppression réussie
  getTaskStatus(completed: boolean) { return completed ? 'Terminée' : 'A faire'; }
}

class MockRouter {
  navigate(commands: any[]): Promise<boolean> {
    return Promise.resolve(true);
  }
}

class MockMatDialog {
  open(component: any, config?: any) {
    if (component === QuestionComponent) {
      // Simule la confirmation pour la suppression
      return { afterClosed: () => of(true) } as MatDialogRef<typeof QuestionComponent>;
    }
    if (component === AlertComponent || component === TaskDetailsComponent) {
      return { afterClosed: () => of(true) } as MatDialogRef<any>; // Comportement générique pour les autres dialogues
    }
    return { afterClosed: () => of(null) } as MatDialogRef<any>;
  }
}

describe('TasksListPageComponent', () => {
  let component: TasksListPageComponent;
  let fixture: ComponentFixture<TasksListPageComponent>;
  let tasksService: TasksService;
  let router: Router;
  let dialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TasksListPageComponent, // Le composant est standalone
        NoopAnimationsModule,   // Pour les animations Material
        FormsModule             // Si des formulaires sont utilisés directement dans le template du composant testé
      ],
      providers: [
        { provide: TasksService, useClass: MockTasksService },
        { provide: Router, useClass: MockRouter },
        { provide: MatDialog, useClass: MockMatDialog }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TasksListPageComponent);
    component = fixture.componentInstance;
    tasksService = TestBed.inject(TasksService);
    router = TestBed.inject(Router);
    dialog = TestBed.inject(MatDialog);
    // fixture.detectChanges(); // ngOnInit est appelé ici, donc getAllTasks sera appelé
  });

  describe('Test de l\'initialisation', () => {
      it('devrait créer le composant', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Initialisation (ngOnInit)', () => {
    it('devrait appeler getAllTasks et initialiser les tâches et la pagination', fakeAsync(() => {
      spyOn(tasksService, 'getAllTasks').and.callThrough();
      fixture.detectChanges(); // Déclenche ngOnInit
      tick();

      expect(tasksService.getAllTasks).toHaveBeenCalled();
      expect(component.tasks.length).toBe(mockTasks.length);
      expect(component.displayedTasks.length).toBe(Math.min(mockTasks.length, component.pageSizeDef));
      expect(component.loading).toBeFalse();
      expect(component.errorMessage).toBeNull();
      expect(component.pagination.length).toBe(mockTasks.length);
    }));

    it('devrait gérer les erreurs lors de l\'appel à getAllTasks', fakeAsync(() => {
      spyOn(tasksService, 'getAllTasks').and.returnValue(throwError(() => new Error('Erreur API')));
      fixture.detectChanges(); // Déclenche ngOnInit
      tick();

      expect(component.loading).toBeFalse();
      expect(component.errorMessage).toBe('Données indisponibles');
      expect(component.tasks.length).toBe(0);
    }));
  });

  describe('Gestion des filtres (toggleFilter)', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick();
    }));

    it('devrait appeler getTodoTasks quand le filtre est activé et non getAllTasks par cette action', fakeAsync(() => {
      // fixture.detectChanges() dans le beforeEach a déjà appelé ngOnInit -> component.getAllTasks()
      // Vérification des méthodes du composant pour voir si toggleFilter les appelle.
      const getAllTasksSpyOnComponent = spyOn(component, 'getAllTasks').and.callThrough();
      const getTodoTasksSpyOnComponent = spyOn(component, 'getTodoTasks').and.callThrough();
      // Espionner aussi les méthodes du service pour vérifier les appels au backend
      const getAllTasksSpyOnService = spyOn(tasksService, 'getAllTasks').and.callThrough();
      const getTodoTasksSpyOnService = spyOn(tasksService, 'getTodoTasks').and.callThrough();

      getAllTasksSpyOnComponent.calls.reset();
      getAllTasksSpyOnService.calls.reset();

      component.toggleFilter(true);
      tick();

      expect(getAllTasksSpyOnComponent).not.toHaveBeenCalled();
      expect(getTodoTasksSpyOnComponent).toHaveBeenCalledTimes(1);
      expect(getTodoTasksSpyOnService).toHaveBeenCalledTimes(1); // Vérifie l'appel au service
      expect(component.tasks.length).toBe(mockTodoTasks.length);
      expect(component.filter).toBeTrue();
    }));

    it('devrait appeler getAllTasks quand le filtre est désactivé et non getTodoTasks par cette action', fakeAsync(() => {
      component.filter = true; // Simule un état où le filtre était actif
      // Vérification des méthodes du composant pour voir si toggleFilter les appelle.
      const getAllTasksSpyOnComponent = spyOn(component, 'getAllTasks').and.callThrough();
      const getTodoTasksSpyOnComponent = spyOn(component, 'getTodoTasks').and.callThrough();
      // Espionner aussi les méthodes du service pour vérifier les appels au backend
      const getAllTasksSpyOnService = spyOn(tasksService, 'getAllTasks').and.callThrough();
      const getTodoTasksSpyOnService = spyOn(tasksService, 'getTodoTasks').and.callThrough();

      getTodoTasksSpyOnComponent.calls.reset();
      getTodoTasksSpyOnService.calls.reset();

      component.toggleFilter(false);
      tick();

      expect(getAllTasksSpyOnComponent).toHaveBeenCalledTimes(1);
      expect(getTodoTasksSpyOnComponent).not.toHaveBeenCalled();
      expect(getAllTasksSpyOnService).toHaveBeenCalledTimes(1); // Vérifie l'appel au service
      expect(component.tasks.length).toBe(mockTasks.length);
      expect(component.filter).toBeFalse();
    }));
  });

  describe('Navigation', () => {
    it('devrait naviguer vers "add-task" lors de l\'appel à displayAddTaskForm', () => {
      spyOn(router, 'navigate').and.callThrough();
      component.displayAddTaskForm();
      expect(router.navigate).toHaveBeenCalledWith(['add-task']);
    });
  });

  describe('Gestion des tâches', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick();
    }));

    it('devrait mettre à jour une tâche et rafraîchir la liste', fakeAsync(() => {
      const taskToUpdate = { ...mockTasks[0], completed: true };
      spyOn(tasksService, 'updateTask').and.returnValue(of(taskToUpdate));
      spyOn(component, 'initPage').and.callThrough();

      component.updateTask(taskToUpdate);
      tick();

      expect(tasksService.updateTask).toHaveBeenCalledWith(taskToUpdate);
      expect(component.tasks.find(t => t.id === taskToUpdate.id)?.completed).toBeTrue();
      expect(component.initPage).toHaveBeenCalled();
      expect(component.loading).toBeFalse();
    }));

    it('devrait ouvrir un dialogue d\'alerte en cas d\'erreur de mise à jour', fakeAsync(() => {
      const taskToUpdate = { ...mockTasks[0], completed: true };
      spyOn(tasksService, 'updateTask').and.returnValue(throwError(() => new Error('Erreur de mise à jour')));
      spyOn(dialog, 'open').and.callThrough();

      component.updateTask(taskToUpdate);
      tick();

      expect(dialog.open).toHaveBeenCalledWith(AlertComponent, {data: "Erreur lors de la sauvegarde des données", width: "50%"});
      expect(component.loading).toBeFalse();
    }));

    it('devrait ouvrir le dialogue TaskDetailsComponent lors de l\'appel à onDetailsTaskClick', () => {
      spyOn(dialog, 'open').and.callThrough();
      const task = mockTasks[0];
      component.onDetailsTaskClick(task);
      expect(dialog.open).toHaveBeenCalledWith(TaskDetailsComponent, {data: task.id, width: "50%"});
    });

    it('devrait supprimer une tâche après confirmation et appeler getTodoTasks si le filtre est actif', fakeAsync(() => {
      spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<typeof QuestionComponent>);
      spyOn(tasksService, 'removeTask').and.callThrough();

      const getAllTasksSpy = spyOn(component, 'getAllTasks').and.callThrough();
      const getTodoTasksSpy = spyOn(component, 'getTodoTasks').and.callThrough();

      // ngOnInit a appelé component.getAllTasks()
      getAllTasksSpy.calls.reset();

      component.filter = true;
      component.onDeleteTaskClick(mockTasks[0].id);
      tick(); // Pour la fermeture du dialogue et l'appel au service

      expect(dialog.open).toHaveBeenCalledWith(QuestionComponent, {data: "Êtes-vous sûr de vouloir supprimer cette tâche ?", width: "50%"});
      expect(tasksService.removeTask).toHaveBeenCalledWith(mockTasks[0].id);
      expect(getTodoTasksSpy).toHaveBeenCalledTimes(1);
      expect(getAllTasksSpy).not.toHaveBeenCalled();
      expect(component.loading).toBeFalse();
    }));

    it('devrait supprimer une tâche après confirmation et appeler getAllTasks si le filtre est inactif', fakeAsync(() => {
      spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<typeof QuestionComponent>);
      spyOn(tasksService, 'removeTask').and.callThrough();
      const getAllTasksSpy = spyOn(component, 'getAllTasks').and.callThrough();
      const getTodoTasksSpy = spyOn(component, 'getTodoTasks').and.callThrough();

      // ngOnInit a appelé component.getAllTasks()
      getAllTasksSpy.calls.reset();

      component.filter = false;
      component.onDeleteTaskClick(mockTasks[0].id);
      tick();

      expect(dialog.open).toHaveBeenCalledWith(QuestionComponent, {data: "Êtes-vous sûr de vouloir supprimer cette tâche ?", width: "50%"});
      expect(tasksService.removeTask).toHaveBeenCalledWith(mockTasks[0].id);
      expect(getAllTasksSpy).toHaveBeenCalledTimes(1);
      expect(getTodoTasksSpy).not.toHaveBeenCalled();
      expect(component.loading).toBeFalse();
    }));

    it('ne devrait pas supprimer une tâche si la confirmation est annulée', fakeAsync(() => {
      spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(false) } as MatDialogRef<typeof QuestionComponent>);
      spyOn(tasksService, 'removeTask');

      component.onDeleteTaskClick(mockTasks[0].id);
      tick();

      expect(tasksService.removeTask).not.toHaveBeenCalled();
    }));

    it('devrait appeler getTaskStatus du service', () => {
      spyOn(tasksService, 'getTaskStatus').and.callThrough();
      component.getStatus(true);
      expect(tasksService.getTaskStatus).toHaveBeenCalledWith(true);
      component.getStatus(false);
      expect(tasksService.getTaskStatus).toHaveBeenCalledWith(false);
    });
  });

  describe('Gestion de la pagination', () => {
    it('devrait initialiser la pagination correctement dans ngOnInit', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      expect(component.pagination.length).toBe(mockTasks.length);
      expect(component.pagination.pageSize).toBe(component.pageSizeDef);
      expect(component.pagination.idxPage).toBe(0);
      expect(component.pagination.idxPremiereLigne).toBe(0);
      expect(component.pagination.idxDerniereLigne).toBe(Math.min(mockTasks.length, component.pageSizeDef));
      expect(component.displayedTasks.length).toBe(Math.min(mockTasks.length, component.pageSizeDef));
    }));

    it('devrait mettre à jour displayedTasks et pagination lors de l\'appel à changePagination avec un PageEvent', fakeAsync(() => {
      const mockPageEvent: PageEvent = {
        length: mockTasks.length, // La longueur totale reste la même
        pageIndex: 1,             // L'utilisateur va à la deuxième page
        pageSize: 1,              // L'utilisateur change la taille de la page à 1
        previousPageIndex: 0      // Page précédente était la première
      };

      fixture.detectChanges(); // ngOnInit -> getAllTasks -> initPage
      tick();

      component.changePagination(mockPageEvent);
      // Pas besoin de tick() ici car changePagination est synchrone et met à jour les propriétés directement.

      expect(component.pagination.length).toBe(mockTasks.length);
      expect(component.pagination.pageSize).toBe(mockPageEvent.pageSize);
      expect(component.pagination.idxPage).toBe(mockPageEvent.pageIndex);
      expect(component.pagination.idxPremiereLigne).toBe(mockPageEvent.pageIndex * mockPageEvent.pageSize); // 1 * 1 = 1
      expect(component.pagination.idxDerniereLigne).toBe(Math.min(mockTasks.length, (mockPageEvent.pageIndex * mockPageEvent.pageSize) + mockPageEvent.pageSize)); // min(3, 1+1=2) = 2
      expect(component.displayedTasks.length).toBe(mockPageEvent.pageSize); // Devrait être 1
      expect(component.displayedTasks[0]).toEqual(mockTasks[1]); // La tâche à l'index 1 (Task 2)
    }));
  });

});
