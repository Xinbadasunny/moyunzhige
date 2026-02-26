package com.moyunzhige.app.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 提交答案请求
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitAnswerRequest {
    /**
     * 答案内容（简答题使用）
     */
    private String answerContent;
    
    /**
     * 选择的选项（选择题使用）
     */
    private String selectedOption;
}
