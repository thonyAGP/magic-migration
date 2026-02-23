# Utilitaires API Endpoints Reference

## Base URL
```
/api/utilitaires
```

---

## 1. POST /init - Initialize Utilities (Prg_222)

**Purpose**: Initialize utilities system components

**Request Body**:
```json
{
  "societe": "CS",
  "codeUtilisateur": "ADMIN"
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Utilitaires initializes successfully for societe CS",
  "dateExecution": "2025-12-28T10:30:00Z",
  "initializedComponents": {
    "BackupService": "Initialized",
    "RestoreService": "Initialized",
    "ExportService": "Initialized",
    "ImportService": "Initialized",
    "PurgeService": "Initialized",
    "MaintenanceService": "Initialized",
    "PrintTicketService": "Initialized",
    "LogViewerService": "Initialized",
    "SystemInfoService": "Initialized"
  }
}
```

---

## 2. POST /backup - Create Configuration Backup (Prg_223)

**Purpose**: Create backup of configuration and optionally database/files

**Request Body**:
```json
{
  "societe": "CS",
  "description": "Pre-migration backup",
  "includeDatabase": true,
  "includeFiles": true
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "backupId": "BCK_CS_20251228103000",
  "backupPath": "/backups/BCK_CS_20251228103000.zip",
  "message": "Backup created successfully: BCK_CS_20251228103000",
  "sizeBytes": 1024000,
  "createdAt": "2025-12-28T10:30:00Z"
}
```

---

## 3. POST /restore - Restore Configuration from Backup (Prg_224)

**Purpose**: Restore configuration from a previous backup (requires confirmation)

**Request Body**:
```json
{
  "societe": "CS",
  "backupId": "BCK_CS_20251228103000",
  "confirmRestore": true
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "backupId": "BCK_CS_20251228103000",
  "message": "Configuration restored successfully from backup BCK_CS_20251228103000",
  "itemsRestored": 42,
  "restoredAt": "2025-12-28T10:35:00Z",
  "warningMessage": "Please verify all settings after restore"
}
```

**Error Response (400 Bad Request)** - Not confirmed:
```json
{
  "success": false,
  "backupId": "BCK_CS_20251228103000",
  "codeErreur": "NOT_CONFIRMED",
  "message": "Restore operation must be confirmed",
  "restoredAt": "2025-12-28T10:35:00Z"
}
```

---

## 4. POST /export - Export Data to File (Prg_225)

**Purpose**: Export data to CSV, XML, JSON, or Excel format

**Request Body**:
```json
{
  "societe": "CS",
  "exportFormat": "CSV",
  "tableName": "sales_transactions",
  "dateDebut": "2025-01-01",
  "dateFin": "2025-12-31",
  "includeMetadata": true
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "exportId": "EXP_CS_20251228103000",
  "exportPath": "/exports/EXP_CS_20251228103000.csv",
  "exportFormat": "CSV",
  "message": "Data exported successfully to /exports/EXP_CS_20251228103000.csv",
  "sizeBytes": 2048000,
  "rowsExported": 1250,
  "exportedAt": "2025-12-28T10:40:00Z"
}
```

**Export Formats Supported**:
- `CSV` - Comma-separated values
- `XML` - XML format
- `JSON` - JSON format
- `EXCEL` - Excel format

---

## 5. POST /import - Import Data from File (Prg_226)

**Purpose**: Import data from CSV, XML, JSON, or Excel with validation

**Request Body**:
```json
{
  "societe": "CS",
  "filePath": "/files/data.csv",
  "importFormat": "CSV",
  "skipDuplicates": true,
  "validateBeforeImport": true
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "importId": "IMP_CS_20251228103000",
  "message": "Data imported successfully from /files/data.csv",
  "rowsImported": 980,
  "rowsSkipped": 15,
  "rowsFailed": 5,
  "importedAt": "2025-12-28T10:45:00Z",
  "errors": []
}
```

---

## 6. POST /purge - Purge Old Data (Prg_227)

**Purpose**: Delete old or unused data with optional backup

