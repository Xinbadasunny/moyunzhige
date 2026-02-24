package com.moyunzhige.infrastructure.gateway;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.moyunzhige.domain.gateway.LevelGateway;
import com.moyunzhige.domain.model.Level;
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
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * 关卡文件存储网关实现
 */
@Repository
public class LevelFileGateway implements LevelGateway {
    
    private static final Logger logger = LoggerFactory.getLogger(LevelFileGateway.class);
    
    private final ObjectMapper objectMapper;
    private final String dataDir;
    private final Path levelsDir;
    
    public LevelFileGateway(@Value("${moyunzhige.data.dir:./data}") String dataDir) {
        this.dataDir = dataDir;
        this.levelsDir = Paths.get(dataDir, "levels");
        this.objectMapper = new ObjectMapper();
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
    }
    
    @PostConstruct
    public void init() {
        try {
            if (!Files.exists(levelsDir)) {
                Files.createDirectories(levelsDir);
                logger.info("Created levels directory: {}", levelsDir);
            }
        } catch (IOException e) {
            logger.error("Failed to create levels directory", e);
            throw new RuntimeException("Failed to initialize LevelFileGateway", e);
        }
    }
    
    @Override
    public List<Level> findAll() {
        if (!Files.exists(levelsDir)) {
            return new ArrayList<>();
        }
        
        try (Stream<Path> paths = Files.walk(levelsDir, 1)) {
            return paths
                .filter(Files::isRegularFile)
                .filter(path -> path.toString().endsWith(".json"))
                .map(this::readLevelFromFile)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());
        } catch (IOException e) {
            logger.error("Failed to read levels from directory", e);
            throw new RuntimeException("Failed to read levels", e);
        }
    }
    
    @Override
    public Optional<Level> findById(String id) {
        Path filePath = levelsDir.resolve(id + ".json");
        return readLevelFromFile(filePath);
    }
    
    @Override
    public Level save(Level level) {
        if (level.getId() == null || level.getId().isEmpty()) {
            level.setId(UUID.randomUUID().toString());
        }
        
        level.setUpdatedAt(System.currentTimeMillis());
        if (level.getCreatedAt() == 0) {
            level.setCreatedAt(System.currentTimeMillis());
        }
        
        Path filePath = levelsDir.resolve(level.getId() + ".json");
        
        try {
            objectMapper.writeValue(filePath.toFile(), level);
            logger.info("Saved level: {} to {}", level.getId(), filePath);
            return level;
        } catch (IOException e) {
            logger.error("Failed to save level: {}", level.getId(), e);
            throw new RuntimeException("Failed to save level", e);
        }
    }
    
    @Override
    public void deleteById(String id) {
        Path filePath = levelsDir.resolve(id + ".json");
        
        try {
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                logger.info("Deleted level: {}", id);
            }
        } catch (IOException e) {
            logger.error("Failed to delete level: {}", id, e);
            throw new RuntimeException("Failed to delete level", e);
        }
    }
    
    private Optional<Level> readLevelFromFile(Path filePath) {
        try {
            File file = filePath.toFile();
            if (file.exists()) {
                Level level = objectMapper.readValue(file, Level.class);
                return Optional.of(level);
            }
            return Optional.empty();
        } catch (IOException e) {
            logger.warn("Failed to read level from file: {}", filePath, e);
            return Optional.empty();
        }
    }
}
