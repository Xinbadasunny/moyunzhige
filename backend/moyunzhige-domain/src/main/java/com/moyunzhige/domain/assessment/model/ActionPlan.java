package com.moyunzhige.domain.assessment.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 专属行动计划模型
 * 根据用户身份提供个性化的下一步行动建议
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActionPlan {
    /**
     * 用户身份标签（如：在校学生、职场人士、宝妈/宝爸）
     */
    private String identityLabel;

    /**
     * 行动步骤列表
     */
    private List<ActionStep> steps;

    /**
     * 结语鼓励
     */
    private String closingMessage;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActionStep {
        /**
         * 步骤标题（如：关键一步、资源利用）
         */
        private String title;

        /**
         * 步骤详细内容
         */
        private String content;
    }
}
