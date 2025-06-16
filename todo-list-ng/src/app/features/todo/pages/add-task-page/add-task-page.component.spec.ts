import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations'; // Important pour les tests avec Material Dialog

import { AddTaskPageComponent } from './add-task-page.component';
import { TasksService } from '../../services/tasks.service';
import { Task } from '../../models/task.model';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';

// Mocks
class MockTasksService {
  addTask(task: Task) {
    return of({ ...task, id: 1 }); // Simule une tâche créée avec un id = 1
  }
}

class MockRouter {
  navigate(commands: any[]): Promise<boolean> {
    return Promise.resolve(true);
  }
}

class MockMatDialog {
  open() {
    return {
      afterClosed: () => of(true) // Simule la fermeture du dialogue
    };
  }
}

describe('AddTaskPageComponent', () => {
  let component: AddTaskPageComponent;
  let fixture: ComponentFixture<AddTaskPageComponent>;
  let tasksService: TasksService;
  let router: Router;
  let dialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AddTaskPageComponent, // Le composant est standalone, il importe ses propres modules
        FormsModule,          // Nécessaire car utilisé dans le template lié au composant
        NoopAnimationsModule  // Pour éviter les erreurs d'animation avec MatDialog
      ],
      providers: [
        { provide: TasksService, useClass: MockTasksService },
        { provide: Router, useClass: MockRouter },
        { provide: MatDialog, useClass: MockMatDialog }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTaskPageComponent);
    component = fixture.componentInstance;
    tasksService = TestBed.inject(TasksService);
    router = TestBed.inject(Router);
    dialog = TestBed.inject(MatDialog);
    fixture.detectChanges(); // Déclenche ngOnInit et le cycle de vie initial
  });

  describe('Test de l\'initialisation', () => {
    it('devrait créer le composant', () => {
      expect(component).toBeTruthy();
    });

    it('devrait initialiser newTask avec les valeurs par défaut', () => {
      expect(component.newTask).toEqual({
        label: '',
        description: '',
        completed: false
      });
    });

    it('devrait initialier loading à false', () => {
      expect(component.loading).toBeFalse();
    });
  });

  describe('Test de la validation du formulaire (onSubmit)', () => {
    it('sne devrait pas appeler tasksService.addTask si newTask.label est vide', () => {
      spyOn(tasksService, 'addTask').and.callThrough();
      component.newTask.label = '';
      component.onSubmit();
      expect(tasksService.addTask).not.toHaveBeenCalled();
      expect(component.loading).toBeFalse();
    });

    it('devrait appeler tasksService.addTask et revenir à la page de la liste des tâches en cas de succès', fakeAsync(() => {
      spyOn(tasksService, 'addTask').and.callThrough();
      spyOn(router, 'navigate').and.callThrough();
      component.newTask = { label: 'Test Task', description: 'Test Desc', completed: false };

      component.onSubmit();
      tick(); // Simule le passage du temps pour la résolution de l'Observable

      expect(tasksService.addTask).toHaveBeenCalledWith(component.newTask as Task);
      expect(component.loading).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
    }));

    it('devrait appeler tasksService.addTask et signaler une erreur dans une boîte de dialogue si réponse ko du serveur', fakeAsync(() => {
      spyOn(tasksService, 'addTask').and.returnValue(throwError(() => new Error('Service error')));
      spyOn(dialog, 'open').and.callThrough();
      spyOn(console, 'error');
      component.newTask = { label: 'Test Task Error', description: 'Test Desc', completed: false };

      component.onSubmit();
      tick(); // Simule le passage du temps pour la résolution de l'Observable (erreur)

      expect(tasksService.addTask).toHaveBeenCalledWith(component.newTask as Task);
      expect(component.loading).toBeFalse();
      expect(dialog.open).toHaveBeenCalledWith(AlertComponent, {data: "Erreur lors de la sauvegarde des données", width: "50%"});
      expect(console.error).toHaveBeenCalledWith('Erreur lors de l\'ajout de la tâche:', jasmine.any(Error));
    }));
  });

  describe('Test du clic sur Annuler dans le formulaire', () => {
    it('devrait changer de page et revenir à la liste des tâches', () => {
      spyOn(router, 'navigate').and.callThrough();
      component.goBack();
      expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
    });
  });
});
