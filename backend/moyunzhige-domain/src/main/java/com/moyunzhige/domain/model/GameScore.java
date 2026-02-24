package com.moyunzhige.domain.model;

/**
 * 游戏成绩领域模型
 */
public class GameScore {
    private String id;
    private String levelId;
    private String playerName;
    private int score;
    private int maxCombo;
    private int perfectCount;
    private int greatCount;
    private int goodCount;
    private int missCount;
    private double accuracy;
    private String rank;
    private long playedAt;

    public GameScore() {
    }

    public GameScore(String id, String levelId, String playerName, int score, int maxCombo, int perfectCount, int greatCount, int goodCount, int missCount, double accuracy, String rank, long playedAt) {
        this.id = id;
        this.levelId = levelId;
        this.playerName = playerName;
        this.score = score;
        this.maxCombo = maxCombo;
        this.perfectCount = perfectCount;
        this.greatCount = greatCount;
        this.goodCount = goodCount;
        this.missCount = missCount;
        this.accuracy = accuracy;
        this.rank = rank;
        this.playedAt = playedAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getLevelId() {
        return levelId;
    }

    public void setLevelId(String levelId) {
        this.levelId = levelId;
    }

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getMaxCombo() {
        return maxCombo;
    }

    public void setMaxCombo(int maxCombo) {
        this.maxCombo = maxCombo;
    }

    public int getPerfectCount() {
        return perfectCount;
    }

    public void setPerfectCount(int perfectCount) {
        this.perfectCount = perfectCount;
    }

    public int getGreatCount() {
        return greatCount;
    }

    public void setGreatCount(int greatCount) {
        this.greatCount = greatCount;
    }

    public int getGoodCount() {
        return goodCount;
    }

    public void setGoodCount(int goodCount) {
        this.goodCount = goodCount;
    }

    public int getMissCount() {
        return missCount;
    }

    public void setMissCount(int missCount) {
        this.missCount = missCount;
    }

    public double getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(double accuracy) {
        this.accuracy = accuracy;
    }

    public String getRank() {
        return rank;
    }

    public void setRank(String rank) {
        this.rank = rank;
    }

    public long getPlayedAt() {
        return playedAt;
    }

    public void setPlayedAt(long playedAt) {
        this.playedAt = playedAt;
    }
}