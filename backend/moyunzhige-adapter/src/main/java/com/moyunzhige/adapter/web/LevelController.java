package com.moyunzhige.adapter.web;

import com.moyunzhige.app.dto.LevelDTO;
import com.moyunzhige.app.service.LevelAppService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/levels")
@CrossOrigin(origins = "*")
public class LevelController {

    private final LevelAppService levelAppService;

    public LevelController(LevelAppService levelAppService) {
        this.levelAppService = levelAppService;
    }

    @GetMapping
    public ResponseEntity<List<LevelDTO>> getAllLevels() {
        List<LevelDTO> levels = levelAppService.getAllLevels();
        return ResponseEntity.ok(levels);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LevelDTO> getLevelById(@PathVariable String id) {
        LevelDTO level = levelAppService.getLevelById(id);
        return ResponseEntity.ok(level);
    }

    @PostMapping
    public ResponseEntity<LevelDTO> createLevel(@RequestBody LevelDTO levelDTO) {
        LevelDTO createdLevel = levelAppService.createLevel(levelDTO);
        return ResponseEntity.ok(createdLevel);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLevel(@PathVariable String id) {
        levelAppService.deleteLevel(id);
        return ResponseEntity.noContent().build();
    }
}
