package com.moyunzhige.app.service;

import com.moyunzhige.app.dto.*;
import com.moyunzhige.domain.model.GameScore;
import com.moyunzhige.domain.service.ScoreDomainService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScoreAppService {

    private final ScoreDomainService scoreDomainService;

    public ScoreAppService(ScoreDomainService scoreDomainService) {
        this.scoreDomainService = scoreDomainService;
    }

    public GameScoreDTO submitScore(SubmitScoreRequest request) {
        GameScore gameScore = new GameScore();
        gameScore.setLevelId(request.getLevelId());
        gameScore.setPlayerName(request.getPlayerName());
        gameScore.setScore(request.getScore());
        gameScore.setMaxCombo(request.getMaxCombo());
        gameScore.setPerfectCount(request.getPerfectCount());
        gameScore.setGreatCount(request.getGreatCount());
        gameScore.setGoodCount(request.getGoodCount());
        gameScore.setMissCount(request.getMissCount());
        gameScore.setAccuracy(request.getAccuracy());

        GameScore savedScore = scoreDomainService.submitScore(gameScore);
        return GameScoreDTO.fromDomain(savedScore);
    }

    public List<LeaderboardEntry> getLeaderboard(String levelId, int limit) {
        List<GameScore> topScores = scoreDomainService.getLeaderboard(levelId, limit);
        
        return topScores.stream()
                .map(score -> {
                    LeaderboardEntry entry = new LeaderboardEntry();
                    entry.setRank(score.getRank());
                    entry.setPlayerName(score.getPlayerName());
                    entry.setScore(score.getScore());
                    entry.setMaxCombo(score.getMaxCombo());
                    entry.setAccuracy(score.getAccuracy());
                    entry.setGrade(calculateGrade(score.getAccuracy()));
                    entry.setPlayedAt(score.getPlayedAt());
                    return entry;
                })
                .collect(Collectors.toList());
    }

    private String calculateGrade(double accuracy) {
        if (accuracy >= 95.0) {
            return "S";
        } else if (accuracy >= 90.0) {
            return "A";
        } else if (accuracy >= 80.0) {
            return "B";
        } else {
            return "C";
        }
    }
}
