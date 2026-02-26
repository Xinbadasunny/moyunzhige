package com.moyunzhige.domain.assessment.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * 天赋测评结果模型
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TalentResult {
    /**
     * 六大维度天赋分数（0-100）
     */
    private Map<TalentDimension, Integer> talentScores;
    
    /**
     * 性格类型（如"探索型创造者"、"稳健型执行者"等）
     */
    private String personalityType;
    
    /**
     * 性格类型详细描述
     */
    private String personalityDescription;
    
    /**
     * 做事风格
     */
    private String workStyle;
    
    /**
     * 做事风格详细描述
     */
    private String workStyleDescription;
    
    /**
     * 擅长的事情（7-10件具体有画面感的描述）
     */
    private List<String> strengths;
    
    /**
     * 总结文本
     */
    private String summary;
}
