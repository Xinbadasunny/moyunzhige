package com.moyunzhige.domain.model;

import java.util.List;

public class Level {
    private String id;
    private String name;
    private String description;
    private String scene;
    private int bpm;
    private int difficulty;
    private List<Beat> beats;
    private long createdAt;
    private long updatedAt;

    public Level() {
    }

    public Level(String id, String name, String description, String scene, int bpm, int difficulty, List<Beat> beats, long createdAt, long updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.scene = scene;
        this.bpm = bpm;
        this.difficulty = difficulty;
        this.beats = beats;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getScene() {
        return scene;
    }

    public void setScene(String scene) {
        this.scene = scene;
    }

    public int getBpm() {
        return bpm;
    }

    public void setBpm(int bpm) {
        this.bpm = bpm;
    }

    public int getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(int difficulty) {
        this.difficulty = difficulty;
    }

    public List<Beat> getBeats() {
        return beats;
    }

    public void setBeats(List<Beat> beats) {
        this.beats = beats;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }

    public long getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(long updatedAt) {
        this.updatedAt = updatedAt;
    }
}
