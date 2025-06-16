import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Subject } from 'rxjs';

// Définition d'une classe pour personnaliser le MatPaginator en français
@Injectable()
export class MyCustomPaginatorIntl implements MatPaginatorIntl {
  changes = new Subject<void>();

  firstPageLabel = 'Première page';
  itemsPerPageLabel = 'Nombre par page';
  lastPageLabel = 'Dernière page';

  nextPageLabel = 'Page suivante';
  previousPageLabel = 'Page précédente';

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return 'Page 1 de 1';
    }
    const amountPages = Math.ceil(length / pageSize);
    return `Page ${page + 1} de ${amountPages}`;
  }
}
