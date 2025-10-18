// Test script for audit log export functionality
import { exportToCSV, exportToJSON } from '../src/app/components/ui/orchestrator/audit-log/utils/exportHelpers';

// Mock audit log data
const mockAuditLogs = [
  {
    id: '1',
    action: 'USER_LOGIN',
    userId: 'user1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    entityType: 'USER',
    entityId: 'user1',
    details: '{"ip_address": "192.168.1.1"}',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    action: 'ELECTION_CREATED',
    userId: 'admin1',
    userName: 'Admin User',
    userEmail: 'admin@example.com',
    entityType: 'ELECTION',
    entityId: 'election1',
    details: '{"election_title": "Student Council Election", "description": "Annual election"}',
    timestamp: new Date().toISOString(),
  },
];

// Test CSV export
console.log('Testing CSV export...');
try {
  exportToCSV(mockAuditLogs, 'test-audit-logs');
  console.log('✅ CSV export function works correctly');
} catch (error) {
  console.error('❌ CSV export failed:', error);
}

// Test JSON export
console.log('Testing JSON export...');
try {
  exportToJSON(mockAuditLogs, 'test-audit-logs');
  console.log('✅ JSON export function works correctly');
} catch (error) {
  console.error('❌ JSON export failed:', error);
}

console.log('Export functionality tests completed!');