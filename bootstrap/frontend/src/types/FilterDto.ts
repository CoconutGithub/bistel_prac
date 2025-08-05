export interface FilterDto {
    empId: number;
    tableName: string;
    filters: {
        filterName: string;
        filterType: string;
        filterValue: string;
        valueType: string;
    }[];
}
