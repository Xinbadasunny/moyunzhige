package com.moyunzhige.domain.model;

/**
 * 节拍对象
 */
public class Beat {
    private double time;
    private String type;
    private double duration;
    private String enemyType;

    public Beat() {
    }

    public Beat(double time, String type, double duration, String enemyType) {
        this.time = time;
        this.type = type;
        this.duration = duration;
        this.enemyType = enemyType;
    }

    public double getTime() {
        return time;
    }

    public void setTime(double time) {
        this.time = time;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public double getDuration() {
        return duration;
    }

    public void setDuration(double duration) {
        this.duration = duration;
    }

    public String getEnemyType() {
        return enemyType;
    }

    public void setEnemyType(String enemyType) {
        this.enemyType = enemyType;
    }
}
