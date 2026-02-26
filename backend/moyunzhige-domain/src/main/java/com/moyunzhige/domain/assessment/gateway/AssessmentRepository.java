package com.moyunzhige.domain.assessment.gateway;

import com.moyunzhige.domain.assessment.model.AssessmentSession;

import java.util.Optional;

/**
 * 测评仓储接口
 */
public interface AssessmentRepository {
    
    /**
     * 保存测评会话
     * 
     * @param session 测评会话
     */
    void save(AssessmentSession session);
    
    /**
     * 根据会话ID查找测评会话
     * 
     * @param sessionId 会话ID
     * @return 测评会话
     */
    Optional<AssessmentSession> findById(String sessionId);
    
    /**
     * 根据访问密钥查找测评会话
     * 
     * @param key 访问密钥
     * @return 测评会话
     */
    Optional<AssessmentSession> findByKey(String key);
}