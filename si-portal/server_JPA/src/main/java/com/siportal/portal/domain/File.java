package com.siportal.portal.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.Id;
import java.time.LocalDateTime;


@Entity
@Table(name = "P_FILE")
@Getter
@Setter
@NoArgsConstructor
public class File {

    @Id
    @Column(name = "FILE_GROUP_ID", nullable = false)
    private Integer fileGroupId;

    @Column(name = "FILE_NAME", length = 200, nullable = false)
    private String fileName;

    @Column(name = "FILE_PATH", length = 200, nullable = false)
    private String filePath;

    @Column(name = "FILE_SIZE", nullable = false)
    private Integer fileSize;

    @Column(name = "CREATE_DATE", updatable = false)
    private LocalDateTime createDate;

    @Column(name = "CREATE_BY", length = 100, updatable = false)
    private String createBy;

    @Column(name = "UPDATE_DATE")
    private LocalDateTime updateDate;

    @Column(name = "UPDATE_BY", length = 100)
    private String updateBy;
}
