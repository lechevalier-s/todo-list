export interface Pagination {
  /** Nombre de lignes à afficher */
  length: number;
  /** Nombre de lignes dans une page du tableau */
  pageSize: number;
  /** Index de la page affichée */
  idxPage: number;
  /** Index de la première ligne affichée */
  idxPremiereLigne: number;
  /** Index de la dernière ligne affichée */
  idxDerniereLigne: number;
}
