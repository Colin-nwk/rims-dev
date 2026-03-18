import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { apiClient } from "@/lib/api/apiClient";

// Type definitions
type ApiParams = Record<string, string | number | boolean | undefined>;
type ProgressCallback = (
    currentPage: number,
    totalPages: number,
    message: string
) => void;

// Define the structure of the data we expect to handle
export type ExcelData = Record<
    string,
    string | number | boolean | null | undefined
>;

// Define the structure for custom column mappings
export type ColumnMapping = {
    key: string;
    columnName: string;
};

export const exportToExcel = async <T extends ExcelData>(
    data: T[],
    fileName: string,
    excludeColumns?: string[],
    customColumnNames?: ColumnMapping[],
    includeColumns?: string[]
): Promise<void> => {
    if (!data || data.length === 0) {
        return;
    }

    // Create a new workbook and add a worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(fileName);

    // Function to flatten nested objects
    const flattenObject = (
        obj: Record<string, unknown>,
        parentKey = ""
    ): Record<string, string | number | boolean | null | undefined> => {
        return Object.entries(obj).reduce((acc, [key, value]) => {
            const newKey = parentKey ? `${parentKey}.${key}` : key;
            if (value && typeof value === "object" && !Array.isArray(value)) {
                Object.assign(
                    acc,
                    flattenObject(value as Record<string, unknown>, newKey)
                );
            } else {
                acc[newKey] = value as
                    | string
                    | number
                    | boolean
                    | null
                    | undefined;
            }
            return acc;
        }, {} as Record<string, string | number | boolean | null | undefined>);
    };

    // Flatten all objects in the data array
    const flatData = data.map((item) => flattenObject(item));

    // Extract all unique keys from the dataset
    let allKeys = Array.from(
        new Set(flatData.flatMap((item) => Object.keys(item)))
    );

    // If includeColumns is specified, only include those columns
    if (includeColumns && includeColumns.length > 0) {
        allKeys = allKeys.filter((key) => includeColumns.includes(key));
    } else if (excludeColumns && excludeColumns.length > 0) {
        // Otherwise, filter out excluded columns if specified
        allKeys = allKeys.filter((key) => !excludeColumns.includes(key));
    }

    // Format header names to be more readable
    const formatHeaderName = (key: string): string => {
        // Check if there's a custom column name for this key
        if (customColumnNames && customColumnNames.length > 0) {
            const customMapping = customColumnNames.find(
                (mapping) => mapping.key === key
            );
            if (customMapping) {
                return customMapping.columnName;
            }
        }

        // Default formatting if no custom name is found
        return key
            .replace(/_/g, " ")
            .replace(/\./g, " - ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    // Add headers to the worksheet with formatting
    const headerRow = worksheet.addRow(allKeys.map(formatHeaderName));

    // Style the header row
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF4472C4" },
        };
        cell.alignment = {
            vertical: "middle",
            horizontal: "center",
            wrapText: true,
        };
        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };
    });

    // Add rows with data
    flatData.forEach((item, index) => {
        const row = allKeys.map((key) => item[key] ?? "");
        const dataRow = worksheet.addRow(row);

        // Style data rows
        dataRow.eachCell((cell) => {
            cell.alignment = {
                vertical: "middle",
                horizontal: "left",
                wrapText: true,
            };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
            // Alternate row colors for better readability
            if (index % 2 === 0) {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFF2F2F2" },
                };
            }
        });
    });

    // Auto-fit columns width based on content
    worksheet.columns.forEach((column, index) => {
        if (column) {
            let maxLength = 0;
            const columnKey = allKeys[index];
            const headerLength = formatHeaderName(columnKey).length;

            // Check header length
            maxLength = Math.max(maxLength, headerLength);

            // Check data lengths
            flatData.forEach((row) => {
                const cellValue = String(row[columnKey] ?? "");
                maxLength = Math.max(maxLength, cellValue.length);
            });

            // Set column width (cap at 50 to avoid extremely wide columns)
            column.width = Math.min(maxLength + 2, 50);
        }
    });

    // Set row height for header
    headerRow.height = 25;

    // Freeze the header row
    worksheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];

    // Add autofilter
    worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: allKeys.length },
    };

    // Generate the Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Trigger download
    saveAs(blob, `${fileName}.xlsx`);
};

