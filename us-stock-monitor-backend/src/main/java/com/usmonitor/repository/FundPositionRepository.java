package com.usmonitor.repository;

import com.usmonitor.domain.FundPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FundPositionRepository extends JpaRepository<FundPosition, Long>, JpaSpecificationExecutor<FundPosition> {

    List<FundPosition> findByFundNameAndQuarter(String fundName, String quarter);

    List<FundPosition> findByTicker(String ticker);

    List<FundPosition> findByQuarter(String quarter);

    @Query("SELECT DISTINCT f.fundName FROM FundPosition f WHERE f.fundName IS NOT NULL ORDER BY f.fundName ASC")
    List<String> findDistinctFundNames();

    @Query("SELECT DISTINCT f.quarter FROM FundPosition f WHERE f.quarter IS NOT NULL ORDER BY f.quarter DESC")
    List<String> findDistinctQuarters();
}
