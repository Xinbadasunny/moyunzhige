package com.moyunzhige.domain.gateway;

import com.moyunzhige.domain.model.GameScore;
import java.util.List;

/**
 * 游戏成绩数据网关接口
 */
public interface GameScoreGateway {
    
    /**
     * 根据关卡ID查询成绩
     * @param levelId 关卡ID
     * @return 成绩列表
     */
    List<GameScore> findByLevelId(String levelId);
    
    /**
     * 根据关卡ID查询前N名成绩
     * @param levelId 关卡ID
     * @param limit 返回数量限制
     * @return 成绩列表
     */
    List<GameScore> findTopByLevelId(String levelId, int limit);
    
    /**
     * 保存成绩
     * @param score 成绩对象
     * @return 保存后的成绩对象
     */
    GameScore save(GameScore score);
    
    /**
     * 查询所有成绩
     * @return 成绩列表
     */
    List<GameScore> findAll();
}
