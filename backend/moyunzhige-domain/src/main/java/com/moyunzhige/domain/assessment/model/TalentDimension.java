package com.moyunzhige.domain.assessment.model;

/**
 * 天赋维度枚举
 */
public enum TalentDimension {
    /**
     * 创造力 - 想象力丰富，善于创新和产生新想法
     */
    CREATIVITY("创造力"),
    
    /**
     * 分析力 - 逻辑思维强，善于拆解问题和数据分析
     */
    ANALYSIS("分析力"),
    
    /**
     * 领导力 - 影响力强，善于带领团队和决策
     */
    LEADERSHIP("领导力"),
    
    /**
     * 执行力 - 行动力强，善于落地和完成任务
     */
    EXECUTION("执行力"),
    
    /**
     * 沟通力 - 表达能力强，善于协调人际关系
     */
    COMMUNICATION("沟通力"),
    
    /**
     * 学习力 - 求知欲强，善于快速掌握新知识
     */
    LEARNING("学习力");
    
    private final String label;
    
    TalentDimension(String label) {
        this.label = label;
    }
    
    public String getLabel() {
        return label;
    }
}
