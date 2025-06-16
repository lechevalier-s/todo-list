package com.sylvain.fullstack.todo_list.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sylvain.fullstack.todo_list.model.Task;
import com.sylvain.fullstack.todo_list.service.TodoListService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class) // Intégration de Mockito avec JUnit 5
class TodoListControllerTest {

    private MockMvc mockMvc;

    @Mock // Crée un mock pour TodoListService
    private TodoListService todoListService;

    @InjectMocks // Injecte les mocks (todoListService) dans TodoListController
    private TodoListController todoListController;

    private ObjectMapper objectMapper; // Pour la sérialisation/désérialisation JSON

    @BeforeEach
    void setUp() {
        // Configure MockMvc pour tester le contrôleur de manière isolée
        mockMvc = MockMvcBuilders.standaloneSetup(todoListController).build();
        objectMapper = new ObjectMapper();
    }


    @Test
    @DisplayName("GET /api/v1/tasks/all - Devrait retourner toutes les tâches et le statut 200 OK")
    void getAllTasks_shouldReturnListOfTasks() throws Exception {
        Task task1 = new Task(1L, "Task 1", "Desc 1", false);
        Task task2 = new Task(2L, "Task 2", "Desc 2", true);
        List<Task> tasks = Arrays.asList(task1, task2);

        when(todoListService.getAllTasks()).thenReturn(tasks);

        mockMvc.perform(get("/api/v1/tasks/all"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].label", is("Task 1")))
                .andExpect(jsonPath("$[0].description", is("Desc 1")))
                .andExpect(jsonPath("$[1].id", is(2)))
                .andExpect(jsonPath("$[1].label", is("Task 2")))
                .andExpect(jsonPath("$[1].description", is("Desc 2")));

        verify(todoListService).getAllTasks();
    }

    @Test
    @DisplayName("GET /api/v1/tasks/todo - Devrait retourner les tâches à faire et le statut 200 OK")
    void getTodoTasks_shouldReturnListOfTodoTasks() throws Exception {
        Task task1 = new Task(1L, "Task 1 to do", "Desc 1", false);
        Task task2 = new Task(3L, "Task 2 to do", "Desc 2", false);
        List<Task> todoTasks = Arrays.asList(task1, task2);

        when(todoListService.getTodoTasks()).thenReturn(todoTasks);

        mockMvc.perform(get("/api/v1/tasks/todo"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].label", is("Task 1 to do")))
                .andExpect(jsonPath("$[0].description", is("Desc 1")))
                .andExpect(jsonPath("$[0].completed", is(false)))
                .andExpect(jsonPath("$[1].label", is("Task 2 to do")))
                .andExpect(jsonPath("$[1].description", is("Desc 2")))
                .andExpect(jsonPath("$[1].completed", is(false)));

        verify(todoListService).getTodoTasks();
    }

    @Test
    @DisplayName("GET /api/v1/tasks/todo - Devrait retourner une liste de tâches vide et le statut 200 OK")
    void getTodoTasks_shouldReturnEmptyListWhenNoTodoTasks() throws Exception {
        when(todoListService.getTodoTasks()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/v1/tasks/todo"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(0)));

        verify(todoListService).getTodoTasks();
    }

    @Test
    @DisplayName("GET /api/v1/tasks/{id} - Devrait retourner la tâche si elle existe et le statut 200 OK")
    void getTaskById_whenTaskExists_shouldReturnTask() throws Exception {
        Task task = new Task(1L, "Test Task", "Desc", false);
        when(todoListService.getTaskById(1L)).thenReturn(task);

        mockMvc.perform(get("/api/v1/tasks/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.label", is("Test Task")))
                .andExpect(jsonPath("$.description", is("Desc")));

        verify(todoListService).getTaskById(1L);
    }

    @Test
    @DisplayName("GET /api/v1/tasks/{id} - Devrait retourner le statut 404 Not Found si la tâche n'existe pas")
    void getTaskById_whenTaskDoesNotExist_shouldReturnNotFound() throws Exception {
        when(todoListService.getTaskById(99L)).thenReturn(null);

        mockMvc.perform(get("/api/v1/tasks/99"))
                .andExpect(status().isNotFound());

        verify(todoListService).getTaskById(99L);
    }

    @Test
    @DisplayName("POST /api/v1/tasks/add - Devrait créer une tâche et retourner la tâche créée avec le statut 201 Created")
    void addTask_shouldCreateTaskAndReturnItWithStatusCreated() throws Exception {
        Task newTaskDto = new Task(null, "New Task", "Desc", false); // DTO, id est null avant création
        Task savedTask = new Task(1L, "New Task", "Desc", false);   // Entité sauvegardée avec un ID

        // Simule le service qui retourne la tâche sauvegardée (avec ID)
        when(todoListService.addTask(any(Task.class))).thenReturn(savedTask);

        mockMvc.perform(post("/api/v1/tasks/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newTaskDto)))
                .andExpect(status().isCreated()) // Vérifie le statut HTTP 201 Created
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.label", is("New Task")))
                .andExpect(jsonPath("$.description", is("Desc")));

        // Vérifie que le service a été appelé avec un objet Task correspondant
        verify(todoListService).addTask(argThat(task ->
                task.getLabel().equals("New Task")
                        && task.getDescription().equals("Desc")
                        && !task.isCompleted()
        ));
    }

    @Test
    @DisplayName("PUT /api/v1/tasks/update - Devrait mettre à jour la tâche et retourner la tâche mise à jour avec le statut 200 OK")
    void updateTask_whenTaskExists_shouldUpdateAndReturnTask() throws Exception {
        Long taskId = 1L;
        Task taskToUpdatePayload = new Task(taskId, "Task 1", "Description", true);
        Task updatedTaskFromService = new Task(taskId, "Task 1", "Description", true);

        when(todoListService.updateTask(eq(taskId), eq(true))).thenReturn(updatedTaskFromService);

        mockMvc.perform(put("/api/v1/tasks/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taskToUpdatePayload)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(taskId.intValue())))
                .andExpect(jsonPath("$.label", is("Task 1")))
                .andExpect(jsonPath("$.description", is("Description")))
                .andExpect(jsonPath("$.completed", is(true)));

        verify(todoListService).updateTask(taskId, true);
    }

    @Test
    @DisplayName("PUT /api/v1/tasks/update - Devrait retourner le statut 404 Not Found si la tâche à mettre à jour n'existe pas")
    void updateTask_whenTaskDoesNotExist_shouldReturnNotFound() throws Exception {
        Long taskId = 99L;
        Task taskToUpdatePayload = new Task(taskId, "Task 1", "Tâche inconnue", true);

        when(todoListService.updateTask(eq(taskId), eq(true))).thenReturn(null);

        mockMvc.perform(put("/api/v1/tasks/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taskToUpdatePayload)))
                .andExpect(status().isNotFound());

        verify(todoListService).updateTask(taskId, true);
    }

    @Test
    @DisplayName("DELETE /api/v1/tasks/{id} - Devrait supprimer la tâche et retourner le statut 204 No Content si elle existe")
    void deleteTask_whenTaskExists_shouldDeleteAndReturnNoContent() throws Exception {
        Long taskId = 1L;
        when(todoListService.deleteTask(taskId)).thenReturn(true);

        mockMvc.perform(delete("/api/v1/tasks/{id}", taskId))
                .andExpect(status().isNoContent()); // Le contrôleur retourne 204 No Content

        verify(todoListService).deleteTask(taskId);
    }

    @Test
    @DisplayName("DELETE /api/v1/tasks/{id} - Devrait retourner le statut 404 Not Found si la tâche à supprimer n'existe pas")
    void deleteTask_whenTaskDoesNotExist_shouldReturnNotFound() throws Exception {
        Long taskId = 99L;
        when(todoListService.deleteTask(taskId)).thenReturn(false);

        mockMvc.perform(delete("/api/v1/tasks/{id}", taskId))
                .andExpect(status().isNotFound());

        verify(todoListService).deleteTask(taskId);
    }
}