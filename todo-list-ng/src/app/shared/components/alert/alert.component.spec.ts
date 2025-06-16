import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations'; // Importé pour les composants Material

import { AlertComponent } from './alert.component';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<AlertComponent>>;
  const mockDialogData = 'Attention !';

  beforeEach(async () => {
    // Créer un spy pour MatDialogRef
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        AlertComponent,
        NoopAnimationsModule // Nécessaire pour les tests avec les composants Angular Material Dialog
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Test de l\'initialisation', () => {
      it('devrait créer le composant', () => {
      expect(component).toBeTruthy();
    });

    it('devrait injecter le texte du message dans le composant à partir de MAT_DIALOG_DATA', () => {
      expect(component.message).toBe(mockDialogData);
    });

    it('devrait afficher le texte du message dans le composant', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('mat-dialog-content p')?.textContent).toContain(mockDialogData);
    });

    it('devrait avoir un bouton "Fermer"', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const button = compiled.querySelector('mat-dialog-actions button');
      expect(button?.textContent?.trim()).toBe('Fermer');
    });
  });

  describe('onCloseClick', () => {
    it('devrait fermer la boite de dialogue lorsque onCloseClick est appelée', () => {
      component.onCloseClick();
      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });
});
