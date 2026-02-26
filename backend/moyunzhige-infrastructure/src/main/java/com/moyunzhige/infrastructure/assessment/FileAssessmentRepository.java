package com.moyunzhige.infrastructure.assessment;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.moyunzhige.domain.assessment.gateway.AssessmentRepository;
import com.moyunzhige.domain.assessment.model.AssessmentSession;
import com.moyunzhige.domain.assessment.model.TalentResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 文件存储测评仓储实现
 * 使用文件系统存储测评会话和结果
 */
@Repository
public class FileAssessmentRepository implements AssessmentRepository {
    
    private static final Logger log = LoggerFactory.getLogger(FileAssessmentRepository.class);
    
    private static final String DATA_DIR = "data";
    private static final String SESSION_FILE = "session.json";
    private static final String RESULT_FILE = "result.json";
    
    private final ObjectMapper objectMapper;
    
    public FileAssessmentRepository() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        this.objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }
    
    @Override
    public void save(AssessmentSession session) {
        try {
            String key = session.getKey();
            Path keyDir = Paths.get(DATA_DIR, key);
            
            Files.createDirectories(keyDir);
            
            Path sessionFilePath = keyDir.resolve(SESSION_FILE);
            objectMapper.writeValue(sessionFilePath.toFile(), session);
            
            if (session.isCompleted() && session.getResult() != null) {
                Path resultFilePath = keyDir.resolve(RESULT_FILE);
                objectMapper.writeValue(resultFilePath.toFile(), session.getResult());
            }
            
            log.info("保存会话成功: key={}", key);
        } catch (IOException e) {
            log.error("保存会话失败: key={}", session.getKey(), e);
            throw new RuntimeException("保存会话失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public Optional<AssessmentSession> findById(String sessionId) {
        try {
            Path sessionFilePath = Paths.get(DATA_DIR, sessionId, SESSION_FILE);
            File sessionFile = sessionFilePath.toFile();
            
            if (!sessionFile.exists()) {
                return Optional.empty();
            }
            
            AssessmentSession session = objectMapper.readValue(sessionFile, AssessmentSession.class);
            return Optional.of(session);
        } catch (IOException e) {
            log.error("读取会话失败: sessionId={}", sessionId, e);
            return Optional.empty();
        }
    }
    
    @Override
    public Optional<AssessmentSession> findByKey(String key) {
        try {
            Path resultFilePath = Paths.get(DATA_DIR, key, RESULT_FILE);
            File resultFile = resultFilePath.toFile();
            
            if (resultFile.exists()) {
                TalentResult result = objectMapper.readValue(resultFile, TalentResult.class);
                AssessmentSession session = AssessmentSession.builder()
                        .sessionId(key)
                        .key(key)
                        .completed(true)
                        .result(result)
                        .createdAt(LocalDateTime.now())
                        .build();
                return Optional.of(session);
            }
            
            Path sessionFilePath = Paths.get(DATA_DIR, key, SESSION_FILE);
            File sessionFile = sessionFilePath.toFile();
            
            if (!sessionFile.exists()) {
                return Optional.empty();
            }
            
            AssessmentSession session = objectMapper.readValue(sessionFile, AssessmentSession.class);
            return Optional.of(session);
        } catch (IOException e) {
            log.error("读取会话失败: key={}", key, e);
            return Optional.empty();
        }
    }
}
