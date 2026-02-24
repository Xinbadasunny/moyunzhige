package com.moyunzhige.app.dto;

import lombok.Data;

@Data
public class LeaderboardEntry {
    private String rank;
    private String playerName;
    private Integer score;
    private Integer maxCombo;
    private Double accuracy;
    private String grade;
    private Long playedAt;
}
