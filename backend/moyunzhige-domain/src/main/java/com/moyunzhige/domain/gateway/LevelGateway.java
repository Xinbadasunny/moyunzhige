package com.moyunzhige.domain.gateway;

import com.moyunzhige.domain.model.Level;
import java.util.List;
import java.util.Optional;

/**
 * 关卡数据网关接口
 */
public interface LevelGateway {
    
    /**
     * 查询所有关卡
     * @return 关卡列表
     */
    List<Level> findAll();
    
    /**
     * 根据ID查询关卡
     * @param id 关卡ID
     * @return 关卡对象
     */
    Optional<Level> findById(String id);
    
    /**
     * 保存关卡
     * @param level 关卡对象
     * @return 保存后的关卡对象
     */
    Level save(Level level);
    
    /**
     * 根据ID删除关卡
     * @param id 关卡ID
     */
    void deleteById(String id);
}
