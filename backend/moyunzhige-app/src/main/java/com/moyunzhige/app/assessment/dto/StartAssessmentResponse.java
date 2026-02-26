package com.moyunzhige.app.assessment.dto;

import com.moyunzhige.domain.assessment.model.Question;
import com.moyunzhige.domain.assessment.model.TalentResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 开始测评响应
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartAssessmentResponse {
    /**
     * 会话ID
     */
    private String sessionId;
    
    /**
     * 第一题
     */
    private Question firstQuestion;
    
    /**
     * 总题目数
     */
    private int totalQuestions;
    
    /**
     * 已有结果（如果该key之前已完成测评）
     */
    private TalentResult existingResult;
}