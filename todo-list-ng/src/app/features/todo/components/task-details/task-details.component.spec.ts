import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { TaskDetailsComponent } from './task-details.component';
import { TasksService } from '../../services/tasks.service';
import { Task } from '../../models/task.model';

// Mocks
const mockTask: Task = { id: 1, label: 'Test Task', description: 'Test Description', completed: false };
const mockTaskId = 1;

class MockTasksService {
  getTask(id: number) {
    if (id === mockTaskId) {
      return of(mockTask);
    }
    return throwError(() => new Error('Task not found'));
  }
  getTaskStatus(completed: boolean) {
    return completed ? 'Terminée' : 'A faire';
  }
}

describe('TaskDetailsComponent', () => {
  let component: TaskDetailsComponent;
  let fixture: ComponentFixture<TaskDetailsComponent>;
  let tasksService: TasksService;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<TaskDetailsComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        TaskDetailsComponent, // Le composant est standalone
        NoopAnimationsModule  // Pour les animations Material
      ],
      providers: [
        { provide: TasksService, useClass: MockTasksService },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockTaskId }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskDetailsComponent);
    component = fixture.componentInstance;
    tasksService = TestBed.inject(TasksService);
    // fixture.detectChanges() sera appelé dans les tests pour contrôler ngOnInit
  });

  describe('Test de l\'initialisation', () => {
      it('devrait créer le composant', () => {
      expect(component).toBeTruthy();
    });

    it('devrait injecter taskId depuis MAT_DIALOG_DATA', () => {
      expect(component.taskId).toBe(mockTaskId);
    });

    it('devrait afficher le sous-titre et le bouton de fermeture dans le template', () => {
      fixture.detectChanges(); // Pour que le template soit rendu
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('p')?.textContent).toContain('Détails de la tâche');
      expect(compiled.querySelector('button[mat-button]')?.textContent?.trim()).toBe('Fermer');
    });
  });

  describe('ngOnInit', () => {
    it('devrait appeler tasksService.getTask et initialiser les données de la tâche en cas de succès', fakeAsync(() => {
      spyOn(tasksService, 'getTask').and.callThrough();
      fixture.detectChanges(); // Déclenche ngOnInit
      tick(); // Simule le passage du temps pour la résolution de l'Observable

      expect(tasksService.getTask).toHaveBeenCalledWith(mockTaskId);
      expect(component.task).toEqual(mockTask);
      expect(component.loading).toBeFalse();
      expect(component.error).toBeFalse();
      expect(component.displayedData.length).toBe(4);
      expect(component.displayedData[0]).toEqual(['id', mockTask.id]);
      expect(component.displayedData[1]).toEqual(['Label', mockTask.label]);
      expect(component.displayedData[2]).toEqual(['Description', mockTask.description]);
      expect(component.displayedData[3]).toEqual(['Etat', 'A faire']);
    }));

    it('devrait gérer les erreurs lors de l\'appel à tasksService.getTask', fakeAsync(() => {
      spyOn(tasksService, 'getTask').and.returnValue(throwError(() => new Error('API Error')));
      spyOn(console, 'error'); // Espionner console.error pour vérifier qu'il est appelé
      fixture.detectChanges(); // Déclenche ngOnInit
      tick();

      expect(tasksService.getTask).toHaveBeenCalledWith(mockTaskId);
      expect(component.task).toBeNull();
      expect(component.loading).toBeFalse();
      expect(component.error).toBeTrue();
      expect(console.error).toHaveBeenCalled();
    }));
  });

  describe('getStatus', () => {
    it('devrait appeler tasksService.getTaskStatus et retourner la bonne chaîne', () => {
      spyOn(tasksService, 'getTaskStatus').and.callThrough();

      const statusCompleted = component.getStatus(true);
      expect(tasksService.getTaskStatus).toHaveBeenCalledWith(true);
      expect(statusCompleted).toBe('Terminée');

      const statusTodo = component.getStatus(false);
      expect(tasksService.getTaskStatus).toHaveBeenCalledWith(false);
      expect(statusTodo).toBe('A faire');
    });
  });

  describe('onCloseClick', () => {
    it('devrait appeler dialogRef.close', () => {
      component.onCloseClick();
      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });
});
