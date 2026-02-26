package com.moyunzhige.app.assessment.dto;

import com.moyunzhige.domain.assessment.model.Question;
import com.moyunzhige.domain.assessment.model.TalentResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 提交答案响应
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitAnswerResponse {
    /**
     * 是否完成所有题目
     */
    private boolean completed;
    
    /**
     * 下一题（如果未完成）
     */
    private Question nextQuestion;
    
    /**
     * 当前题目序号
     */
    private int currentNumber;
    
    /**
     * 总题目数
     */
    private int totalQuestions;
    
    /**
     * 测评结果（如果已完成）
     */
    private TalentResult result;
}
