package com.downsampling.downsampling.service;

import com.downsampling.downsampling.domain.TimeSeriesData;
import com.downsampling.downsampling.repo.DataRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class DownsamplingService {

    private final DataRepository dataRepository;

    @Data
    @AllArgsConstructor
    public static class Point {
        private long timestamp;
        private double value;
    }

    @Transactional(readOnly = true)
    public List<Point> getDownsampledData(int threshold, String method) {
        log.info("Fetching data stream for downsampling... Method: {}, Threshold: {}", method, threshold);
        long performStart = System.currentTimeMillis();

        List<Point> rawData = new ArrayList<>(8_640_000);
        try (Stream<TimeSeriesData> stream = dataRepository.findAllByOrderByTimestampAsc()) {
            stream.forEach(entity -> rawData.add(new Point(entity.getTimestamp(), entity.getValue())));
        }
        
        log.info("Data loaded into memory. Size: {}. Time: {} ms", rawData.size(), System.currentTimeMillis() - performStart);

        if (rawData.size() <= threshold) {
            return rawData;
        }

        List<Point> result;
        long algoStart = System.currentTimeMillis();
        
        if ("SYSTEMATIC".equalsIgnoreCase(method)) {
            result = systematicSampling(rawData, threshold);
        } else if ("AVERAGE".equalsIgnoreCase(method)) {
            result = averageSampling(rawData, threshold);
        } else {
            result = largestTriangleThreeBuckets(rawData, threshold);
        }
        
        log.info("{} completed. Result size: {}. Time: {} ms", method, result.size(), System.currentTimeMillis() - algoStart);

        return result;
    }

    private List<Point> systematicSampling(List<Point> data, int threshold) {
        List<Point> sampled = new ArrayList<>(threshold);
        int dataLength = data.size();
        double step = (double) dataLength / threshold;

        for (int i = 0; i < threshold; i++) {
            int index = (int) (i * step);
            if (index < dataLength) {
                sampled.add(data.get(index));
            }
        }
        return sampled;
    }

    private List<Point> averageSampling(List<Point> data, int threshold) {
        List<Point> sampled = new ArrayList<>(threshold);
        int dataLength = data.size();
        double step = (double) dataLength / threshold;

        for (int i = 0; i < threshold; i++) {
            int start = (int) (i * step);
            int end = (int) ((i + 1) * step);
            end = Math.min(end, dataLength);
            
            if (start >= end) continue;

            double sumValue = 0;
            long sumTime = 0;
            int count = end - start;

            for (int k = start; k < end; k++) {
                sumValue += data.get(k).getValue();
                sumTime += data.get(k).getTimestamp();
            }

            sampled.add(new Point(sumTime / count, sumValue / count));
        }
        return sampled;
    }

    private List<Point> largestTriangleThreeBuckets(List<Point> data, int threshold) {
        List<Point> sampled = new ArrayList<>(threshold);
        int dataLength = data.size();
        
        if (dataLength == 0) return sampled;
        if (dataLength <= threshold) return data;

        // Bucket size. Leave room for start and end data points
        double every = (double) (dataLength - 2) / (threshold - 2);

        int a = 0;
        int nextA = 0;
        Point maxAreaPoint = null;
        
        // Always add the first point
        sampled.add(data.get(0));

        for (int i = 0; i < threshold - 2; i++) {
            // Calculate point average for next bucket (containing c)
            double avgX = 0;
            double avgY = 0;
            int avgRangeStart = (int) (Math.floor((i + 1) * every) + 1);
            int avgRangeEnd = (int) (Math.floor((i + 2) * every) + 1);
            avgRangeEnd = Math.min(avgRangeEnd, dataLength);

            int avgRangeLength = avgRangeEnd - avgRangeStart;

            for (int j = avgRangeStart; j < avgRangeEnd; j++) {
                avgX += data.get(j).getTimestamp();
                avgY += data.get(j).getValue();
            }
            if (avgRangeLength > 0) {
                avgX /= avgRangeLength;
                avgY /= avgRangeLength;
            }

            // Get the range for this bucket
            int rangeOffs = (int) (Math.floor((i + 0) * every) + 1);
            int rangeTo = (int) (Math.floor((i + 1) * every) + 1);

            // Point a
            double pointAx = data.get(a).getTimestamp();
            double pointAy = data.get(a).getValue();

            double maxArea = -1;

            for (int j = rangeOffs; j < rangeTo; j++) {
                // Calculate triangle area over three buckets
                double area = Math.abs((pointAx - avgX) * (data.get(j).getValue() - pointAy) -
                        (pointAx - data.get(j).getTimestamp()) * (avgY - pointAy)) * 0.5;
                
                if (area > maxArea) {
                    maxArea = area;
                    maxAreaPoint = data.get(j);
                    nextA = j;
                }
            }

            if (maxAreaPoint != null) {
                sampled.add(maxAreaPoint);
            }
            a = nextA;
        }

        // Always add the last point
        sampled.add(data.get(dataLength - 1));

        return sampled;
    }
}
