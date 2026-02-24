package com.moyunzhige.app.dto;

import lombok.Data;
import com.moyunzhige.domain.model.GameScore;

@Data
public class GameScoreDTO {
    private String id;
    private String levelId;
    private String playerName;
    private Integer score;
    private Integer maxCombo;
    private Integer perfectCount;
    private Integer greatCount;
    private Integer goodCount;
    private Integer missCount;
    private Double accuracy;
    private String rank;
    private Long playedAt;

    public static GameScoreDTO fromDomain(GameScore gameScore) {
        if (gameScore == null) {
            return null;
        }
        GameScoreDTO dto = new GameScoreDTO();
        dto.setId(gameScore.getId());
        dto.setLevelId(gameScore.getLevelId());
        dto.setPlayerName(gameScore.getPlayerName());
        dto.setScore(gameScore.getScore());
        dto.setMaxCombo(gameScore.getMaxCombo());
        dto.setPerfectCount(gameScore.getPerfectCount());
        dto.setGreatCount(gameScore.getGreatCount());
        dto.setGoodCount(gameScore.getGoodCount());
        dto.setMissCount(gameScore.getMissCount());
        dto.setAccuracy(gameScore.getAccuracy());
        dto.setRank(gameScore.getRank());
        dto.setPlayedAt(gameScore.getPlayedAt());
        return dto;
    }

    public GameScore toDomain() {
        GameScore gameScore = new GameScore();
        gameScore.setId(this.id);
        gameScore.setLevelId(this.levelId);
        gameScore.setPlayerName(this.playerName);
        gameScore.setScore(this.score);
        gameScore.setMaxCombo(this.maxCombo);
        gameScore.setPerfectCount(this.perfectCount);
        gameScore.setGreatCount(this.greatCount);
        gameScore.setGoodCount(this.goodCount);
        gameScore.setMissCount(this.missCount);
        gameScore.setAccuracy(this.accuracy);
        gameScore.setRank(this.rank);
        gameScore.setPlayedAt(this.playedAt);
        return gameScore;
    }
}
