import { Routes } from '@angular/router';
import { TasksListPageComponent } from './features/todo/pages/tasks-list-page/tasks-list-page.component';
import { AddTaskPageComponent } from './features/todo/pages/add-task-page/add-task-page.component';

export const routes: Routes = [
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  { path: 'tasks', component: TasksListPageComponent },
  { path: 'add-task', component: AddTaskPageComponent }
];
