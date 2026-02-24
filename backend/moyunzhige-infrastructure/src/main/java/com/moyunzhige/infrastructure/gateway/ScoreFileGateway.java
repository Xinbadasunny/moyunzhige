package com.moyunzhige.infrastructure.gateway;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.moyunzhige.domain.gateway.GameScoreGateway;
import com.moyunzhige.domain.model.GameScore;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 游戏成绩文件存储网关实现
 */
@Repository
public class ScoreFileGateway implements GameScoreGateway {
    
    private static final Logger logger = LoggerFactory.getLogger(ScoreFileGateway.class);
    
    private final ObjectMapper objectMapper;
    private final String dataDir;
    private final Path scoresFilePath;
    private final Object lock = new Object();
    
    public ScoreFileGateway(@Value("${moyunzhige.data.dir:./data}") String dataDir) {
        this.dataDir = dataDir;
        this.scoresFilePath = Paths.get(dataDir, "scores.json");
        this.objectMapper = new ObjectMapper();
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
    }
    
    @PostConstruct
    public void init() {
        try {
            if (!Files.exists(scoresFilePath)) {
                Path parentDir = scoresFilePath.getParent();
                if (parentDir != null && !Files.exists(parentDir)) {
                    Files.createDirectories(parentDir);
                }
                objectMapper.writeValue(scoresFilePath.toFile(), new ArrayList<GameScore>());
                logger.info("Created scores.json file");
            }
        } catch (IOException e) {
            logger.error("Failed to initialize scores.json file", e);
            throw new RuntimeException("Failed to initialize ScoreFileGateway", e);
        }
    }
    
    @Override
    public List<GameScore> findByLevelId(String levelId) {
        synchronized (lock) {
            List<GameScore> allScores = readAllScores();
            return allScores.stream()
                .filter(score -> levelId.equals(score.getLevelId()))
                .collect(Collectors.toList());
        }
    }
    
    @Override
    public List<GameScore> findTopByLevelId(String levelId, int limit) {
        synchronized (lock) {
            List<GameScore> allScores = readAllScores();
            return allScores.stream()
                .filter(score -> levelId.equals(score.getLevelId()))
                .sorted(Comparator.comparingInt(GameScore::getScore).reversed())
                .limit(limit)
                .collect(Collectors.toList());
        }
    }
    
    @Override
    public GameScore save(GameScore score) {
        synchronized (lock) {
            if (score.getId() == null || score.getId().isEmpty()) {
                score.setId(UUID.randomUUID().toString());
            }
            
            score.setPlayedAt(System.currentTimeMillis());
            
            List<GameScore> allScores = readAllScores();
            allScores.add(score);
            writeAllScores(allScores);
            
            logger.info("Saved score: {} for level: {}", score.getId(), score.getLevelId());
            return score;
        }
    }
    
    @Override
    public List<GameScore> findAll() {
        synchronized (lock) {
            return readAllScores();
        }
    }
    
    private List<GameScore> readAllScores() {
        try {
            File file = scoresFilePath.toFile();
            if (file.exists()) {
                return objectMapper.readValue(file, new TypeReference<List<GameScore>>() {});
            }
            return new ArrayList<>();
        } catch (IOException e) {
            logger.error("Failed to read scores from file", e);
            throw new RuntimeException("Failed to read scores", e);
        }
    }
    
    private void writeAllScores(List<GameScore> scores) {
        try {
            objectMapper.writeValue(scoresFilePath.toFile(), scores);
        } catch (IOException e) {
            logger.error("Failed to write scores to file", e);
            throw new RuntimeException("Failed to write scores", e);
        }
    }
}
