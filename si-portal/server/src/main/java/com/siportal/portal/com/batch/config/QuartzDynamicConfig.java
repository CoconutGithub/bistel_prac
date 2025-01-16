package com.siportal.portal.com.batch.config;

import com.siportal.portal.dto.SchedulDTO;
import com.siportal.portal.mapper.PortalMapper;
import jakarta.annotation.PostConstruct;
import org.quartz.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class QuartzDynamicConfig {

    @Autowired
    private Scheduler scheduler;

    @Autowired
    PortalMapper portalMapper;

    // 애플리케이션 시작 후 동적으로 작업을 등록
    @PostConstruct
    public void init() throws Exception {

        List<SchedulDTO> scheduleList = portalMapper.getScheduleList(null, "ACTIVE");

        for(SchedulDTO dto : scheduleList) {
            try {
                addJob(dto.getClassName(), dto.getJobName(), dto.getGroupName(), dto.getTriggerKey(), dto.getCronTab());
            } catch (ClassNotFoundException e) {
            }
        }
    }

    public void addJob(String className, String jobName, String groupName, String triggerKey, String cronTab) throws Exception {
        Class<?> jobClass = null;
        try {
            jobClass = Class.forName(className);
        } catch (ClassNotFoundException e) {
            System.out.println("Cannot find Schedule Execute Class : " +  className );
            // 클래스가 없을 때의 처리
            throw e;
        }
        JobDetail jobDetail = JobBuilder.newJob((Class<? extends Job>) jobClass)
                .withIdentity(jobName, groupName)
                .build();
        System.out.println("create jobDetail(" + jobName + ")(" + groupName + ")");

        // Trigger 생성 (Cron 표현식으로 스케줄 설정)
//            String cronExp = "0/10 * * * * ?";
//            String trigerKey = "triggerKey";
        Trigger trigger = TriggerBuilder.newTrigger().
                withIdentity(new TriggerKey(triggerKey)).
                withSchedule(CronScheduleBuilder.cronSchedule(cronTab)).build();
        System.out.println("create trigger(" + triggerKey + ")(" + cronTab + ")");

        // Scheduler에 작업과 트리거를 등록
        scheduler.scheduleJob(jobDetail, trigger);
        System.out.println("regist job and trigger(" + jobName + ")(" + groupName + ")("+ triggerKey + ")(" + cronTab + ")");
    }

    public void deleteJob(String jobName, String groupName) throws Exception {
        scheduler.deleteJob(new JobKey(jobName, groupName));
        System.out.println("delete job(" + jobName + ")(" + groupName + ")");

        boolean jobExists = scheduler.checkExists(new JobKey(jobName, groupName));

        if (!jobExists) {
            System.out.println("check job delete(" + jobName + ")(" + groupName + ") ===> completed");
        } else {
            System.out.println("check job delete(" + jobName + ")(" + groupName + ") ===> not completed");
        }
    }

    public void updateJobTrigger(String triggerKey, String cronTab) throws Exception {
        Trigger newTrigger = TriggerBuilder.newTrigger().
                withIdentity(new TriggerKey(triggerKey)).
                withSchedule(CronScheduleBuilder.cronSchedule(cronTab)).build();
        scheduler.rescheduleJob(new TriggerKey(triggerKey), newTrigger);
    }

}