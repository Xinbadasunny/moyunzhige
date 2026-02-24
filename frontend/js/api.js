/**
 * 墨韵节拍：止戈 - API 客户端
 * 对接 Java 后端 REST API
 */
(function() {
    'use strict';

    var API_BASE_URL = 'http://localhost:8081/api';

    var ApiClient = {
        /**
         * 设置 API 基础地址
         */
        setBaseUrl: function(url) {
            API_BASE_URL = url;
        },

        /**
         * 获取所有关卡列表
         * @returns {Promise<Array>} 关卡列表
         */
        getLevels: function() {
            return fetch(API_BASE_URL + '/levels')
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error('获取关卡列表失败: ' + response.status);
                    }
                    return response.json();
                });
        },

        /**
         * 获取单个关卡详情（含谱面数据）
         * @param {string} levelId - 关卡 ID
         * @returns {Promise<Object>} 关卡数据
         */
        getLevelById: function(levelId) {
            return fetch(API_BASE_URL + '/levels/' + encodeURIComponent(levelId))
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error('获取关卡详情失败: ' + response.status);
                    }
                    return response.json();
                });
        },

        /**
         * 提交游戏成绩
         * @param {Object} scoreData - 成绩数据
         * @returns {Promise<Object>} 保存后的成绩
         */
        submitScore: function(scoreData) {
            return fetch(API_BASE_URL + '/scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scoreData)
            }).then(function(response) {
                if (!response.ok) {
                    throw new Error('提交成绩失败: ' + response.status);
                }
                return response.json();
            });
        },

        /**
         * 获取排行榜
         * @param {string} levelId - 关卡 ID
         * @param {number} limit - 返回条数，默认 10
         * @returns {Promise<Array>} 排行榜数据
         */
        getLeaderboard: function(levelId, limit) {
            var queryLimit = limit || 10;
            return fetch(API_BASE_URL + '/scores/leaderboard/' + encodeURIComponent(levelId) + '?limit=' + queryLimit)
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error('获取排行榜失败: ' + response.status);
                    }
                    return response.json();
                });
        },

        /**
         * 检查后端是否可用
         * @returns {Promise<boolean>}
         */
        checkHealth: function() {
            return fetch(API_BASE_URL + '/levels', { method: 'GET' })
                .then(function() { return true; })
                .catch(function() { return false; });
        }
    };

    window.ApiClient = ApiClient;
})();