**Request Body**:
```json
{
  "societe": "CS",
  "tableName": "archive_transactions",
  "retentionDays": 365,
  "confirmPurge": true,
  "createBackupBeforePurge": true
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "tableName": "archive_transactions",
  "message": "Data purged successfully from archive_transactions",
  "rowsDeleted": 5000,
  "rowsPreserved": 95000,
  "backupId": "BKP_PURGE_archive_transactions_20251228103000",
  "purgedAt": "2025-12-28T10:50:00Z",
  "warningMessage": "Please verify data integrity after purge"
}
```

**Error Response (400 Bad Request)** - Not confirmed:
```json
{
  "success": false,
  "tableName": "archive_transactions",
  "codeErreur": "NOT_CONFIRMED",
  "message": "Purge operation must be confirmed",
  "purgedAt": "2025-12-28T10:50:00Z"
}
```

---

## 7. POST /maintenance - Database Maintenance (Prg_228)

**Purpose**: Optimize and clean database with integrity checks

**Request Body**:
```json
{
  "societe": "CS",
  "maintenanceType": "FULL",
  "checkIntegrity": true,
  "rebuildIndexes": true
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "maintenanceType": "FULL",
  "message": "Database maintenance (FULL) completed successfully",
  "tablesProcessed": 127,
  "indexesRebuilt": 342,
  "spaceFreed": 512000000,
  "warningsCount": 3,
  "errorsCount": 0,
  "executionTimeSeconds": 45.5,
  "startedAt": "2025-12-28T10:00:00Z",
  "completedAt": "2025-12-28T10:45:00Z",
  "warningsMessages": [
    "Table ARCHIVE_SESSIONS has unused space",
    "Index IDX_DATE on TABLE_LOGS could benefit from reorganization",
    "Statistics for TABLE_DETAILS are outdated"
  ]
}
```

**Maintenance Types**:
- `FULL` - Complete database maintenance
- `ANALYZE` - Analyze tables only
- `REBUILD` - Rebuild indexes only
- `OPTIMIZE` - Optimize only

---

## 8. POST /print-ticket - Print Sales Ticket (Prg_229)

**Purpose**: Create and print sales ticket (Public API PRINT_TICKET)

**Request Body**:
```json
{
  "societe": "CS",
  "codeVente": "V001",
  "nomClient": "John Doe",
  "dateVente": "2025-12-28T10:30:00Z",
  "montantTotal": 150.00,
  "montantTVA": 30.00,
  "items": [
    {
      "codeArticle": "ART001",
      "descriptionArticle": "Product A",
      "quantite": 2,
      "prixUnitaire": 50.00,
      "montantHT": 100.00,
      "tauxTVA": 0.20,
      "montantTVA": 20.00
    },
    {
      "codeArticle": "ART002",
      "descriptionArticle": "Product B",
      "quantite": 1,
      "prixUnitaire": 50.00,
      "montantHT": 50.00,
      "tauxTVA": 0.20,
      "montantTVA": 10.00
    }
  ],
  "modePaiement": "CASH",
  "numeroTicket": "TKT001",
  "numeroCaisse": "C01",
  "codeOperateur": "ADMIN",
  "printerOutput": true
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "ticketId": "TKT_CS_V001_20251228103000",
  "printedAt": "2025-12-28 10:30:00",
  "printerName": "Receipt Printer",
  "pagesPrinted": 1,
  "printerReady": true,
  "message": "Ticket TKT_CS_V001_20251228103000 printed successfully",
  "printedContent": "base64_encoded_content"
}
```

---

## 9. GET /logs - View Application Logs (Prg_230)

**Purpose**: Retrieve and filter application logs

