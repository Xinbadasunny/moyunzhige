package com.moyunzhige.domain.assessment.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 职业航向模型
 * 包含航向名称、通用建议和针对不同身份的适配建议
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareerPath {
    /**
     * 航向名称（如：精英职场之路、创新事业之路、超级个体之路）
     */
    private String name;

    /**
     * 通用建议
     */
    private String generalAdvice;

    /**
     * 身份适配建议，key 为身份类型（如：学生、职场人、宝妈/宝爸），value 为对应建议
     */
    private Map<String, String> identityAdvice;
}
