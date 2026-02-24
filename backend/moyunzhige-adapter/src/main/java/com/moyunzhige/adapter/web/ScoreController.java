package com.moyunzhige.adapter.web;

import com.moyunzhige.app.dto.GameScoreDTO;
import com.moyunzhige.app.dto.LeaderboardEntry;
import com.moyunzhige.app.dto.SubmitScoreRequest;
import com.moyunzhige.app.service.ScoreAppService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scores")
@CrossOrigin(origins = "*")
public class ScoreController {

    private final ScoreAppService scoreAppService;

    public ScoreController(ScoreAppService scoreAppService) {
        this.scoreAppService = scoreAppService;
    }

    @PostMapping
    public ResponseEntity<GameScoreDTO> submitScore(@RequestBody SubmitScoreRequest request) {
        GameScoreDTO gameScore = scoreAppService.submitScore(request);
        return ResponseEntity.ok(gameScore);
    }

    @GetMapping("/leaderboard/{levelId}")
    public ResponseEntity<List<LeaderboardEntry>> getLeaderboard(
            @PathVariable String levelId,
            @RequestParam(defaultValue = "10") int limit) {
        List<LeaderboardEntry> leaderboard = scoreAppService.getLeaderboard(levelId, limit);
        return ResponseEntity.ok(leaderboard);
    }
}
