package com.downsampling.downsampling.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "time_series_data", indexes = {
    @Index(name = "idx_timestamp", columnList = "timestamp")
})
@Getter
@Setter
@NoArgsConstructor
public class TimeSeriesData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long timestamp;

    @Column(nullable = false)
    private Double value;

    @Column(nullable = false)
    private Double temp; // Can be used for filtering if needed, but for now we generate 100 +/- 15

    public TimeSeriesData(Long timestamp, Double value, Double temp) {
        this.timestamp = timestamp;
        this.value = value;
        this.temp = temp;
    }
}
