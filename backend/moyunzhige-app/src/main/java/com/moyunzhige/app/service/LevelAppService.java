package com.moyunzhige.app.service;

import com.moyunzhige.app.dto.LevelDTO;
import com.moyunzhige.domain.model.Level;
import com.moyunzhige.domain.service.LevelDomainService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LevelAppService {

    private final LevelDomainService levelDomainService;

    public LevelAppService(LevelDomainService levelDomainService) {
        this.levelDomainService = levelDomainService;
    }

    public List<LevelDTO> getAllLevels() {
        List<Level> levels = levelDomainService.getAllLevels();
        return levels.stream()
                .map(LevelDTO::fromDomain)
                .collect(Collectors.toList());
    }

    public LevelDTO getLevelById(String id) {
        Optional<Level> levelOptional = levelDomainService.getLevelById(id);
        return levelOptional.map(LevelDTO::fromDomain).orElse(null);
    }

    public LevelDTO createLevel(LevelDTO dto) {
        Level level = dto.toDomain();
        Level savedLevel = levelDomainService.createLevel(level);
        return LevelDTO.fromDomain(savedLevel);
    }

    public void deleteLevel(String id) {
        levelDomainService.deleteLevel(id);
    }
}