**Query Parameters**:
```
GET /api/utilitaires/logs?levelFilter=ERROR&dateDebut=2025-12-28&dateFin=2025-12-29&limit=50
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| levelFilter | string | No | Filter by level: INFO, WARN, ERROR, DEBUG |
| dateDebut | DateTime | No | Start date for filtering |
| dateFin | DateTime | No | End date for filtering |
| messageFilter | string | No | Filter by message content |
| limit | int | No | Max results (default 1000, max 10000) |

**Success Response (200 OK)**:
```json
{
  "found": true,
  "logs": [
    {
      "id": 1,
      "level": "ERROR",
      "timestamp": "2025-12-28T10:15:00Z",
      "message": "Failed to process order #12345",
      "stackTrace": "Exception at line 42",
      "context": "Orders"
    },
    {
      "id": 2,
      "level": "ERROR",
      "timestamp": "2025-12-28T09:45:00Z",
      "message": "Database connection timeout",
      "stackTrace": null,
      "context": "Database"
    }
  ],
  "totalLogsCount": 156,
  "displayedLogsCount": 2,
  "levelFilter": "ERROR",
  "dateDebut": "2025-12-28",
  "dateFin": "2025-12-29"
}
```

**Levels Supported**:
- `INFO` - Informational messages
- `WARN` - Warning messages
- `ERROR` - Error messages
- `DEBUG` - Debug messages

---

## 10. GET /system-info - System Information (Prg_231)

**Purpose**: Get system health and configuration information

**Query Parameters**: None

**Request**:
```
GET /api/utilitaires/system-info
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "application": {
    "version": "1.5.0",
    "environment": "Production",
    "framework": ".NET 8.0",
    "runtimeVersion": "8.0.0",
    "startupTime": "2025-12-27T10:00:00Z",
    "uptime": "24.15:30:00"
  },
  "database": {
    "serverName": "sql-prod-01",
    "databaseName": "CaisseDB",
    "databaseVersion": "SQL Server 2019 (15.0)",
    "sizeBytes": 5368709120,
    "tablesCount": 127,
    "indexesCount": 342,
    "lastBackupDate": "2025-12-28T04:00:00Z",
    "connectionStatus": "Connected"
  },
  "systemHealth": {
    "cpuUsagePercent": 35,
    "memoryUsagePercent": 62,
    "availableMemoryBytes": 8589934592,
    "totalMemoryBytes": 16777216000,
    "diskUsagePercent": 71.5,
    "warnings": [
      "Disk usage above 70%",
      "Memory usage above 60%"
    ]
  },
  "configuration": {
    "DatabaseProvider": "SqlServer",
    "LogLevel": "Information",
    "CacheStrategy": "Distributed",
    "MaxConnections": "100",
    "RequestTimeoutSeconds": "30",
    "MaxUploadSizeBytes": "104857600"
  },
  "retrievedAt": "2025-12-28T10:35:00Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "codeErreur": "VALIDATION_ERROR",
  "message": "Validation failed: Societe is required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "codeErreur": "NOT_FOUND",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "codeErreur": "INTERNAL_ERROR",
  "message": "An unexpected error occurred"
}
```

---

## Common Validation Rules

### All Requests
- `societe` (string): Required, max 2 characters, format: uppercase letters

### Command-Specific Rules
- **BackupConfig**: description max 255 chars
- **RestoreConfig**: ConfirmRestore must be true
- **ExportData**: Format must be CSV|XML|JSON|EXCEL, date range valid
- **ImportData**: FilePath required, max 255 chars
- **PurgeData**: RetentionDays 1-3650, ConfirmPurge must be true
- **MaintenanceDb**: Type must be FULL|ANALYZE|REBUILD|OPTIMIZE
- **PrintTicket**: Items required (min 1), MontantTotal >= 0

---

## Example cURL Commands

### Initialize Utilities
```bash
curl -X POST http://localhost:5000/api/utilitaires/init \
  -H "Content-Type: application/json" \
  -d '{"societe":"CS","codeUtilisateur":"ADMIN"}'
```

### Create Backup
```bash
curl -X POST http://localhost:5000/api/utilitaires/backup \
  -H "Content-Type: application/json" \
  -d '{"societe":"CS","description":"Daily backup","includeDatabase":true}'
```

### View Error Logs
```bash
curl -X GET "http://localhost:5000/api/utilitaires/logs?levelFilter=ERROR&limit=50"
```

### Get System Info
```bash
curl -X GET http://localhost:5000/api/utilitaires/system-info
```

### Print Ticket
```bash
curl -X POST http://localhost:5000/api/utilitaires/print-ticket \
  -H "Content-Type: application/json" \
  -d @ticket_payload.json
```

---

## Integration Notes

1. All endpoints are async and support cancellation tokens
2. OpenAPI/Swagger documentation available at `/swagger`
3. Requires authentication for maintenance operations (not implemented)
4. All timestamps in UTC (ISO 8601 format)
5. File operations use simulated paths; implement actual storage handling

---

**Last Updated**: 2025-12-28
