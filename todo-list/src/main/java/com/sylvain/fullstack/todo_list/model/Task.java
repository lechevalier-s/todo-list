package com.sylvain.fullstack.todo_list.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data // Génère getters et setters
@NoArgsConstructor  // Génère un constructeur sans argument
@AllArgsConstructor // Génère un constructeur avec tous les arguments
@EqualsAndHashCode(of = {"id"}) // Génère les méthodes equals et hashCode basées sur l'id uniquement
public class Task {

    private Long id;
    private String label;
    private String description;
    private boolean completed;

    @Override
    public String toString() {
        return "Task{" +
                "id=" + id +
                ", description='" + description + "'" +
                ", completed=" + completed +
                "}";
    }
}