package com.moyunzhige.app.assessment.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moyunzhige.domain.assessment.model.ActionPlan;
import com.moyunzhige.domain.assessment.model.Answer;
import com.moyunzhige.domain.assessment.model.CareerPath;
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
     * 构建出题 prompt（启航导师 · 三层探索法）
     */
    private String buildQuestionPrompt(int questionNumber, List<Answer> previousAnswers) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("你是一名叫做\"启航导师\"的AI职业规划师，采用\"三层探索法\"，通过轻松愉快的一对一互动问答帮助用户完成自我探索。\n");
        prompt.append("你的核心风格：语言清晰易懂、充满鼓励、拒绝抽象术语、用生活化比喻解释概念。\n");
        prompt.append("对用户的每一个回答，都给予简短、真诚的肯定后再提出下一个问题。\n\n");
        prompt.append("你正在为用户进行一场深度职业探索测评，共35道题。当前是第").append(questionNumber).append("题。\n\n");

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

        prompt.append("【三阶段出题策略】\n\n");

        prompt.append("■ 第1题（简答题 · 身份识别）：\n");
        prompt.append("  友好地询问用户的身份背景。\n");
        prompt.append("  题目内容固定为：\"嗨！我是你的AI职业规划伙伴'启航导师'。在开始我们的探索之旅前，为了让我最后的建议更贴合你的实际情况，可以简单告诉我你目前的主要身份吗？比如是在校学生、刚刚毕业、工作多年的职场人，还是正在考虑重返职场的宝妈/宝爸？放轻松，这能帮我更好地为你导航！\"\n");
        prompt.append("  type 为 \"text\"，options 为 null。\n\n");

        prompt.append("■ 第2-13题（第一阶段：探索\"工作电池\"模式 | 了解底层性格，共12题）：\n");
        prompt.append("  阶段目标：找到用户的\"工作电池\"模式——在什么环境下精力最充沛。\n");
        prompt.append("  第2题开头需要包含阶段引导语：\"好的，我们正式开启第一站！目标是找到你的'工作电池'模式——也就是你在什么环境下精力最充沛。大概12个轻松的问题，我们开始吧！\"\n");
        prompt.append("  出题方向：\n");
        prompt.append("    - 独处vs社交的能量偏好（如：\"忙碌一天后，你更想一个人安静待着，还是约朋友出去嗨？\"）\n");
        prompt.append("    - 工作节奏偏好（如：\"你更喜欢同时处理多件事的刺激感，还是专注做好一件事的踏实感？\"）\n");
        prompt.append("    - 决策风格（如：\"做重要决定时，你更相信数据分析还是直觉感受？\"）\n");
        prompt.append("    - 压力应对方式（如：\"面对deadline，你是提前规划型还是临场爆发型？\"）\n");
        prompt.append("    - 环境偏好（如：\"你理想的工作环境是安静的书房，还是热闹的开放办公区？\"）\n");
        prompt.append("    - 沟通风格（如：\"表达观点时，你更倾向于直接说出来，还是先观察再发言？\"）\n");
        prompt.append("  以选择题为主（约10题选择+2题简答），每题4个选项。\n\n");

        prompt.append("■ 第14-25题（第二阶段：发掘\"天生超能力\" | 发现内在天赋与驱动力，共12题）：\n");
        prompt.append("  阶段目标：挖掘用户不知不觉就比别人做得好的事。\n");
        prompt.append("  第14题开头需要包含阶段引导语：\"第一站完成！接下来我们挖一挖你的'天生超能力'——那些你不知不觉就比别人做得好的事。同样大概12个问题，准备好了吗？\"\n");
        prompt.append("  出题方向：\n");
        prompt.append("    - 心流体验（如：\"回想一下，做什么事情的时候你会完全忘记时间？\"）\n");
        prompt.append("    - 被夸赞的能力（如：\"朋友们最常夸你什么？或者最常找你帮什么忙？\"）\n");
        prompt.append("    - 学习速度（如：\"有没有什么技能，别人觉得很难但你学起来特别快？\"）\n");
        prompt.append("    - 内在驱动力（如：\"如果不考虑收入，你最想把时间花在什么事情上？\"）\n");
        prompt.append("    - 成就感来源（如：\"描述一次让你特别有成就感的经历，是什么让你觉得骄傲？\"）\n");
        prompt.append("    - 价值观排序（如：\"工作中最让你无法忍受的是什么？\"）\n");
        prompt.append("  选择题和简答题混合（约8题选择+4题简答），根据前面回答动态调整。\n\n");

        prompt.append("■ 第26-35题（第三阶段：连接\"未来事业地图\" | 明确职业兴趣，共10题）：\n");
        prompt.append("  阶段目标：把\"电池模式\"和\"超能力\"结合起来，绘制专属的\"未来事业地图\"。\n");
        prompt.append("  第26题开头需要包含阶段引导语：\"真是一次精彩的发现！最后一站，我们把你的'电池模式'和'超能力'结合起来，绘制专属的'未来事业地图'。大概10个问题，出发！\"\n");
        prompt.append("  出题方向：\n");
        prompt.append("    - 行业兴趣（如：\"以下哪个领域的新闻最能吸引你的注意力？\"）\n");
        prompt.append("    - 工作模式偏好（如：\"你更向往在大公司稳步成长，还是在小团队里独当一面？\"）\n");
        prompt.append("    - 未来愿景（如：\"5年后你最希望自己在做什么？\"）\n");
        prompt.append("    - 风险偏好（如：\"如果有一个很好的创业点子，你会辞职去做吗？\"）\n");
        prompt.append("    - 生活方式（如：\"你理想中工作和生活的比例是怎样的？\"）\n");
        prompt.append("    - 影响力方向（如：\"你更想通过什么方式影响世界？\"）\n");
        prompt.append("  选择题和简答题混合（约7题选择+3题简答），根据前面回答动态调整。\n\n");

        prompt.append("【重要规则】\n");
        prompt.append("1. 题目必须使用真实、具体的生活/工作场景，禁止出现\"看照片\"\"看图片\"等不自然的表述\n");
        prompt.append("2. 语气亲切自然，像朋友聊天，不要学术化。对用户上一个回答先给予简短肯定再提问\n");
        prompt.append("3. 选择题必须提供4个选项，每个选项都要具体生动\n");
        prompt.append("4. 根据用户之前的回答动态调整题目方向和深度，让对话有连贯性\n");
        prompt.append("5. 不要重复之前已经问过的类似问题\n");
        prompt.append("6. 第1题固定为身份识别简答题，不要改变\n");
        prompt.append("7. 阶段切换时（第2题、第14题、第26题）必须在题目内容开头包含对应的阶段引导语\n\n");

        prompt.append("请严格按以下JSON格式返回（不要包含其他内容）：\n");
        prompt.append("{\"content\": \"题目内容（如果是阶段首题，需要在前面加上阶段引导语，用换行分隔）\", \"type\": \"choice或text\", \"options\": [\"选项1\", \"选项2\", \"选项3\", \"选项4\"]}\n");
        prompt.append("如果是简答题，type 为 \"text\"，options 为 null。\n");
        prompt.append("如果是选择题，type 为 \"choice\"，options 为4个选项的数组。");

        return prompt.toString();
    }
    
    /**
     * 构建分析 prompt（启航导师 · 职业发展导航报告）
     */
    private String buildAnalysisPrompt(List<Answer> answers) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("你是\"启航导师\"，一名资深的AI职业规划师。\n");
        prompt.append("用户刚刚完成了一场35道题的深度职业探索测评（三层探索法），以下是全部回答：\n\n");

        // 标注用户身份（第1题的回答）
        String userIdentity = "未知身份";
        for (Answer answer : answers) {
            if (answer.getQuestionNumber() == 1 && answer.getAnswerContent() != null) {
                userIdentity = answer.getAnswerContent();
            }
            prompt.append("第").append(answer.getQuestionNumber()).append("题 → ");
            prompt.append(answer.getAnswerContent());
            if (answer.getSelectedOption() != null) {
                prompt.append("（选项").append(answer.getSelectedOption()).append("）");
            }
            prompt.append("\n");
        }

        prompt.append("\n用户自述身份：").append(userIdentity).append("\n\n");

        prompt.append("请基于用户的全部回答，生成一份《职业发展导航报告》。\n");
        prompt.append("报告开头用庆祝语气，如：\"🎉 探索完成！基于我们刚才的深入对话，这是为你——【用户身份描述】量身定制的《职业发展导航报告》！\"\n\n");

        prompt.append("【输出要求】\n\n");

        prompt.append("1. talentScores: 六大天赋维度分数（0-100），基于用户回答的倾向性打分：\n");
        prompt.append("   - CREATIVITY（创造力）\n");
        prompt.append("   - ANALYSIS（分析力）\n");
        prompt.append("   - LEADERSHIP（领导力）\n");
        prompt.append("   - EXECUTION（执行力）\n");
        prompt.append("   - COMMUNICATION（沟通力）\n");
        prompt.append("   - LEARNING（学习力）\n");
        prompt.append("   分数要有区分度，不要全部集中在60-80之间，要根据用户回答拉开差距\n\n");

        prompt.append("2. personalityType: 核心画像名称\n");
        prompt.append("   用一句生动的比喻总结用户。\n");
        prompt.append("   好的例子：\"直觉敏锐的架构师\"\"星辰航海家\"\"思维建筑师\"\"灵感捕手\"\n\n");

        prompt.append("3. personalityDescription: 核心画像描述（150-250字）\n");
        prompt.append("   用第二人称\"你\"来写，像一封写给用户的信\n");
        prompt.append("   要有洞察力，让用户觉得\"说的就是我\"\n");
        prompt.append("   融入具体的行为特征和内心世界的描写\n\n");

        prompt.append("4. workStyle: 做事风格名称（简洁有力，4-6个字）\n");
        prompt.append("   好的例子：\"直觉驱动型\"\"全局掌控型\"\"深度钻研型\"\n\n");

        prompt.append("5. workStyleDescription: 做事风格描述（150-250字）\n");
        prompt.append("   描述用户处理问题的方式、决策习惯、协作模式\n");
        prompt.append("   要具体，用场景化的语言\n\n");

        prompt.append("6. strengths: 天赋引擎列表，2-3个最突出的天赋特质和驱动力\n");
        prompt.append("   每一个都要具体、有画面感、有温度\n");
        prompt.append("   好的例子：\n");
        prompt.append("   - \"在一片混乱中迅速理清头绪，找到那根最关键的线头\"\n");
        prompt.append("   - \"用三言两语就能让复杂的事情变得人人都懂\"\n");
        prompt.append("   坏的例子（禁止）：\"善于沟通\"\"有创造力\"\"执行力强\"\n\n");

        prompt.append("7. summary: 综合总结（250-400字）\n");
        prompt.append("   分3段：\n");
        prompt.append("   第1段：用一个生动的比喻开头，概括用户的核心特质\n");
        prompt.append("   第2段：分析用户的独特优势组合，以及这种组合带来的竞争力\n");
        prompt.append("   第3段：给出发展建议和鼓励，语气温暖有力量\n");
        prompt.append("   整体文风要高级、有洞察力，避免鸡汤和套话\n\n");

        prompt.append("8. careerPaths: 为用户定制的三大航向（过滤夕阳产业，聚焦新兴/常青领域），数组包含3个对象：\n");
        prompt.append("   每个航向对象包含：\n");
        prompt.append("   - name: 航向名称（\"精英职场之路\"、\"创新事业之路\"、\"超级个体之路\"）\n");
        prompt.append("   - generalAdvice: 通用建议（200-350字），结合用户的天赋特质推荐具体的行业方向和岗位\n");
        prompt.append("   - identityAdvice: 身份适配建议，一个对象，包含3个key：\n");
        prompt.append("     - \"学生/应届生\": 针对学生的具体建议（80-150字）\n");
        prompt.append("     - \"职场人\": 针对职场人的具体建议（80-150字）\n");
        prompt.append("     - \"宝妈/宝爸\": 针对宝妈宝爸的具体建议（80-150字）\n\n");

        prompt.append("   航向A（精英职场之路）的身份适配建议参考方向：\n");
        prompt.append("     - 学生：优先考虑管培生、实习生岗位，重在平台学习和技能积累\n");
        prompt.append("     - 职场人：关注升级转型机会，利用现有经验向新兴岗位跃迁\n");
        prompt.append("     - 宝妈/宝爸：优先考虑时间灵活的企业，或关注重返职场计划\n\n");

        prompt.append("   航向B（创新事业之路）的身份适配建议参考方向：\n");
        prompt.append("     - 学生：从校园创业比赛、运营垂直社群开始，低成本试错\n");
        prompt.append("     - 职场人：采用\"副业孵化\"模式，业余时间验证想法\n");
        prompt.append("     - 宝妈/宝爸：从解决自身或身边群体的痛点出发，创建社群或小品牌\n\n");

        prompt.append("   航向C（超级个体之路）的身份适配建议参考方向：\n");
        prompt.append("     - 学生：利用课余时间打造个人品牌，积累粉丝和作品集\n");
        prompt.append("     - 职场人：将专业经验封装成付费咨询、课程或工具，知识变现\n");
        prompt.append("     - 宝妈/宝爸：从内容创作或线上顾问开始，完美兼顾家庭与发展\n\n");

        prompt.append("9. actionPlan: 专属下一步行动计划，根据用户的实际身份（第1题回答）生成：\n");
        prompt.append("   - identityLabel: 用户的身份标签（如\"在校学生\"\"职场人士\"\"宝妈/宝爸\"）\n");
        prompt.append("   - steps: 行动步骤数组，包含2-3个步骤，每个步骤有：\n");
        prompt.append("     - title: 步骤标题（如\"关键一步\"\"资源利用\"\"技能提升\"）\n");
        prompt.append("     - content: 步骤详细内容（50-100字），要具体可执行，结合用户的航向建议\n");
        prompt.append("   - closingMessage: 结语鼓励（50-80字），温暖有力量\n\n");

        prompt.append("   行动计划参考方向：\n");
        prompt.append("   如果是学生：争取相关暑期实习 + 参加学校职业发展中心活动和校友访谈\n");
        prompt.append("   如果是职场人：在现有工作中申请与目标航向技能挂钩的新项目 + 更新简历明确新方向\n");
        prompt.append("   如果是宝妈/宝爸：每周抽出固定\"自我投资时间\"学习核心技能 + 加入相关线上社群交流经验\n\n");

        prompt.append("【重要规则】\n");
        prompt.append("1. 所有建议必须结合用户的具体回答，不要泛泛而谈\n");
        prompt.append("2. 三大航向的通用建议要结合用户的天赋特质推荐具体的行业和岗位方向\n");
        prompt.append("3. 身份适配建议要根据用户第1题回答的身份来重点展开对应身份的建议\n");
        prompt.append("4. 行动计划必须根据用户的实际身份生成，不要给出所有身份的建议\n");
        prompt.append("5. 语气温暖、鼓励、有力量，像一位贴心的导师\n\n");

        prompt.append("请严格按以下JSON格式返回（不要包含其他内容）：\n");
        prompt.append("{\n");
        prompt.append("  \"talentScores\": {\"CREATIVITY\": 85, \"ANALYSIS\": 70, \"LEADERSHIP\": 60, \"EXECUTION\": 75, \"COMMUNICATION\": 80, \"LEARNING\": 90},\n");
        prompt.append("  \"personalityType\": \"...\",\n");
        prompt.append("  \"personalityDescription\": \"...\",\n");
        prompt.append("  \"workStyle\": \"...\",\n");
        prompt.append("  \"workStyleDescription\": \"...\",\n");
        prompt.append("  \"strengths\": [\"天赋特质1\", \"天赋特质2\", \"天赋特质3\"],\n");
        prompt.append("  \"summary\": \"...\",\n");
        prompt.append("  \"careerPaths\": [\n");
        prompt.append("    {\"name\": \"精英职场之路\", \"generalAdvice\": \"...\", \"identityAdvice\": {\"学生/应届生\": \"...\", \"职场人\": \"...\", \"宝妈/宝爸\": \"...\"}},\n");
        prompt.append("    {\"name\": \"创新事业之路\", \"generalAdvice\": \"...\", \"identityAdvice\": {\"学生/应届生\": \"...\", \"职场人\": \"...\", \"宝妈/宝爸\": \"...\"}},\n");
        prompt.append("    {\"name\": \"超级个体之路\", \"generalAdvice\": \"...\", \"identityAdvice\": {\"学生/应届生\": \"...\", \"职场人\": \"...\", \"宝妈/宝爸\": \"...\"}}\n");
        prompt.append("  ],\n");
        prompt.append("  \"actionPlan\": {\n");
        prompt.append("    \"identityLabel\": \"在校学生\",\n");
        prompt.append("    \"steps\": [{\"title\": \"关键一步\", \"content\": \"...\"}, {\"title\": \"资源利用\", \"content\": \"...\"}],\n");
        prompt.append("    \"closingMessage\": \"...\"\n");
        prompt.append("  }\n");
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
        systemMessage.put("content", "你是\"启航导师\"，一名专业的AI职业规划师。请严格按照用户要求的JSON格式返回结果，不要包含任何其他内容，不要使用markdown代码块包裹。");
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

        // 解析三大航向
        List<CareerPath> careerPaths = new ArrayList<>();
        if (json.has("careerPaths") && json.get("careerPaths").isArray()) {
            for (JsonNode pathNode : json.get("careerPaths")) {
                Map<String, String> identityAdvice = new HashMap<>();
                if (pathNode.has("identityAdvice") && pathNode.get("identityAdvice").isObject()) {
                    pathNode.get("identityAdvice").fields().forEachRemaining(entry ->
                            identityAdvice.put(entry.getKey(), entry.getValue().asText())
                    );
                }
                careerPaths.add(CareerPath.builder()
                        .name(pathNode.get("name").asText())
                        .generalAdvice(pathNode.get("generalAdvice").asText())
                        .identityAdvice(identityAdvice)
                        .build());
            }
        }

        // 解析行动计划
        ActionPlan actionPlan = null;
        if (json.has("actionPlan") && json.get("actionPlan").isObject()) {
            JsonNode actionNode = json.get("actionPlan");
            List<ActionPlan.ActionStep> steps = new ArrayList<>();
            if (actionNode.has("steps") && actionNode.get("steps").isArray()) {
                for (JsonNode stepNode : actionNode.get("steps")) {
                    steps.add(ActionPlan.ActionStep.builder()
                            .title(stepNode.get("title").asText())
                            .content(stepNode.get("content").asText())
                            .build());
                }
            }
            actionPlan = ActionPlan.builder()
                    .identityLabel(actionNode.get("identityLabel").asText())
                    .steps(steps)
                    .closingMessage(actionNode.has("closingMessage") ? actionNode.get("closingMessage").asText() : "")
                    .build();
        }

        return TalentResult.builder()
                .talentScores(talentScores)
                .personalityType(personalityType)
                .personalityDescription(personalityDescription)
                .workStyle(workStyle)
                .workStyleDescription(workStyleDescription)
                .strengths(strengths)
                .summary(summary)
                .careerPaths(careerPaths)
                .actionPlan(actionPlan)
                .build();
    }
}
