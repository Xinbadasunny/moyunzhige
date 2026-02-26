package com.moyunzhige.domain.assessment.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 答案模型
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Answer {
    /**
     * 题目ID
     */
    private String questionId;
    
    /**
     * 题目序号
     */
    private int questionNumber;
    
    /**
     * 答案内容（简答题使用）
     */
    private String answerContent;
    
    /**
     * 选择的选项（选择题使用）
     */
    private String selectedOption;
}
