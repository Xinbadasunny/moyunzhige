package com.moyunzhige.app.dto;

import lombok.Data;
import com.moyunzhige.domain.model.Beat;

@Data
public class BeatDTO {
    private Double time;
    private String type;
    private Double duration;
    private String enemyType;

    public static BeatDTO fromDomain(Beat beat) {
        if (beat == null) {
            return null;
        }
        BeatDTO dto = new BeatDTO();
        dto.setTime(beat.getTime());
        dto.setType(beat.getType());
        dto.setDuration(beat.getDuration());
        dto.setEnemyType(beat.getEnemyType());
        return dto;
    }

    public Beat toDomain() {
        Beat beat = new Beat();
        beat.setTime(this.time);
        beat.setType(this.type);
        beat.setDuration(this.duration);
        beat.setEnemyType(this.enemyType);
        return beat;
    }
}
