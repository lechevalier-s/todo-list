import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { QuestionComponent } from './question.component';

describe('QuestionComponent', () => {
  let component: QuestionComponent;
  let fixture: ComponentFixture<QuestionComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<QuestionComponent>>;
  const mockDialogData = 'Êtes-vous sûr ?';

  beforeEach(async () => {
    // Créer un spy pour MatDialogRef
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [QuestionComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Test de l\'initialisation', () => {
    it('devrait créer le composant', () => {
      expect(component).toBeTruthy();
    });

    it('devrait injecter le texte de la question dans le composant depuis MAT_DIALOG_DATA', () => {
      expect(component.question).toBe(mockDialogData);
    });

    it('devrait afficher le texte de la question dans le composant', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('mat-dialog-content')?.textContent).toContain(mockDialogData);
    });

    it('devrait avoir les boutons "Oui" et "Non"', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const buttons = compiled.querySelectorAll('button');
      expect(buttons[0]?.textContent?.trim()).toBe('Oui');
      expect(buttons[1]?.textContent?.trim()).toBe('Non');
    });
  });

  describe('onYesClick', () => {
    it('devrait fermer la boite de dialogue avec la valeur true', () => {
      component.onYesClick();
      expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
    });
  });

  describe('onNoClick', () => {
    it('devrait fermer la boite de dialogue avec la valeur false', () => {
      component.onNoClick();
      expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
    });
  });
});