/**
 * Exports an array of data directly to Excel without fetching.
 * Useful for exporting filtered data that's already in memory.
 *
 * @param data - Array of objects to export
 * @param fileName - Name for the exported file
 * @returns {Promise<{ status: boolean }>}
 */
export const exportArrayToExcel = async <T extends ExcelData>(
    data: T[],
    fileName: string,
    excludeColumns?: string[],
    customColumnNames?: ColumnMapping[]
): Promise<{ status: boolean }> => {
    try {
        await exportToExcel(data, fileName, excludeColumns, customColumnNames);
        return { status: true };
    } catch (error) {
        console.error("Error exporting data to Excel: ", error);
        return { status: false };
    }
};

/**
 * Fetches ALL data from an endpoint (all pages) with filters and exports to Excel.
 * This is useful when you want to export the complete dataset, not just the current page.
 *
 * @param endpoint - Endpoint to fetch data from
 * @param fileName - Name for the exported file
 * @param params - Request parameters including filters
 * @param perPage - Number of records per page (default 5000)
 * @param dataPath - Optional path to nested data (e.g., "detailed.inmates")
 * @param excludeColumns - Columns to exclude from export
 * @param customColumnNames - Custom column name mappings
 * @param onProgress - Progress callback
 * @param includeColumns - If provided, only these columns will be exported
 * @returns {Promise<{ status: boolean }>}
 */
export const fetchAllDataAndExport = async (
    endpoint: string,
    fileName: string,
    params?: ApiParams,
    perPage?: number,
    dataPath?: string,
    excludeColumns?: string[],
    customColumnNames?: ColumnMapping[],
    onProgress?: ProgressCallback,
    includeColumns?: string[]
): Promise<{ status: boolean }> => {
    let allData: ExcelData[] = [];
    let currentPage = 1;
    let totalPages = 1;

    try {
        // Fetch all pages of data
        while (currentPage <= totalPages) {
            // Call progress callback if provided
            if (onProgress) {
                onProgress(
                    currentPage,
                    totalPages,
                    `Fetching page ${currentPage} of ${totalPages}...`
                );
            }

            const response = await apiClient.get(endpoint, {
                params: {
                    ...params,
                    page: currentPage,
                    per_page: perPage || 5000,
                },
            });

            // API response structure: { status, message, data: { current_page, data: [...], last_page, ... } }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const apiResponse = response.data as any;
            const paginationWrapper = apiResponse?.data;
            let pageData: ExcelData[] = [];

            // Navigate to the nested data path if specified
            if (dataPath) {
                const pathParts = dataPath.split(".");

                if (pathParts.length > 1) {
                    const parentPath = pathParts.slice(0, -1);
                    const dataKey = pathParts[pathParts.length - 1];

                    let parentData = paginationWrapper;
                    for (const key of parentPath) {
                        parentData = parentData?.[key];
                    }

                    if (parentData) {
                        pageData = parentData[dataKey] || [];
                        if (parentData.pagination?.last_page) {
                            totalPages = parentData.pagination.last_page;
                        }
                    }
                } else {
                    const actualData = paginationWrapper?.[dataPath];
                    if (Array.isArray(actualData)) {
                        pageData = actualData;
                    }
                }
            } else {
                // Handle standard Laravel pagination structure
                // paginationWrapper = { current_page, data: [...], last_page, per_page, total, ... }
                if (paginationWrapper?.data && Array.isArray(paginationWrapper.data)) {
                    pageData = paginationWrapper.data;
                    totalPages = paginationWrapper.last_page || 1;
                } else if (Array.isArray(paginationWrapper)) {
                    // Direct array response (no pagination)
                    pageData = paginationWrapper;
                    totalPages = 1;
                } else if (paginationWrapper && typeof paginationWrapper === "object") {
                    // Single object response
                    pageData = [paginationWrapper];
                    totalPages = 1;
                }
            }

            allData = [...allData, ...pageData];
            currentPage++;
        }

        // Progress callback for processing phase
        if (onProgress) {
            onProgress(totalPages, totalPages, "Processing data for export...");
        }

        if (allData.length === 0) {
            console.warn("No data to export");
            return { status: false };
        }

        await exportToExcel(
            allData,
            fileName,
            excludeColumns,
            customColumnNames,
            includeColumns
        );
        return { status: true };
    } catch (error) {
        console.error(`Error fetching all data for ${endpoint}: `, error);
        return { status: false };
    }
};

