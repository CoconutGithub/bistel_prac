package com.downsampling.downsampling.repo;

import com.downsampling.downsampling.domain.TimeSeriesData;
import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.stereotype.Repository;

import java.util.stream.Stream;

import static org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE;

@Repository
public interface DataRepository extends JpaRepository<TimeSeriesData, Long> {

    @QueryHints(value = @QueryHint(name = HINT_FETCH_SIZE, value = "1000"))
    Stream<TimeSeriesData> findAllByOrderByTimestampAsc();
}
