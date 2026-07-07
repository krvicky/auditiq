/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Invoice {
  id: string;
  vendor: string;
  region: string;
  amount: number;
  status: 'Cleared' | 'Query Raised' | 'Pending' | 'In Review' | 'Audit Failed' | 'Validation Failed';
  aging: number;
  costOffice: string;
  yardCode: string;
  yard: string;
  depot: string;
  csrNo: string;
  issueDate: string;
  confirmDate: string;
  issueVsConfirm: number;
  vvd: string;
  atbDate: string;
  confirmVsAtb: number;
  issueVsAtb: number;
  costCode: string;
  remark: string;
  categorization: string;
  costCodeCategorization: string;
  contractRate: number;
  currency: string;
  autoRate: number;
  manualRate: number;
  invoiceType?: 'TES' | 'PSO' | 'TRS';
  auditPassed?: number;
  auditFailed?: number;
  auditUnvalidated?: number;
  auditTotal?: number;
}

export type Screen = 'queue' | 'case' | 'dashboard' | 'alerts' | 'config' | 'artefacts' | 'logs';

// --- API response types ---

export interface ApiInvoice {
  row_serial: string;
  invoice_no: string | null;
  cost_office: string | null;
  vendor: string | null;
  vvd: string | null;
  depot_type: string | null;
  contract_rate: number | null;
  issue_date: string | null;
  cost_code: string | null;
  manual_value: number | null;
  audit_status: 'All Clear' | 'Audit Failed' | 'Validation Failed' | 'Pending' | 'Query Raised';
  audit_passed: number;
  audit_failed: number;
  audit_unvalidated: number;
  audit_total: number;
}

export interface ApiCheck {
  check_number: number;
  check_name: string;
  status: 'Passed' | 'Failed' | 'Validation Failed';
  detail: string | null;
  ai_category: string | null;
}

export interface ApiResolution {
  id: number;
  row_serial: string;
  check_number: number;
  resolution_type: string;
  resolution_note: string | null;
  original_status: string | null;
  resolved_by: string;
  resolved_at: string;
}

export interface ApiComment {
  id: number;
  row_serial: string;
  check_number: number;
  comment_text: string;
  commented_by: string;
  commented_at: string;
}

export interface ApiInvoiceDetail extends ApiInvoice {
  depot_type: string | null;
  calc_remark: string | null;
  yard_code: string | null;
  csr_no: string | null;
  atb_date: string | null;
  currency: string | null;
  created_at: string | null;
  checks: ApiCheck[];
  resolutions: ApiResolution[];
}

export interface ApiStats {
  total: number;
  cleared: number;
  auditFailed: number;
  validationFailed: number;
  pending: number;
}

export interface ApiAlertCard {
  row_serial: string;
  invoice_no: string | null;
  cost_office: string | null;
  vendor: string | null;
  cost_code: string | null;
  manual_value: number | null;
  aging: number;
  audit_status?: string;
  failedChecks?: {
    check_number: number;
    check_name: string;
    status: string;
    detail: string | null;
    resolution_id: number | null;
    resolution_type: string | null;
    original_status: string | null;
  }[];
  threads?: { check_number: number; resolution_note: string | null; resolved_at: string }[];
}

export interface ApiAlertsResponse {
  tab: string;
  kpi: {
    totalRequiringAction: number;
    awaitingResponse: number;
    avgAging: number;
  };
  cards: ApiAlertCard[];
}
