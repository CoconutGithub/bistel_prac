package com.siportal.portal.config;

import org.apache.ibatis.executor.Executor;
import org.apache.ibatis.mapping.MappedStatement;
import org.apache.ibatis.plugin.*;
import org.apache.ibatis.session.ResultHandler;
import org.apache.ibatis.session.RowBounds;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.type.JdbcType;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import javax.sql.DataSource;
import java.util.Properties;


@Configuration
@MapperScan(basePackages = {
        "com.siportal.portal.mapper",
})
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

        // Custom Interceptor 추가
        configuration.addInterceptor(new MyBatisLoggingInterceptor());

        return sessionFactory.getObject();
    }

    /**
     * MyBatis Interceptor 구현
     */
    @Intercepts({
            @Signature(type = Executor.class, method = "query", args = {MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class}),
            @Signature(type = Executor.class, method = "update", args = {MappedStatement.class, Object.class})
    })
    public static class MyBatisLoggingInterceptor implements Interceptor {
        @Override
        public Object intercept(Invocation invocation) throws Throwable {
            MappedStatement mappedStatement = (MappedStatement) invocation.getArgs()[0];
            String mapperMethod = mappedStatement.getId(); // Mapper 이름과 메서드
            System.out.println("Executed Mapper Method: " + mapperMethod);
            return invocation.proceed(); // 실제 실행
        }

        @Override
        public Object plugin(Object target) {
            return Plugin.wrap(target, this);
        }

        @Override
        public void setProperties(Properties properties) {
            // 필요 시 설정 추가
        }
    }
}
