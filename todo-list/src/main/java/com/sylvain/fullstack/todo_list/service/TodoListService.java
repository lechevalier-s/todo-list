package com.sylvain.fullstack.todo_list.service;

import com.sylvain.fullstack.todo_list.model.Task;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class TodoListService {

    // Stockage en mémoire des tâches. ConcurrentHashMap est thread-safe.
    private final Map<Long, Task> tasksList = new ConcurrentHashMap<>();
    // Compteur atomique pour générer des IDs uniques
    private final AtomicLong idCounter = new AtomicLong();

    public TodoListService(){
        // Ajout d'une tâche pour test
        // addTask(new Task(0L, "Acheter du pain", "Aller à la boulangerie", false));
    }

    /**
     * Ajout d'une nouvelle tâche
     * @param newTask Données de la tâche à ajouter
     * @return Tâche créée
     */
    public Task addTask(Task newTask) {
        Long id = idCounter.incrementAndGet();
        newTask.setId(id);
        tasksList.put(id, newTask);
        return newTask;
    }

    /**
     * Récupération de toutes les tâches
     * @return Liste des tâches en mémoire
     */
    public List<Task> getAllTasks() {
        return new ArrayList<>(tasksList.values());
    }

    /**
     * Récupération des tâches à effectuer
     * @return Liste des tâches dont le statut completed est à false
     */
    public List<Task> getTodoTasks() {
        return tasksList.values().stream()
                .filter(task -> !task.isCompleted())
                .collect(Collectors.toList());
    }

    /**
     * Récupère une tâche par son id
     * @param id id de la tâche à récupérer
     * @return Tâche trouvée, null si non trouvée
     */
    public Task getTaskById(Long id) {
        return tasksList.get(id);
    }

    /**
     * Modification du statut d'une tâche
     * @param id id de la tâche à modifier
     * @param completed Nouveau statut de la tâche
     * @return Tâche mise à jour
     */
    public Task updateTask(Long id, boolean completed) {
        // Vérifie si la tâche avec cet ID existe
        Task task = tasksList.get(id);
        if (task != null) {
            task.setCompleted(completed);
            return task;
        } else{
            return null;
        }
    }

    /**
     * Suppression d'une tâche
     * @param id id de la tâche à supprimer
     * @return true si la tâche a été trouvée et supprimée, false sinon
     */
    public boolean deleteTask(Long id) {
        return tasksList.remove(id) != null;
    }
}