package com.moyunzhige.app.dto;

import lombok.Data;

@Data
public class SubmitScoreRequest {
    private String levelId;
    private String playerName;
    private Integer score;
    private Integer maxCombo;
    private Integer perfectCount;
    private Integer greatCount;
    private Integer goodCount;
    private Integer missCount;
    private Double accuracy;
}
