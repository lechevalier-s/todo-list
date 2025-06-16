package com.sylvain.fullstack.todo_list.controller;

import com.sylvain.fullstack.todo_list.model.Task;
import com.sylvain.fullstack.todo_list.service.TodoListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // Indique que cette classe est un contrôleur REST
@CrossOrigin(origins = "http://localhost:4200") // Permet les tests Angular en DEV
@RequestMapping("/api/v1/tasks") // Définit le chemin de base pour tous les points de terminaison de ce contrôleur
public class TodoListController {

    private final TodoListService todoService;

    // Injection de dépendance du TodoService
    @Autowired
    public TodoListController(TodoListService todoService) {
        this.todoService = todoService;
    }

    /**
     * Endpoint pour récupérer toutes les tâches
     * @return Réponse REST
     */
    @GetMapping("/all")
    public List<Task> getAllTasks() {
        return todoService.getAllTasks();
    }

    /**
     * Endpoint pour récupérer toutes les tâches
     * @return Réponse REST
     */
    @GetMapping("/todo")
    public List<Task> getTodoTasks() {
        return todoService.getTodoTasks();
    }

    /**
     * Endpoint pour récupérer une tâche par ID
     * @param id Identifiant de la tâche à récupérer
     * @return Réponse REST
     */
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        // @PathVariable lie la variable {id} du chemin à l'argument de la méthode
        Task task = todoService.getTaskById(id);
        // Utilise ResponseEntity pour contrôler la réponse HTTP (statut 200 OK ou 404 Not Found)
        return task != null ? ResponseEntity.ok(task) : ResponseEntity.notFound().build();
    }

    /**
     * Endpoint pour créer une nouvelle tâche
     * @param newTask Données de la tâche à créer
     * @return Réponse REST
     */
    @PostMapping("/add")
    @ResponseStatus(HttpStatus.CREATED) // Retourne un statut 201 Created en cas de succès
    public Task addTask(@RequestBody Task newTask) {
        // Le corps de la requête JSON est automatiquement converti en objet Task
        return todoService.addTask(newTask);
    }

    /**
     * Endpoint pour mettre à jour le statut d'une tâche
     * @param task Données de la tâche à sauvegarder, avec le nouveau statut de la tâche
     * @return Réponse REST
     */
    @PutMapping("/update")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Task> updateTask(@RequestBody Task task) {
        Task updatedTask = todoService.updateTask(task.getId(), task.isCompleted());
        // Retourne 200 OK avec la tâche mise à jour ou 404 Not Found
        return updatedTask != null ? ResponseEntity.ok(updatedTask) : ResponseEntity.notFound().build();
    }

    /**
     * Endpoint pour supprimer une tâche
     * @param id Identifiant de la tâche à supprimer
     * @return Réponse REST
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        boolean deleted = todoService.deleteTask(id);
        // Retourne 204 No Content si la suppression a réussi ou 404 Not Found si la tâche n'existait pas
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}