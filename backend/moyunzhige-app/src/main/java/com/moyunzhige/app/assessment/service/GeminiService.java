package com.moyunzhige.app.assessment.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moyunzhige.domain.assessment.model.Answer;
import com.moyunzhige.domain.assessment.model.Question;
import com.moyunzhige.domain.assessment.model.TalentDimension;
import com.moyunzhige.domain.assessment.model.TalentResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AI 服务
 * 调用通义千问 API 或 Gemini API 生成题目和分析结果
 */
@Service
public class GeminiService {
    
    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);
    
    @Value("${ai.qwen.api-key}")
    private String qwenApiKey;
    
    @Value("${ai.qwen.model}")
    private String qwenModel;
    
    @Value("${ai.gemini.api-key}")
    private String geminiApiKey;
    
    @Value("${ai.gemini.model}")
    private String geminiModel;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 生成下一道题目
     * 
     * @param questionNumber 题目序号
     * @param previousAnswers 之前的答案
     * @param modelType 模型类型 (qwen 或 gemini)
     * @return 题目
     */
    public Question generateQuestion(int questionNumber, List<Answer> previousAnswers, String modelType) {
        try {
            String prompt = buildQuestionPrompt(questionNumber, previousAnswers);
            String jsonResponse;
            if ("qwen".equals(modelType)) {
                jsonResponse = callQwenApi(prompt);
            } else if ("gemini".equals(modelType)) {
                jsonResponse = callGeminiApiReal(prompt);
            } else {
                throw new IllegalArgumentException("不支持的模型类型: " + modelType);
            }
            return parseQuestionResponse(jsonResponse);
        } catch (Exception e) {
            log.error("生成题目失败: questionNumber={}, modelType={}", questionNumber, modelType, e);
            throw new RuntimeException("生成题目失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 分析测评结果
     * 
     * @param answers 所有答案
     * @param modelType 模型类型 (qwen 或 gemini)
     * @return 测评结果
     */
    public TalentResult analyzeResult(List<Answer> answers, String modelType) {
        try {
            String prompt = buildAnalysisPrompt(answers);
            String jsonResponse;
            if ("qwen".equals(modelType)) {
                jsonResponse = callQwenApi(prompt);
            } else if ("gemini".equals(modelType)) {
                jsonResponse = callGeminiApiReal(prompt);
            } else {
                throw new IllegalArgumentException("不支持的模型类型: " + modelType);
            }
            return parseAnalysisResponse(jsonResponse);
        } catch (Exception e) {
            log.error("分析结果失败, modelType={}", modelType, e);
            throw new RuntimeException("分析结果失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 构建出题 prompt（基于 RIASEC 霍兰德职业兴趣理论）
     */
    private String buildQuestionPrompt(int questionNumber, List<Answer> previousAnswers) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("你是一位资深的职业心理学家和天赋测评专家，精通 RIASEC 霍兰德职业兴趣理论。\n");
        prompt.append("RIASEC 六大维度：\n");
        prompt.append("  - R（现实型 Realistic）：喜欢动手操作、使用工具、户外活动\n");
        prompt.append("  - I（研究型 Investigative）：喜欢思考、分析、探索未知\n");
        prompt.append("  - A（艺术型 Artistic）：喜欢创造、表达、追求美感\n");
        prompt.append("  - S（社会型 Social）：喜欢帮助他人、教导、合作\n");
        prompt.append("  - E（企业型 Enterprising）：喜欢领导、说服、冒险\n");
        prompt.append("  - C（常规型 Conventional）：喜欢组织、规划、注重细节\n\n");
        prompt.append("你正在为用户进行一场深度天赋测评，共10道题。当前是第").append(questionNumber).append("题。\n\n");
        
        if (previousAnswers != null && !previousAnswers.isEmpty()) {
            prompt.append("=== 用户之前的回答 ===\n");
            for (Answer answer : previousAnswers) {
                prompt.append("第").append(answer.getQuestionNumber()).append("题 → ");
                prompt.append(answer.getAnswerContent());
                if (answer.getSelectedOption() != null) {
                    prompt.append("（选项").append(answer.getSelectedOption()).append("）");
                }
                prompt.append("\n");
            }
            prompt.append("======================\n\n");
        }
        
        prompt.append("请生成第").append(questionNumber).append("道题目。\n\n");
        prompt.append("【出题策略】\n");
        prompt.append("第1-3题（选择题 · 兴趣探测）：\n");
        prompt.append("  用真实的生活场景和工作情境来探测用户的 RIASEC 倾向。\n");
        prompt.append("  例如：\"周末你有一整天空闲时间，你最想做什么？\" \"朋友请你帮忙策划一场活动，你最想负责哪个环节？\"\n");
        prompt.append("  每个选项对应不同的 RIASEC 维度，但不要让用户感知到。\n\n");
        prompt.append("第4-6题（选择题 · 情境判断）：\n");
        prompt.append("  根据前面的回答，设计更有针对性的职场情境题。\n");
        prompt.append("  例如：\"团队遇到一个棘手的项目，你的第一反应是？\" \"如果可以选择一个超能力用在工作中，你会选？\"\n");
        prompt.append("  题目要自然有趣，像朋友之间的对话。\n\n");
        prompt.append("第7-8题（简答题 · 深度挖掘）：\n");
        prompt.append("  根据用户已展现的倾向，设计开放性问题深入了解。\n");
        prompt.append("  例如：\"描述一次让你特别有成就感的经历\" \"你理想中的一天是怎样的？\"\n");
        prompt.append("  问题要温暖、有深度，引导用户真实表达。\n\n");
        prompt.append("第9-10题（选择题 · 确认验证）：\n");
        prompt.append("  用轻松的方式验证前面的分析结论。\n");
        prompt.append("  例如：\"以下哪句话最能代表你的人生态度？\" \"如果用一个词形容自己的工作方式，你会选？\"\n\n");
        prompt.append("【重要规则】\n");
        prompt.append("1. 题目必须使用真实、具体的生活/工作场景，禁止出现\"看照片\"\"看图片\"等不自然的表述\n");
        prompt.append("2. 语气亲切自然，像朋友聊天，不要学术化\n");
        prompt.append("3. 选择题必须提供4个选项，每个选项都要具体生动\n");
        prompt.append("4. 根据用户之前的回答动态调整题目方向和深度\n");
        prompt.append("5. 不要重复之前已经问过的类似问题\n\n");
        prompt.append("请严格按以下JSON格式返回（不要包含其他内容）：\n");
        prompt.append("{\"content\": \"题目内容\", \"type\": \"choice或text\", \"options\": [\"选项1\", \"选项2\", \"选项3\", \"选项4\"]}\n");
        prompt.append("如果是简答题（第7-8题），type 为 \"text\"，options 为 null。\n");
        prompt.append("其他题目 type 为 \"choice\"。");
        
        return prompt.toString();
    }
    
    /**
     * 构建分析 prompt（基于 RIASEC 霍兰德职业兴趣理论）
     */
    private String buildAnalysisPrompt(List<Answer> answers) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("你是一位资深的职业心理学家，精通 RIASEC 霍兰德职业兴趣理论和天赋分析。\n");
        prompt.append("以下是用户完成的10道天赋测评题目和答案：\n\n");
        
        for (Answer answer : answers) {
            prompt.append("第").append(answer.getQuestionNumber()).append("题 → ");
            prompt.append(answer.getAnswerContent());
            if (answer.getSelectedOption() != null) {
                prompt.append("（选项").append(answer.getSelectedOption()).append("）");
            }
            prompt.append("\n");
        }
        
        prompt.append("\n请基于 RIASEC 霍兰德职业兴趣理论，结合用户的回答模式，进行深度天赋分析。\n\n");
        prompt.append("【分析框架】\n");
        prompt.append("1. 先识别用户的 RIASEC 三字母代码（如 AIE、SCA 等），作为分析基础\n");
        prompt.append("2. 将 RIASEC 分析映射到以下六大天赋维度进行评分\n");
        prompt.append("3. 综合分析用户的性格特质、做事风格和核心优势\n\n");
        prompt.append("【输出要求】\n");
        prompt.append("1. talentScores: 六大天赋维度分数（0-100），基于用户回答的倾向性打分：\n");
        prompt.append("   - CREATIVITY（创造力）：对应 A 艺术型 + I 研究型的创新面\n");
        prompt.append("   - ANALYSIS（分析力）：对应 I 研究型 + C 常规型的逻辑面\n");
        prompt.append("   - LEADERSHIP（领导力）：对应 E 企业型 + S 社会型的影响面\n");
        prompt.append("   - EXECUTION（执行力）：对应 R 现实型 + C 常规型的行动面\n");
        prompt.append("   - COMMUNICATION（沟通力）：对应 S 社会型 + E 企业型的表达面\n");
        prompt.append("   - LEARNING（学习力）：对应 I 研究型 + A 艺术型的求知面\n");
        prompt.append("   分数要有区分度，不要全部集中在60-80之间，要根据用户回答拉开差距\n\n");
        prompt.append("2. personalityType: 一个富有画面感的性格类型名称\n");
        prompt.append("   不要用\"XX型XX者\"这种模板化命名，要更有个性\n");
        prompt.append("   好的例子：\"星辰航海家\"\"思维建筑师\"\"灵感捕手\"\"破局者\"\n\n");
        prompt.append("3. personalityDescription: 性格描述（150-250字）\n");
        prompt.append("   用第二人称\"你\"来写，像一封写给用户的信\n");
        prompt.append("   要有洞察力，让用户觉得\"说的就是我\"\n");
        prompt.append("   融入具体的行为特征和内心世界的描写\n\n");
        prompt.append("4. workStyle: 做事风格名称（简洁有力，4-6个字）\n");
        prompt.append("   好的例子：\"直觉驱动型\"\"全局掌控型\"\"深度钻研型\"\n\n");
        prompt.append("5. workStyleDescription: 做事风格描述（150-250字）\n");
        prompt.append("   描述用户处理问题的方式、决策习惯、协作模式\n");
        prompt.append("   要具体，用场景化的语言\n\n");
        prompt.append("6. strengths: 擅长的事情列表，8-10件\n");
        prompt.append("   每一件都要具体、有画面感、有温度\n");
        prompt.append("   好的例子：\n");
        prompt.append("   - \"在一片混乱中迅速理清头绪，找到那根最关键的线头\"\n");
        prompt.append("   - \"用三言两语就能让复杂的事情变得人人都懂\"\n");
        prompt.append("   - \"在别人还在犹豫时，你已经迈出了第一步\"\n");
        prompt.append("   坏的例子（禁止）：\"善于沟通\"\"有创造力\"\"执行力强\"\n\n");
        prompt.append("7. summary: 综合总结（250-400字）\n");
        prompt.append("   分3段：\n");
        prompt.append("   第1段：用一个生动的比喻开头，概括用户的核心特质\n");
        prompt.append("   第2段：分析用户的独特优势组合，以及这种组合带来的竞争力\n");
        prompt.append("   第3段：给出发展建议和鼓励，语气温暖有力量\n");
        prompt.append("   整体文风要高级、有洞察力，避免鸡汤和套话\n\n");
        prompt.append("请严格按以下JSON格式返回（不要包含其他内容）：\n");
        prompt.append("{\n");
        prompt.append("  \"talentScores\": {\"CREATIVITY\": 85, \"ANALYSIS\": 70, \"LEADERSHIP\": 60, \"EXECUTION\": 75, \"COMMUNICATION\": 80, \"LEARNING\": 90},\n");
        prompt.append("  \"personalityType\": \"...\",\n");
        prompt.append("  \"personalityDescription\": \"...\",\n");
        prompt.append("  \"workStyle\": \"...\",\n");
        prompt.append("  \"workStyleDescription\": \"...\",\n");
        prompt.append("  \"strengths\": [\"...\", \"...\"],\n");
        prompt.append("  \"summary\": \"...\"\n");
        prompt.append("}");
        
        return prompt.toString();
    }
    
    /**
     * 调用通义千问 API（OpenAI 兼容模式）
     */
    private String callQwenApi(String prompt) {
        String url = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", qwenModel);
        
        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", "你是一个专业的天赋测评专家。请严格按照用户要求的JSON格式返回结果，不要包含任何其他内容，不要使用markdown代码块包裹。");
        messages.add(systemMessage);
        
        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);
        messages.add(userMessage);
        
        requestBody.put("messages", messages);
        requestBody.put("temperature", 0.8);
        
        Map<String, Object> responseFormat = new HashMap<>();
        responseFormat.put("type", "json_object");
        requestBody.put("response_format", responseFormat);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(qwenApiKey);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        log.info("调用通义千问 API, model={}", qwenModel);
        String response = restTemplate.postForObject(url, entity, String.class);
        log.info("通义千问 API 响应: {}", response);
        
        try {
            JsonNode responseJson = objectMapper.readTree(response);
            String content = responseJson
                    .path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();
            
            // 去除可能的 markdown 代码块包裹
            if (content.startsWith("```json")) {
                content = content.substring(7);
            } else if (content.startsWith("```")) {
                content = content.substring(3);
            }
            if (content.endsWith("```")) {
                content = content.substring(0, content.length() - 3);
            }
            return content.trim();
        } catch (Exception e) {
            log.error("解析通义千问 API 响应失败, response={}", response, e);
            throw new RuntimeException("解析通义千问 API 响应失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 调用 Gemini 原生 API
     */
    private String callGeminiApiReal(String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel + ":generateContent?key=" + geminiApiKey;
        
        Map<String, Object> requestBody = new HashMap<>();
        
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        
        List<Map<String, String>> parts = new ArrayList<>();
        Map<String, String> part = new HashMap<>();
        part.put("text", prompt);
        parts.add(part);
        
        content.put("parts", parts);
        contents.add(content);
        
        requestBody.put("contents", contents);
        requestBody.put("generationConfig", Map.of(
            "temperature", 0.8,
            "responseMimeType", "application/json"
        ));
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        log.info("调用 Gemini API, model={}", geminiModel);
        String response = restTemplate.postForObject(url, entity, String.class);
        log.info("Gemini API 响应: {}", response);
        
        try {
            JsonNode responseJson = objectMapper.readTree(response);
            String contentText = responseJson
                    .path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();
            
            // 去除可能的 markdown 代码块包裹
            if (contentText.startsWith("```json")) {
                contentText = contentText.substring(7);
            } else if (contentText.startsWith("```")) {
                contentText = contentText.substring(3);
            }
            if (contentText.endsWith("```")) {
                contentText = contentText.substring(0, contentText.length() - 3);
            }
            return contentText.trim();
        } catch (Exception e) {
            log.error("解析 Gemini API 响应失败, response={}", response, e);
            throw new RuntimeException("解析 Gemini API 响应失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 解析题目响应
     */
    private Question parseQuestionResponse(String jsonResponse) throws Exception {
        JsonNode json = objectMapper.readTree(jsonResponse);
        
        String content = json.get("content").asText();
        String type = json.get("type").asText();
        List<String> options = null;
        
        if (json.has("options") && !json.get("options").isNull()) {
            options = new ArrayList<>();
            for (JsonNode option : json.get("options")) {
                options.add(option.asText());
            }
        }
        
        return Question.builder()
                .id("AI-" + System.currentTimeMillis())
                .questionNumber(0)
                .content(content)
                .type(type)
                .options(options)
                .build();
    }
    
    /**
     * 解析分析响应
     */
    private TalentResult parseAnalysisResponse(String jsonResponse) throws Exception {
        JsonNode json = objectMapper.readTree(jsonResponse);
        
        Map<TalentDimension, Integer> talentScores = new HashMap<>();
        JsonNode scoresNode = json.get("talentScores");
        talentScores.put(TalentDimension.CREATIVITY, scoresNode.get("CREATIVITY").asInt());
        talentScores.put(TalentDimension.ANALYSIS, scoresNode.get("ANALYSIS").asInt());
        talentScores.put(TalentDimension.LEADERSHIP, scoresNode.get("LEADERSHIP").asInt());
        talentScores.put(TalentDimension.EXECUTION, scoresNode.get("EXECUTION").asInt());
        talentScores.put(TalentDimension.COMMUNICATION, scoresNode.get("COMMUNICATION").asInt());
        talentScores.put(TalentDimension.LEARNING, scoresNode.get("LEARNING").asInt());
        
        String personalityType = json.get("personalityType").asText();
        String personalityDescription = json.get("personalityDescription").asText();
        String workStyle = json.get("workStyle").asText();
        String workStyleDescription = json.get("workStyleDescription").asText();
        
        List<String> strengths = new ArrayList<>();
        for (JsonNode strength : json.get("strengths")) {
            strengths.add(strength.asText());
        }
        
        String summary = json.get("summary").asText();
        
        return TalentResult.builder()
                .talentScores(talentScores)
                .personalityType(personalityType)
                .personalityDescription(personalityDescription)
                .workStyle(workStyle)
                .workStyleDescription(workStyleDescription)
                .strengths(strengths)
                .summary(summary)
                .build();
    }
}
