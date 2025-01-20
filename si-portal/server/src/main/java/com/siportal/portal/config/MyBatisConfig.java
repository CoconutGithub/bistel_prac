package com.siportal.portal.config;

import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.type.JdbcType;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import javax.sql.DataSource;

@Configuration
public class MyBatisConfig {

    @Value("${database.type}")
    private String dbType;

    @Bean
    public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
        SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
        sessionFactory.setDataSource(dataSource);

        // MyBatis 설정
        org.apache.ibatis.session.Configuration configuration = new org.apache.ibatis.session.Configuration();
        configuration.setLogImpl(org.apache.ibatis.logging.stdout.StdOutImpl.class); // Console에 로그 출력
        configuration.setJdbcTypeForNull(JdbcType.NULL);
        configuration.setMapUnderscoreToCamelCase(true); // CamelCase 매핑 활성화
        sessionFactory.setConfiguration(configuration);


        String mapperLocation = "classpath:mappers/";
        if ("postgresql".equalsIgnoreCase(dbType)) {
            mapperLocation += "postgresql/*.xml";
        } else if ("oracle".equalsIgnoreCase(dbType)) {
            mapperLocation += "oracle/*.xml";
        }

        sessionFactory.setMapperLocations(new PathMatchingResourcePatternResolver().getResources(mapperLocation));

        return sessionFactory.getObject();
    }
}
