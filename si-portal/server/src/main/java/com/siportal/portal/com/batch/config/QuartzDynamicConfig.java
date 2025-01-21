package com.siportal.portal.com.batch.config;

import com.siportal.portal.dto.SchedulDTO;
import com.siportal.portal.mapper.AdminMapper;
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
    AdminMapper adminMapper;

    // 애플리케이션 시작 후 동적으로 작업을 등록
    @PostConstruct
    public void init() throws Exception {

        List<SchedulDTO> scheduleList = adminMapper.getScheduleList(null, "ACTIVE");

        for(SchedulDTO dto : scheduleList) {
            try {
                if(addJob(dto.getClassName(), dto.getJobName(), dto.getGroupName(), dto.getTriggerKey(), dto.getCronTab()))
                    System.out.println("check job working(" + dto.getJobName() + ")(" + dto.getGroupName() + ") ===> success!!!");
                else
                    System.out.println("check job working(" + dto.getJobName() + ")(" + dto.getGroupName() + ") ===> fail!!!");
            } catch (ClassNotFoundException e) {
                System.out.println("check job working(" + dto.getJobName() + ")(" + dto.getGroupName() + ") ===> fail!!!");
            }
        }
    }

    public boolean addJob(String className, String jobName, String groupName, String triggerKey, String cronTab) throws Exception {
        boolean ret = false;
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

        if (checkJobExist(jobName, groupName)) {
            System.out.println("check job create(" + jobName + ")(" + groupName + ") ===> completed");
            ret = true;
        } else {
            System.out.println("check job create(" + jobName + ")(" + groupName + ") ===> not completed");
        }
        return ret;
    }

    boolean checkJobExist(String jobName, String groupName) throws Exception{
        boolean ret = false;
        boolean jobExists = scheduler.checkExists(new JobKey(jobName, groupName));

        if (jobExists) {
            ret = true;
        }
        return ret;
    }

    public boolean deleteJob(String jobName, String groupName) throws Exception {
        boolean ret = false;
        scheduler.deleteJob(new JobKey(jobName, groupName));
        System.out.println("delete job(" + jobName + ")(" + groupName + ")");

        if (!checkJobExist(jobName, groupName)) {
            System.out.println("check job delete(" + jobName + ")(" + groupName + ") ===> completed");
            ret = true;
        } else {
            System.out.println("check job delete(" + jobName + ")(" + groupName + ") ===> not completed");
        }
        return ret;
    }

    public boolean updateJobTrigger(String jobName, String groupName, String triggerKey, String cronTab) throws Exception {
        boolean ret = false;
        try {
            Trigger newTrigger = TriggerBuilder.newTrigger().
                    withIdentity(new TriggerKey(triggerKey)).
                    withSchedule(CronScheduleBuilder.cronSchedule(cronTab)).build();
            scheduler.rescheduleJob(new TriggerKey(triggerKey), newTrigger);
            if (checkJobExist(jobName, groupName)) {
                System.out.println("check job update(" + jobName + ")(" + groupName + ") ===> completed");
                ret = true;
            } else {
                System.out.println("check job update(" + jobName + ")(" + groupName + ") ===> not completed because job not exist");
            }
        } catch (Exception e) {
            System.out.println("update job trigger(" + triggerKey + ")(" + cronTab + ") ===> fail!!!");
        }
        return ret;
    }
}