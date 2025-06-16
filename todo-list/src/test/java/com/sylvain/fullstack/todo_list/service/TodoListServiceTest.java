package com.sylvain.fullstack.todo_list.service;

import com.sylvain.fullstack.todo_list.model.Task;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class TodoListServiceTest {

    private TodoListService todoListService;

    @BeforeEach
    void setUp() {
        todoListService = new TodoListService();
    }

    @Test
    @DisplayName("Devrait ajouter une tâche et lui assigner un id")
    void addTask_shouldAddTaskWithGeneratedId() {
        Task newTask = new Task(null, "Task 1", "Desc 1", false);
        Task addedTask = todoListService.addTask(newTask);

        assertNotNull(addedTask.getId(), "L'id de la tâche ne devrait pas être null après l'ajout");
        assertEquals("Task 1", addedTask.getLabel());
        // La liste des tâches est vide initialement, donc l'id commence à 1 pour ce test
        assertEquals(1, (long) addedTask.getId(), "L'id généré devrait être égal à 1");

        Task retrievedTask = todoListService.getTaskById(addedTask.getId());
        assertNotNull(retrievedTask, "La tâche ajoutée devrait être récupérable par son id");
        assertEquals(addedTask.getLabel(), retrievedTask.getLabel());
    }

    @Test
    @DisplayName("Devrait retourner toutes les tâches")
    void getAllTasks_shouldReturnAllTasks() {
        List<Task> initialTasks = todoListService.getAllTasks();
        assertEquals(0, initialTasks.size(), "La liste des tâches devrait être vide initialement");

        todoListService.addTask(new Task(null, "Task 1", "Desc 1", false));
        todoListService.addTask(new Task(null, "Task 2", "Desc 2", false));
        todoListService.addTask(new Task(null, "Task 3", "Desc 3", true));

        List<Task> allTasks = todoListService.getAllTasks();
        assertEquals(3, allTasks.size(), "Devrait retourner 3 tâches après ajouts");
    }

    @Test
    @DisplayName("Devrait retourner uniquement les tâches à faire")
    void getTodoTasks_shouldReturnOnlyIncompleteTasks() {
        List<Task> initialTasks = todoListService.getTodoTasks();
        assertEquals(0, initialTasks.size(), "La liste des tâches devrait être vide initialement");

        todoListService.addTask(new Task(null, "Task 1", "Desc 1", false));
        todoListService.addTask(new Task(null, "Task 2", "Desc 2", false));
        todoListService.addTask(new Task(null, "Task 3", "Desc 3", true));

        List<Task> todoTasks = todoListService.getTodoTasks();
        assertEquals(2, todoTasks.size(), "Devrait retourner 2 tâches à faire");
        assertTrue(todoTasks.stream().noneMatch(Task::isCompleted), "Aucune tâche retournée ne devrait être complétée");
    }

    @Test
    @DisplayName("Devrait retourner une tâche par son id existant")
    void getTaskById_whenTaskExists_shouldReturnTask() {
        todoListService.addTask(new Task(null, "Task 1", "Desc 1", false));
        todoListService.addTask(new Task(null, "Task 2", "Desc 2", false));
        todoListService.addTask(new Task(null, "Task 3", "Desc 3", true));
        Task addedTask = todoListService.addTask(new Task(null, "Task test id", "Desc 4", false));
        Long newTaskId = addedTask.getId();

        Task foundTask = todoListService.getTaskById(newTaskId);
        assertNotNull(foundTask, "La tâche devrait être trouvée");
        assertEquals(newTaskId, foundTask.getId());
        assertEquals("Task test id", foundTask.getLabel());
    }

    @Test
    @DisplayName("Devrait retourner null pour un id de tâche non existant")
    void getTaskById_whenTaskDoesNotExist_shouldReturnNull() {
        todoListService.addTask(new Task(null, "Task 1", "Desc 1", false));
        todoListService.addTask(new Task(null, "Task 2", "Desc 2", false));
        todoListService.addTask(new Task(null, "Task 3", "Desc 3", true));

        Long nonExistingId = 999L;
        Task foundTask = todoListService.getTaskById(nonExistingId);
        assertNull(foundTask, "Aucune tâche ne devrait être trouvée pour un ID non existant");
    }

    @Test
    @DisplayName("Devrait mettre à jour le statut d'une tâche existante")
    void updateTask_whenTaskExists_shouldUpdateStatusAndReturnTask() {
        todoListService.addTask(new Task(null, "Task 1", "Desc 1", false));
        todoListService.addTask(new Task(null, "Task 2", "Desc 2", false));
        todoListService.addTask(new Task(null, "Task 3", "Desc 3", true));

        Task taskToUpdate = todoListService.getAllTasks().get(1); // Prend la seconde tâche
        Long taskId = taskToUpdate.getId();
        assertFalse(taskToUpdate.isCompleted(), "La tâche devrait initialement être non terminée");

        Task updatedTask = todoListService.updateTask(taskId, true);

        assertNotNull(updatedTask, "La tâche mise à jour ne devrait pas être null");
        assertEquals(taskId, updatedTask.getId(), "La tâche renvoyée n'est pas la tâche attendue");
        assertTrue(updatedTask.isCompleted(), "Le statut de la tâche devrait être mis à jour à 'true'");

        Task retrievedTask = todoListService.getTaskById(taskId);
        assertTrue(retrievedTask.isCompleted(), "La tâche récupérée devrait avoir le statut mis à jour");
    }

    @Test
    @DisplayName("Devrait retourner null lors de la mise à jour d'une tâche non existante")
    void updateTask_whenTaskDoesNotExist_shouldReturnNull() {
        todoListService.addTask(new Task(null, "Task 1", "Desc 1", false));
        todoListService.addTask(new Task(null, "Task 2", "Desc 2", false));
        todoListService.addTask(new Task(null, "Task 3", "Desc 3", true));

        Long nonExistingId = 999L;
        Task updatedTask = todoListService.updateTask(nonExistingId, true);
        assertNull(updatedTask, "La mise à jour d'une tâche non existante devrait retourner null");
    }

    @Test
    @DisplayName("Devrait supprimer une tâche existante et retourner true")
    void deleteTask_whenTaskExists_shouldRemoveTaskAndReturnTrue() {
        Task taskToDelete = todoListService.addTask(new Task(null, "Task 1", "Desc 1", false));
        Long taskId = taskToDelete.getId();
        int initialSize = todoListService.getAllTasks().size();

        boolean result = todoListService.deleteTask(taskId);

        assertTrue(result, "La suppression devrait retourner true pour une tâche existante");
        assertNull(todoListService.getTaskById(taskId), "La tâche supprimée ne devrait plus être trouvable");
        assertEquals(initialSize - 1, todoListService.getAllTasks().size(), "La taille de la liste devrait diminuer de 1");
    }

    @Test
    @DisplayName("Devrait retourner false lors de la tentative de suppression d'une tâche non existante")
    void deleteTask_whenTaskDoesNotExist_shouldReturnFalse() {
        Long nonExistingId = 999L;
        int initialSize = todoListService.getAllTasks().size();

        boolean result = todoListService.deleteTask(nonExistingId);

        assertFalse(result, "La suppression devrait retourner false pour une tâche non existante");
        assertEquals(initialSize, todoListService.getAllTasks().size(), "La taille de la liste ne devrait pas changer");
    }
}