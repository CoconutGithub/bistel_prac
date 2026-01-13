package com.downsampling.downsampling.service;

import com.downsampling.downsampling.repo.DataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataService {

    private final JdbcTemplate jdbcTemplate;
    private final DataRepository dataRepository;

    @Transactional
    public void generateData() {
        long count = dataRepository.count();
        if (count > 0) {
            log.info("Data already exists. Count: {}", count);
            return;
        }

        log.info("Starting data generation...");
        long startTime = System.currentTimeMillis();

        // 24 hours * 60 minutes * 60 seconds * 100 Hz = 8,640,000
        int totalPoints = 8_640_000;
        int batchSize = 100_000; // Process in chunks of 100k
        long startTimestamp = System.currentTimeMillis();

        String sql = "INSERT INTO time_series_data (timestamp, value, temp) VALUES (?, ?, ?)";

        for (int offset = 0; offset < totalPoints; offset += batchSize) {
            final int currentBatchSize = Math.min(batchSize, totalPoints - offset);
            final int currentOffset = offset;
            jdbcTemplate.batchUpdate(sql, new org.springframework.jdbc.core.BatchPreparedStatementSetter() {
                @Override
                public void setValues(PreparedStatement ps, int i) throws java.sql.SQLException {
                    int globalIndex = currentOffset + i;
                    long currentTimestamp = startTimestamp + (globalIndex * 10L); // 10ms interval
                    
                    // Sine wave logic: Period of 4 hours (4 * 3600 * 1000 ms)
                    // 2 * PI * time / period
                    double period = 4 * 3600.0 * 1000.0; 
                    double sineValue = 10.0 * Math.sin(2 * Math.PI * (globalIndex * 10L) / period);
                    
                    // Noise: +/- 5.0
                    double noise = ThreadLocalRandom.current().nextDouble() * 10.0 - 5.0;
                    
                    // Base: 100.0
                    double temp = 100.0 + sineValue + noise; // Range approx 85 ~ 115
                    
                    ps.setLong(1, currentTimestamp);
                    ps.setDouble(2, temp);
                    ps.setDouble(3, temp);
                }

                @Override
                public int getBatchSize() {
                    return currentBatchSize;
                }
            });
            
            log.info("Generated {} / {} records...", offset + currentBatchSize, totalPoints);
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("Data generation completed in {} ms", duration);
    }
}
