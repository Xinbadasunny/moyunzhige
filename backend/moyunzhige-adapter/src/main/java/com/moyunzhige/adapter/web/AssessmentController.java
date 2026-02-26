package com.moyunzhige.adapter.web;

import com.moyunzhige.app.assessment.dto.StartAssessmentResponse;
import com.moyunzhige.app.assessment.dto.SubmitAnswerRequest;
import com.moyunzhige.app.assessment.dto.SubmitAnswerResponse;
import com.moyunzhige.app.assessment.service.AssessmentService;
import com.moyunzhige.domain.assessment.model.TalentResult;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 测评控制器
 * 提供测评相关的 REST API
 */
@RestController
@RequestMapping("/api/assessment")
@RequiredArgsConstructor
public class AssessmentController {
    
    private final AssessmentService assessmentService;
    
    /**
     * 开始测评
     * POST /api/assessment/start?key=xxx&modelType=qwen
     * 
     * @param key 访问密钥
     * @param modelType 模型类型 (qwen 或 gemini)
     * @return 开始测评响应
     */
    @PostMapping("/start")
    public StartAssessmentResponse startAssessment(@RequestParam String key, @RequestParam String modelType) {
        return assessmentService.startAssessment(key, modelType);
    }
    
    /**
     * 提交答案
     * POST /api/assessment/{sessionId}/answer
     * 
     * @param sessionId 会话ID
     * @param request 提交答案请求
     * @return 提交答案响应
     */
    @PostMapping("/{sessionId}/answer")
    public SubmitAnswerResponse submitAnswer(
            @PathVariable String sessionId,
            @RequestBody SubmitAnswerRequest request) {
        return assessmentService.submitAnswer(sessionId, request);
    }
    
    /**
     * 获取测评结果
     * GET /api/assessment/{sessionId}/result
     * 
     * @param sessionId 会话ID
     * @return 测评结果
     */
    @GetMapping("/{sessionId}/result")
    public TalentResult getResult(@PathVariable String sessionId) {
        return assessmentService.getResult(sessionId);
    }
}