package com.moyunzhige.domain.service;

import com.moyunzhige.domain.gateway.GameScoreGateway;
import com.moyunzhige.domain.model.GameScore;

import java.util.List;
import java.util.UUID;

public class ScoreDomainService {
    private final GameScoreGateway scoreGateway;

    public ScoreDomainService(GameScoreGateway scoreGateway) {
        this.scoreGateway = scoreGateway;
    }

    public GameScore submitScore(GameScore score) {
        score.setId(UUID.randomUUID().toString());
        score.setPlayedAt(System.currentTimeMillis());
        score.setRank(calculateRank(score.getAccuracy()));
        return scoreGateway.save(score);
    }

    public List<GameScore> getLeaderboard(String levelId, int limit) {
        return scoreGateway.findTopByLevelId(levelId, limit);
    }

    private String calculateRank(double accuracy) {
        if (accuracy >= 0.95) return "S";
        if (accuracy >= 0.85) return "A";
        if (accuracy >= 0.70) return "B";
        return "C";
    }
}
