package com.moyunzhige.domain.assessment.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 测评会话模型
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentSession {
    /**
     * 会话ID
     */
    private String sessionId;
    
    /**
     * 访问密钥
     */
    private String key;
    
    /**
     * 模型类型 (qwen 或 gemini)
     */
    private String modelType;
    
    /**
     * 答案列表
     */
    @Builder.Default
    private List<Answer> answers = new ArrayList<>();
    
    /**
     * 当前题目序号
     */
    @Builder.Default
    private int currentQuestionNumber = 1;
    
    /**
     * 是否已完成
     */
    @Builder.Default
    private boolean completed = false;
    
    /**
     * 测评结果
     */
    private TalentResult result;
    
    /**
     * 创建时间
     */
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}