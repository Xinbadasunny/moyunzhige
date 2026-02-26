package com.moyunzhige.app.assessment.service;

import com.moyunzhige.app.assessment.dto.StartAssessmentResponse;
import com.moyunzhige.app.assessment.dto.SubmitAnswerRequest;
import com.moyunzhige.app.assessment.dto.SubmitAnswerResponse;
import com.moyunzhige.domain.assessment.model.Answer;
import com.moyunzhige.domain.assessment.model.AssessmentSession;
import com.moyunzhige.domain.assessment.model.Question;
import com.moyunzhige.domain.assessment.model.TalentResult;
import com.moyunzhige.domain.assessment.gateway.AssessmentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;

/**
 * 测评服务
 * 协调 GeminiService 和仓储，提供完整的测评流程
 */
@Service
@RequiredArgsConstructor
public class AssessmentService {
    
    private static final Logger log = LoggerFactory.getLogger(AssessmentService.class);
    
    private static final int TOTAL_QUESTIONS = 35;
    private static final Set<String> VALID_KEYS = Set.of("123", "456");
    
    private final GeminiService geminiService;
    private final AssessmentRepository assessmentRepository;
    
    /**
     * 开始测评
     * 验证 key，检查是否已有结果，如果没有则创建新会话并生成第一题
     * 
     * @param key 访问密钥
     * @param modelType 模型类型 (qwen 或 gemini)
     * @return 开始测评响应
     */
    public StartAssessmentResponse startAssessment(String key, String modelType) {
        log.info("开始测评: key={}, modelType={}", key, modelType);
        
        if (!VALID_KEYS.contains(key)) {
            throw new IllegalArgumentException("非法的访问密钥: " + key);
        }
        
        Optional<AssessmentSession> existingSession = assessmentRepository.findByKey(key);
        if (existingSession.isPresent() && existingSession.get().isCompleted()) {
            log.info("已有完成结果: key={}", key);
            return StartAssessmentResponse.builder()
                    .existingResult(existingSession.get().getResult())
                    .build();
        }
        
        AssessmentSession session = AssessmentSession.builder()
                .sessionId(key)
                .key(key)
                .modelType(modelType)
                .currentQuestionNumber(1)
                .completed(false)
                .build();
        
        Question firstQuestion = geminiService.generateQuestion(1, session.getAnswers(), modelType);
        
        assessmentRepository.save(session);
        
        return StartAssessmentResponse.builder()
                .sessionId(key)
                .firstQuestion(firstQuestion)
                .totalQuestions(TOTAL_QUESTIONS)
                .build();
    }
    
    /**
     * 提交答案
     * 保存答案，生成下一题或返回测评结果
     * 
     * @param sessionId 会话ID
     * @param request 提交答案请求
     * @return 提交答案响应
     */
    public SubmitAnswerResponse submitAnswer(String sessionId, SubmitAnswerRequest request) {
        log.info("提交答案: sessionId={}", sessionId);
        
        AssessmentSession session = assessmentRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("会话不存在: " + sessionId));
        
        if (session.isCompleted()) {
            throw new IllegalStateException("测评已完成，无法继续提交答案");
        }
        
        Answer answer = Answer.builder()
                .questionId(sessionId + "-" + session.getCurrentQuestionNumber())
                .questionNumber(session.getCurrentQuestionNumber())
                .answerContent(request.getAnswerContent())
                .selectedOption(request.getSelectedOption())
                .build();
        
        session.getAnswers().add(answer);
        
        if (session.getCurrentQuestionNumber() >= TOTAL_QUESTIONS) {
            session.setCompleted(true);
            TalentResult result = geminiService.analyzeResult(session.getAnswers(), session.getModelType());
            session.setResult(result);
            
            assessmentRepository.save(session);
            
            return SubmitAnswerResponse.builder()
                    .completed(true)
                    .nextQuestion(null)
                    .currentNumber(TOTAL_QUESTIONS)
                    .totalQuestions(TOTAL_QUESTIONS)
                    .result(result)
                    .build();
        } else {
            int nextQuestionNumber = session.getCurrentQuestionNumber() + 1;
            session.setCurrentQuestionNumber(nextQuestionNumber);
            
            Question nextQuestion = geminiService.generateQuestion(nextQuestionNumber, session.getAnswers(), session.getModelType());
            
            assessmentRepository.save(session);
            
            return SubmitAnswerResponse.builder()
                    .completed(false)
                    .nextQuestion(nextQuestion)
                    .currentNumber(nextQuestionNumber)
                    .totalQuestions(TOTAL_QUESTIONS)
                    .result(null)
                    .build();
        }
    }
    
    /**
     * 获取测评结果
     * 
     * @param sessionId 会话ID
     * @return 测评结果
     */
    public TalentResult getResult(String sessionId) {
        AssessmentSession session = assessmentRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("会话不存在: " + sessionId));
        
        if (!session.isCompleted()) {
            throw new IllegalStateException("测评尚未完成");
        }
        
        return session.getResult();
    }
}