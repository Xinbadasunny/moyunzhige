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
     * 核心画像名称（如"直觉敏锐的架构师"、"星辰航海家"等）
     */
    private String personalityType;

    /**
     * 核心画像详细描述
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
     * 天赋引擎（2-3个最突出的天赋特质和驱动力）
     */
    private List<String> strengths;

    /**
     * 综合总结
     */
    private String summary;

    /**
     * 三大职业航向（精英职场之路、创新事业之路、超级个体之路）
     */
    private List<CareerPath> careerPaths;

    /**
     * 专属下一步行动计划（根据用户身份细化）
     */
    private ActionPlan actionPlan;
}
