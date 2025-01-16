package com.siportal.portal.com.batch.job;

import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.springframework.stereotype.Component;

@Component
public class DynamicJob implements Job {

    @Override
    public void execute(JobExecutionContext context) {
        // 작업이 실행될 때 수행할 작업
        System.out.println("Dynamic Job executed at " + System.currentTimeMillis());
    }
}