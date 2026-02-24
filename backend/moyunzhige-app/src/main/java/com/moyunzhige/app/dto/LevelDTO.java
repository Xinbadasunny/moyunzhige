package com.moyunzhige.app.dto;

import lombok.Data;
import java.util.List;
import java.util.stream.Collectors;
import com.moyunzhige.domain.model.Level;

@Data
public class LevelDTO {
    private String id;
    private String name;
    private String description;
    private String scene;
    private Integer bpm;
    private Integer difficulty;
    private List<BeatDTO> beats;
    private Long createdAt;
    private Long updatedAt;

    public static LevelDTO fromDomain(Level level) {
        if (level == null) {
            return null;
        }
        LevelDTO dto = new LevelDTO();
        dto.setId(level.getId());
        dto.setName(level.getName());
        dto.setDescription(level.getDescription());
        dto.setScene(level.getScene());
        dto.setBpm(level.getBpm());
        dto.setDifficulty(level.getDifficulty());
        if (level.getBeats() != null) {
            dto.setBeats(level.getBeats().stream()
                .map(BeatDTO::fromDomain)
                .collect(Collectors.toList()));
        }
        dto.setCreatedAt(level.getCreatedAt());
        dto.setUpdatedAt(level.getUpdatedAt());
        return dto;
    }

    public Level toDomain() {
        Level level = new Level();
        level.setId(this.id);
        level.setName(this.name);
        level.setDescription(this.description);
        level.setScene(this.scene);
        if (this.bpm != null) {
            level.setBpm(this.bpm);
        }
        if (this.difficulty != null) {
            level.setDifficulty(this.difficulty);
        }
        if (this.beats != null) {
            level.setBeats(this.beats.stream()
                .map(BeatDTO::toDomain)
                .collect(Collectors.toList()));
        }
        if (this.createdAt != null) {
            level.setCreatedAt(this.createdAt);
        }
        if (this.updatedAt != null) {
            level.setUpdatedAt(this.updatedAt);
        }
        return level;
    }
}
