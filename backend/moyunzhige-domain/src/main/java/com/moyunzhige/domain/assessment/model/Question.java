package com.moyunzhige.domain.assessment.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 题目模型
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Question {
    /**
     * 题目ID
     */
    private String id;
    
    /**
     * 题目内容
     */
    private String content;
    
    /**
     * 题目类型：choice（选择题）或 text（简答题）
     */
    private String type;
    
    /**
     * 选项列表（选择题使用）
     */
    private List<String> options;
    
    /**
     * 题目序号（1-10）
     */
    private int questionNumber;
}