/**
 * Fetches data from one or more endpoints and exports to Excel.
 *
 * @param endpoint - (Optional) Single endpoint to fetch data from (if endpointList is not provided)
 * @param fileName - (Optional) Single file name for export (if fileNameList is not provided)
 * @param params - (Optional) Single params object for the request (if paramsList is not provided)
 * @param endpointList - (Optional) Array of endpoints for batch export
 * @param fileNameList - (Optional) Array of file names for batch export
 * @param paramsList - (Optional) Array of params objects for batch export
 * @returns {Promise<{ status: boolean }>}
 */
export const fetchDataAndExport = async (
    endpoint?: string,
    fileName?: string,
    params?: ApiParams,
    endpointList?: string[],
    fileNameList?: string[],
    paramsList?: ApiParams[],
    excludeColumns?: string[],
    customColumnNames?: ColumnMapping[]
): Promise<{ status: boolean }> => {
    // Helper to fetch and export for a single endpoint
    const fetchAndExportSingle = async (
        endpoint: string,
        fileName: string,
        params?: ApiParams,
        excludeColumns?: string[],
        customColumnNames?: ColumnMapping[]
    ): Promise<{ status: boolean }> => {
        let allData: ExcelData[] = [];
        let currentPage = 1;
        let totalPages = 1;
        try {
            while (currentPage <= totalPages) {
                const response = await apiClient.get(endpoint, {
                    params: {
                        ...params,
                        page: currentPage,
                    },
                });
                // API response: { status, message, data: { current_page, data: [...], last_page } }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const apiResponse = response.data as any;
                const paginationWrapper = apiResponse?.data;
                let pageData: ExcelData[] = [];

                if (paginationWrapper?.data && Array.isArray(paginationWrapper.data)) {
                    pageData = paginationWrapper.data;
                    totalPages = paginationWrapper.last_page || 1;
                } else if (Array.isArray(paginationWrapper)) {
                    pageData = paginationWrapper;
                    totalPages = 1;
                } else {
                    pageData = [];
                }

                allData = [...allData, ...pageData];
                currentPage++;
            }
            await exportToExcel(
                allData,
                fileName,
                excludeColumns,
                customColumnNames
            );
            return { status: true };
        } catch (error) {
            console.error(`Error fetching all data for ${endpoint}: `, error);
            return { status: false };
        }
    };

    // Batch mode: multiple endpoints
    if (endpointList && endpointList.length > 0) {
        let allSucceeded = true;
        for (let i = 0; i < endpointList.length; i++) {
            const ep = endpointList[i];
            const fn =
                fileNameList && fileNameList[i]
                    ? fileNameList[i]
                    : `export_${i + 1}`;
            const prms =
                paramsList && paramsList[i] ? paramsList[i] : undefined;
            const result = await fetchAndExportSingle(
                ep,
                fn,
                prms,
                excludeColumns,
                customColumnNames
            );
            if (!result.status) {
                allSucceeded = false;
            }
        }
        return { status: allSucceeded };
    }

    // Single endpoint mode (default)
    if (endpoint && fileName) {
        return await fetchAndExportSingle(
            endpoint,
            fileName,
            params,
            excludeColumns,
            customColumnNames
        );
    }

    // Invalid usage
    return { status: false };
};
