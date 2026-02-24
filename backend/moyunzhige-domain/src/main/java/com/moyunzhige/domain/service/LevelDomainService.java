package com.moyunzhige.domain.service;

import com.moyunzhige.domain.gateway.LevelGateway;
import com.moyunzhige.domain.model.Level;

import java.util.List;
import java.util.Optional;

public class LevelDomainService {
    private final LevelGateway levelGateway;

    public LevelDomainService(LevelGateway levelGateway) {
        this.levelGateway = levelGateway;
    }

    public List<Level> getAllLevels() {
        return levelGateway.findAll();
    }

    public Optional<Level> getLevelById(String id) {
        return levelGateway.findById(id);
    }

    public Level createLevel(Level level) {
        level.setCreatedAt(System.currentTimeMillis());
        level.setUpdatedAt(System.currentTimeMillis());
        return levelGateway.save(level);
    }

    public void deleteLevel(String id) {
        levelGateway.deleteById(id);
    }
}
