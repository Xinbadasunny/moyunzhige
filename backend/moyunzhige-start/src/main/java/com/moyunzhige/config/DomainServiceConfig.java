package com.moyunzhige.config;

import com.moyunzhige.domain.gateway.GameScoreGateway;
import com.moyunzhige.domain.gateway.LevelGateway;
import com.moyunzhige.domain.service.LevelDomainService;
import com.moyunzhige.domain.service.ScoreDomainService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DomainServiceConfig {

    @Bean
    public LevelDomainService levelDomainService(LevelGateway levelGateway) {
        return new LevelDomainService(levelGateway);
    }

    @Bean
    public ScoreDomainService scoreDomainService(GameScoreGateway gameScoreGateway) {
        return new ScoreDomainService(gameScoreGateway);
    }
}
