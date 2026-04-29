/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Search, 
  Mail, 
  Settings, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  FileText,
  ExternalLink,
  MoreVertical,
  ArrowRight,
  ChevronRight,
  ArrowUpDown,
  Filter,
  Lock,
  Calendar,
  Play,
  X,
  Check,
  User,
  ChevronDown,
  ChevronUp,
  Undo2,
  Info,
  Bell,
  Clock,
  TrendingUp,
  TrendingDown,
  Archive,
  Terminal,
  ArrowUpRight,
  FileUp,
  MessageSquare,
  Send,
  Edit3,
  Paperclip
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Invoice, Screen, ApiInvoice, ApiInvoiceDetail, ApiStats, ApiAlertsResponse, ApiAlertCard } from './types';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const INVOICES: Invoice[] = [
  { 
    id: 'INV-2026-5001', 
    vendor: 'Maersk Line', 
    region: 'North Europe', 
    amount: 12500, 
    status: 'Cleared', 
    aging: 2,
    costOffice: 'HAM-01',
    yardCode: 'HAM-02',
    yard: 'CTA Terminal',
    depot: 'Depot I',
    csrNo: 'CSR-1001',
    issueDate: '2026-03-15',
    confirmDate: '2026-03-17',
    issueVsConfirm: 2,
    vvd: 'MAERSK-077N',
    atbDate: '2026-03-13',
    confirmVsAtb: 4,
    issueVsAtb: 2,
    costCode: '5044',
    remark: "Standard terminal handling charges verified against LMS agreement REF-2026-A.",
    categorization: 'cleared',
    costCodeCategorization: 'Ancillary Cost',
    contractRate: 110,
    currency: 'USD',
    autoRate: 110,
    manualRate: 110,
    invoiceType: 'TES',
    auditPassed: 15,
    auditFailed: 0,
    auditUnvalidated: 0,
    auditTotal: 15
  },
  { 
    id: 'INV-2026-5002', 
    vendor: 'COSCO Shipping', 
    region: 'China', 
    amount: 8400, 
    status: 'Cleared', 
    aging: 1,
    costOffice: 'SHA-08',
    yardCode: 'SHA-08',
    yard: 'Yangshan Terminal',
    depot: 'Depot F',
    csrNo: 'CSR-1002',
    issueDate: '2026-03-18',
    confirmDate: '2026-03-19',
    issueVsConfirm: 1,
    vvd: 'COSCO-099W',
    atbDate: '2026-03-16',
    confirmVsAtb: 3,
    issueVsAtb: 2,
    costCode: '5060',
    remark: "Port service order charges matched with electronic data interchange (EDI) records.",
    categorization: 'cleared',
    costCodeCategorization: 'Adjustment Cost',
    contractRate: 200,
    currency: 'USD',
    autoRate: 200,
    manualRate: 200,
    invoiceType: 'PSO',
    auditPassed: 9,
    auditFailed: 0,
    auditUnvalidated: 0,
    auditTotal: 9
  },
  { 
    id: 'INV-2026-5003', 
    vendor: 'Hapag Lloyd', 
    region: 'Brazil', 
    amount: 3200, 
    status: 'Cleared', 
    aging: 3,
    costOffice: 'SAN-05',
    yardCode: 'SAN-05',
    yard: 'Santos Container Terminal',
    depot: 'Depot B',
    csrNo: 'CSR-1003',
    issueDate: '2026-03-14',
    confirmDate: '2026-03-17',
    issueVsConfirm: 3,
    vvd: 'HAPAG-022W',
    atbDate: '2026-03-12',
    confirmVsAtb: 5,
    issueVsAtb: 2,
    costCode: '5044',
    remark: "Transport service request verified against regional trucking tariff.",
    categorization: 'cleared',
    costCodeCategorization: 'Fixed Cost',
    contractRate: 52,
    currency: 'USD',
    autoRate: 52,
    manualRate: 52,
    invoiceType: 'TRS',
    auditPassed: 8,
    auditFailed: 0,
    auditUnvalidated: 0,
    auditTotal: 8
  },
  { 
    id: 'INV-2026-5004', 
    vendor: 'MSC Agencies', 
    region: 'Europe', 
    amount: 15700, 
    status: 'Audit Failed', 
    aging: 5,
    costOffice: 'ROT-02',
    yardCode: 'ROT-02',
    yard: 'ECT Delta Terminal',
    depot: 'Depot C',
    csrNo: 'CSR-1004',
    issueDate: '2026-03-10',
    confirmDate: '2026-03-15',
    issueVsConfirm: 5,
    vvd: 'MSC-088N',
    atbDate: '2026-03-08',
    confirmVsAtb: 7,
    issueVsAtb: 2,
    costCode: '5044',
    remark: "Rate mismatch identified in terminal handling. LMS rate $110 vs Invoice rate $115. Multiple line items affected.",
    categorization: 'rate mismatch',
    costCodeCategorization: 'Ancillary Cost',
    contractRate: 110,
    currency: 'USD',
    autoRate: 110,
    manualRate: 115,
    invoiceType: 'TES',
    auditPassed: 11,
    auditFailed: 3,
    auditUnvalidated: 1,
    auditTotal: 15
  },
  { 
    id: 'INV-2026-5005', 
    vendor: 'CMA CGM', 
    region: 'India', 
    amount: 9750, 
    status: 'Validation Failed', 
    aging: 4,
    costOffice: 'NSI-01',
    yardCode: 'NSI-01',
    yard: 'JNPT Terminal',
    depot: 'Depot D',
    csrNo: 'CSR-1005',
    issueDate: '2026-03-12',
    confirmDate: '2026-03-16',
    issueVsConfirm: 4,
    vvd: 'CMA-044S',
    atbDate: '2026-03-10',
    confirmVsAtb: 6,
    issueVsAtb: 2,
    costCode: '5021',
    remark: "Unable to validate sliding scale tier. Volume data for February not yet synced from local terminal system.",
    categorization: 'validation failed',
    costCodeCategorization: 'Variable Cost',
    contractRate: 45,
    currency: 'USD',
    autoRate: 45,
    manualRate: 45,
    invoiceType: 'TES',
    auditPassed: 13,
    auditFailed: 0,
    auditUnvalidated: 2,
    auditTotal: 15
  },
  // Adding 30 more invoices
  ...Array.from({ length: 30 }, (_, i) => {
    const idNum = 5006 + i;
    const types: ('TES' | 'PSO' | 'TRS')[] = ['TES', 'PSO', 'TRS'];
    const type = types[i % 3];
    const statuses: ('Cleared' | 'Audit Failed' | 'Validation Failed')[] = ['Cleared', 'Audit Failed', 'Validation Failed'];
    const status = i % 5 === 0 ? 'Audit Failed' : (i % 7 === 0 ? 'Validation Failed' : 'Cleared');
    
    let passed = 0, failed = 0, unvalidated = 0, total = 0;
    if (type === 'TES') { total = 15; }
    else if (type === 'PSO') { total = 9; }
    else { total = 8; }

    if (status === 'Cleared') {
      passed = total;
    } else if (status === 'Audit Failed') {
      failed = Math.floor(Math.random() * 3) + 1;
      unvalidated = Math.floor(Math.random() * 2);
      passed = total - failed - unvalidated;
    } else {
      unvalidated = Math.floor(Math.random() * 3) + 1;
      passed = total - unvalidated;
    }

    const vendors = ['Maersk Line', 'COSCO Shipping', 'Hapag Lloyd', 'MSC Agencies', 'CMA CGM', 'Evergreen', 'ONE Line', 'Yang Ming'];
    const offices = ['HAM-01', 'SHA-08', 'SAN-05', 'ROT-02', 'NSI-01', 'DXB-01', 'SIN-03', 'HKG-04'];

    return {
      id: `INV-2026-${idNum}`,
      vendor: vendors[i % vendors.length],
      region: 'Global',
      amount: 5000 + (Math.random() * 20000),
      status: status as any,
      aging: Math.floor(Math.random() * 10),
      costOffice: offices[i % offices.length],
      yardCode: 'YARD-X',
      yard: 'Terminal X',
      depot: 'Depot X',
      csrNo: `CSR-${2000 + i}`,
      issueDate: '2026-03-20',
      confirmDate: '2026-03-22',
      issueVsConfirm: 2,
      vvd: 'VESS-001',
      atbDate: '2026-03-18',
      confirmVsAtb: 4,
      issueVsAtb: 2,
      costCode: '5000',
      remark: "Automated audit entry for volume testing.",
      categorization: status.toLowerCase(),
      costCodeCategorization: 'Operational Cost',
      contractRate: 100,
      currency: 'USD',
      autoRate: 100,
      manualRate: status === 'Audit Failed' ? 110 : 100,
      invoiceType: type,
      auditPassed: passed,
      auditFailed: failed,
      auditUnvalidated: unvalidated,
      auditTotal: total
    };
  })
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('queue');
  const [selectedRowSerial, setSelectedRowSerial] = useState<string>('');

  const navigateToCase = useCallback((rowSerial: string) => {
    setSelectedRowSerial(rowSerial);
    setCurrentScreen('case');
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard onNavigateToAlerts={() => setCurrentScreen('alerts')} />;
      case 'queue':
        return <InvoiceQueue onSelectInvoice={navigateToCase} />;
      case 'case':
        return <CaseView rowSerial={selectedRowSerial} onBack={() => setCurrentScreen('queue')} />;
      case 'alerts':
        return <AlertsEscalation onNavigateToCase={navigateToCase} />;
      case 'config':
        return <AuditConfiguration />;
      case 'artefacts':
        return <ArtefactsView />;
      case 'logs':
        return <LogsView />;
      default:
        return <Dashboard onNavigateToAlerts={() => setCurrentScreen('alerts')} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] text-white flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center font-bold text-xl text-navy-900">
            PL
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">AuditIQ</h1>
            <p className="text-xs text-slate-400">Pacific Lines</p>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={currentScreen === 'dashboard'} 
            onClick={() => setCurrentScreen('dashboard')} 
          />
          <SidebarItem 
            icon={<ClipboardList size={20} />} 
            label="Invoice Queue" 
            active={currentScreen === 'queue'} 
            onClick={() => setCurrentScreen('queue')} 
          />
          <SidebarItem 
            icon={<Search size={20} />} 
            label="Case View" 
            active={currentScreen === 'case'} 
            onClick={() => setCurrentScreen('case')} 
          />
          <SidebarItem 
            icon={<Mail size={20} />} 
            label="Alerts & Escalation" 
            active={currentScreen === 'alerts'} 
            onClick={() => setCurrentScreen('alerts')} 
          />
          <SidebarItem 
            icon={<Settings size={20} />} 
            label="Audit Configuration" 
            active={currentScreen === 'config'} 
            onClick={() => setCurrentScreen('config')} 
          />
          <SidebarItem 
            icon={<Archive size={20} />} 
            label="Artefacts" 
            active={currentScreen === 'artefacts'} 
            onClick={() => setCurrentScreen('artefacts')} 
          />
          <SidebarItem 
            icon={<Terminal size={20} />} 
            label="Logs" 
            active={currentScreen === 'logs'} 
            onClick={() => setCurrentScreen('logs')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
            <User size={16} className="text-slate-300" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">Audit Team — India</p>
            <p className="text-[10px] text-slate-400 truncate">vignesh.rajakuma@pacificlines.com</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active 
          ? 'bg-amber-500 text-navy-900 shadow-lg shadow-amber-500/20' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// --- SCREEN 1: INVOICE QUEUE ---
function InvoiceQueue({ onSelectInvoice }: { onSelectInvoice: (serial: string) => void }) {
  const [invoices, setInvoices] = useState<ApiInvoice[]>([]);
  const [stats, setStats] = useState<ApiStats>({ total: 0, cleared: 0, auditFailed: 0, validationFailed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCostOffice, setFilterCostOffice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [uploadPhase, setUploadPhase] = useState<'idle' | 'uploading' | 'auditing' | 'done'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [auditProcessed, setAuditProcessed] = useState(0);
  const [auditTotal, setAuditTotal] = useState(0);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async (p = 1, status = filterStatus, costOffice = filterCostOffice, search = searchQuery) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '50' });
      if (status) params.append('status', status);
      if (costOffice) params.append('costOffice', costOffice);
      if (search) params.append('search', search);
      const [invRes, statsRes] = await Promise.all([
        fetch(`/api/invoices?${params}`),
        fetch('/api/stats'),
      ]);
      const invData = await invRes.json();
      const statsData = await statsRes.json();
      setInvoices(invData.rows || []);
      setTotalPages(invData.totalPages || 1);
      setStats({
        total:           statsData.total           ?? 0,
        cleared:         statsData.cleared         ?? 0,
        auditFailed:     statsData.auditFailed     ?? 0,
        validationFailed:statsData.validationFailed?? 0,
        pending:         statsData.pending         ?? 0,
      });
    } catch (e) {
      console.error('Failed to fetch invoices', e);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterCostOffice, searchQuery]);

  useEffect(() => { fetchData(1); }, []);

  const handleFilterChange = (status: string, costOffice: string, search: string) => {
    setFilterStatus(status);
    setFilterCostOffice(costOffice);
    setSearchQuery(search);
    setPage(1);
    fetchData(1, status, costOffice, search);
  };

  const startPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/audit/status');
        const prog = await res.json();
        if (prog.status === 'running') {
          setUploadPhase('auditing');
          setUploadMessage(`Running audit engine… (${prog.processed} / ${prog.total} rows)`);
          setAuditProcessed(prog.processed);
          setAuditTotal(prog.total);
        } else if (prog.status === 'done') {
          clearInterval(pollRef.current!);
          setUploadPhase('done');
          setUploadMessage(`Done — ${prog.total} rows processed`);
          setAuditProcessed(prog.total);
          setAuditTotal(prog.total);
          await fetchData(1, '', '', '');
          setFilterStatus(''); setFilterCostOffice(''); setSearchQuery(''); setSearchInput('');
          setTimeout(() => setUploadPhase('idle'), 3000);
        }
      } catch { /* ignore */ }
    }, 1000);
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setShowTypeModal(false);
    setUploadPhase('uploading');
    setUploadMessage('Uploading file…');
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.error) {
        setUploadPhase('idle');
        alert(`Upload failed: ${data.message}`);
        return;
      }
      setUploadMessage(`Parsed ${data.rowCount} rows. Running audit engine…`);
      setAuditTotal(data.rowCount);
      setAuditProcessed(0);
      startPolling();
    } catch (err) {
      // Network-level failure — server may still have processed the file.
      // Start polling so any completed audit data gets picked up and displayed.
      alert(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
      setUploadMessage('Checking for results…');
      startPolling();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Invoice Queue - Audited invoices</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowTypeModal(true)}
            disabled={uploadPhase !== 'idle'}
            className="btn-amber flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileUp size={16} /> Upload Invoice File
          </button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xlsm" className="hidden" onChange={handleFileSelected} />
        </div>
      </div>

      {/* Upload / Audit Progress Bar */}
      {uploadPhase !== 'idle' && (
        <div className={`mb-6 rounded-xl border p-4 shadow-sm ${uploadPhase === 'done' ? 'bg-green-50 border-green-200' : 'bg-white border-amber-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {uploadPhase !== 'done' ? (
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <Check size={10} className="text-white" />
                </div>
              )}
              <span className="text-sm font-semibold text-slate-700">
                {uploadPhase === 'uploading' && 'Uploading and parsing file…'}
                {uploadPhase === 'auditing' && 'Running AI audit classification…'}
                {uploadPhase === 'done' && 'Audit complete'}
              </span>
            </div>
            <span className="text-sm font-medium text-slate-500">
              {uploadPhase === 'auditing' && `${auditProcessed} / ${auditTotal} rows`}
              {uploadPhase === 'done' && `${auditTotal} rows processed`}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${uploadPhase === 'done' ? 'bg-green-500' : 'bg-amber-500'}`}
              style={{
                width: uploadPhase === 'uploading' ? '4%'
                  : uploadPhase === 'done' ? '100%'
                  : auditTotal > 0 ? `${Math.max(4, Math.round((auditProcessed / auditTotal) * 100))}%`
                  : '4%',
              }}
            />
          </div>
          {uploadPhase === 'auditing' && auditTotal > 0 && (
            <p className="text-xs text-slate-400 mt-1.5">
              {Math.round((auditProcessed / auditTotal) * 100)}% complete — classifying calc remarks in batches of 20
            </p>
          )}
        </div>
      )}

      {/* KPI Tiles */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <KPITile label="Total Invoices" value={String(stats.total)} color="bg-slate-100 text-slate-700 border-slate-200" />
        <KPITile label="Invoices Cleared All Audit Checks" value={String(stats.cleared)} color="bg-green-50 text-green-700 border-green-200" />
        <KPITile label="Invoices with Audit Failed" value={String(stats.auditFailed)} color="bg-red-50 text-red-700 border-red-200" />
        <KPITile label="Invoices with Validation Failed" value={String(stats.validationFailed)} color="bg-amber-50 text-amber-700 border-amber-200" />
      </div>

      <div>
        {/* Horizontal invoice type tabs */}
        <div className="flex gap-2 mb-4">
          {(['TES', 'TRS', 'PSO'] as const).map(type => (
            <div
              key={type}
              className={`px-5 py-2 rounded-lg border-2 text-xs font-bold flex items-center gap-2 select-none transition-all ${
                type === 'TES'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                  : 'bg-white text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
            >
              {type}
              {type !== 'TES' && (
                <span className="text-[9px] font-normal bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">Soon</span>
              )}
            </div>
          ))}
        </div>
      {/* Empty State */}
      {!loading && invoices.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
            <FileUp size={36} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No invoices yet</h3>
          <p className="text-slate-500 mb-6">Upload a TES Excel file (.xlsx or .xlsm) to begin the audit</p>
          <button onClick={() => setShowTypeModal(true)} className="btn-amber inline-flex items-center gap-2">
            <FileUp size={16} /> Upload Invoice File
          </button>
        </div>
      )}

      {/* Table */}
      {(loading || invoices.length > 0) && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <select
                value={filterStatus}
                onChange={e => handleFilterChange(e.target.value, filterCostOffice, searchQuery)}
                className="bg-white border border-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="">Status: All</option>
                <option value="All Clear">All Clear</option>
                <option value="Audit Failed">Audit Failed</option>
                <option value="Validation Failed">Validation Failed</option>
              </select>
            </div>
            <form className="flex-1 flex items-center gap-2" onSubmit={e => { e.preventDefault(); handleFilterChange(filterStatus, filterCostOffice, searchInput); }}>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search by Row Serial or Invoice No…"
                  className="w-full pl-10 pr-4 py-1.5 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <button type="submit" className="px-3 py-1.5 bg-slate-700 text-white rounded text-sm font-medium hover:bg-slate-800 transition-colors">Search</button>
            </form>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Loading invoices…</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold text-center">
                    <th rowSpan={2} className="w-32 px-4 py-3 border-b border-r border-slate-200 text-left">Row Serial</th>
                    <th rowSpan={2} className="w-36 px-4 py-3 border-b border-r border-slate-200 text-left">Invoice No</th>
                    <th colSpan={4} className="px-4 py-2 border-b border-r border-slate-200">Audit Checks</th>
                    <th rowSpan={2} className="w-36 px-4 py-3 border-b border-r border-slate-200 text-left">Audit Status</th>
                    <th rowSpan={2} className="px-4 py-3 border-b border-r border-slate-200 text-right">Action</th>
                    <th rowSpan={2} className="px-4 py-3 border-b border-r border-slate-200 text-left">Cost Office</th>
                    <th rowSpan={2} className="w-24 px-3 py-3 border-b border-r border-slate-200 text-left">VVD</th>
                    <th rowSpan={2} className="px-4 py-3 border-b border-r border-slate-200 text-left">Contract Rate</th>
                    <th rowSpan={2} className="px-4 py-3 border-b border-slate-200 text-left">Cost Code</th>
                  </tr>
                  <tr className="bg-slate-50 text-slate-400 text-[9px] uppercase tracking-wider font-bold text-center">
                    <th className="px-4 py-2 border-b border-r border-slate-200">Passed</th>
                    <th className="px-4 py-2 border-b border-r border-slate-200">Failed</th>
                    <th className="px-4 py-2 border-b border-r border-slate-200">Unvalidated</th>
                    <th className="px-4 py-2 border-b border-r border-slate-200">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.row_serial} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-4 font-mono text-sm font-medium text-navy-900 border-r border-slate-100">{inv.row_serial}</td>
                      <td className="px-4 py-4 text-sm text-slate-600 border-r border-slate-100 truncate max-w-[144px]">{inv.invoice_no || '—'}</td>
                      <td className="px-4 py-4 text-sm text-center font-semibold text-green-600 border-r border-slate-100">{inv.audit_passed}</td>
                      <td className="px-4 py-4 text-sm text-center font-semibold text-red-600 border-r border-slate-100">{inv.audit_failed}</td>
                      <td className="px-4 py-4 text-sm text-center font-semibold text-amber-600 border-r border-slate-100">{inv.audit_unvalidated}</td>
                      <td className="px-4 py-4 text-sm text-center font-bold text-slate-700 border-r border-slate-100">{inv.audit_total}</td>
                      <td className="px-6 py-4 text-sm border-r border-slate-100"><AuditStatusBadge status={inv.audit_status} /></td>
                      <td className="px-6 py-4 text-right border-r border-slate-100">
                        <button
                          onClick={() => onSelectInvoice(inv.row_serial)}
                          className="text-amber-600 hover:text-amber-700 font-medium text-sm inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                        >
                          View <ArrowRight size={14} />
                        </button>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 border-r border-slate-100">{inv.cost_office || '—'}</td>
                      <td className="px-3 py-4 text-sm text-slate-600 border-r border-slate-100">{inv.vvd ?? '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 border-r border-slate-100">{inv.contract_rate != null ? inv.contract_rate.toFixed(2) : '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">{inv.cost_code || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => { const p = Math.max(1, page - 1); setPage(p); fetchData(p); }}
                disabled={page === 1}
                className="px-3 py-1.5 border border-slate-200 rounded text-sm text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                ← Prev
              </button>
              <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
              <button
                onClick={() => { const p = Math.min(totalPages, page + 1); setPage(p); fetchData(p); }}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-slate-200 rounded text-sm text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
      </div>

      {/* Invoice Type Modal */}
      <AnimatePresence>
        {showTypeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTypeModal(false)}
              className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-navy-900">Select Invoice Type</h3>
                <button onClick={() => setShowTypeModal(false)} className="text-slate-400 hover:text-navy-900"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-3">
                {(['TES', 'TRS', 'PSO'] as const).map(type => (
                  <div
                    key={type}
                    className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                      type === 'TES'
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-slate-100 bg-slate-50 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-4 ${type === 'TES' ? 'border-amber-500 bg-white' : 'border-slate-300 bg-white'}`} />
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${type === 'TES' ? 'text-amber-800' : 'text-slate-400'}`}>{type}</p>
                      <p className="text-[11px] text-slate-500">
                        {type === 'TES' ? 'Terminal Equipment Service — 4 checks' : 'Not available in this PoC'}
                      </p>
                    </div>
                    {type === 'TES'
                      ? <button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors"
                        >Choose File</button>
                      : <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded font-bold">Coming Soon</span>
                    }
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KPITile({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className={`p-4 rounded-xl border ${color} shadow-sm`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function AuditStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'All Clear':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full whitespace-nowrap bg-green-100 text-green-700 text-[10px] font-bold border border-green-200">✅ All Clear</span>;
    case 'Audit Failed':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full whitespace-nowrap bg-red-100 text-red-700 text-[10px] font-bold border border-red-200">❌ Audit Failed</span>;
    case 'Validation Failed':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full whitespace-nowrap bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200">⚠️ Validation Failed</span>;
    case 'Query Raised':
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full whitespace-nowrap bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200">📨 Query Raised</span>;
    default:
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full whitespace-nowrap bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">{status}</span>;
  }
}

function StatusPill({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${color}`}>
      <span>{label}:</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

// --- SCREEN 2: CASE VIEW ---
const CHECKLIST_ITEMS = {
  TES: [
    "Incorrect dates", "Terminal having FD code", "Depot having ND code", "positive in ADJ invoice", 
    "positive in DC Code", "> 180 days", "Common VVD", "Wrong Currency", "Wrong cost code", 
    "Auto code in manual", "Wrong Rate", "Wrong UI", "Wrong / Excess costing", "Manual verification", 
    "Partner vesser re-stow"
  ],
  PSO: [
    "Late Billing", "Common VVD", "Wrong Currency", "Wrong Cost codes", "Wrong Rate", 
    "Wrong UI", "Wrong / Excess Costing", "Manual Verification", "Tariff"
  ],
  TRS: [
    "Additional column", "Negotaited Column", "Unplanned", "Other SO", "Supplementry", 
    "Fuel", "Wrong Currency", "Wrong Cost mode"
  ]
};

function CaseView({ rowSerial, onBack }: { rowSerial: string, onBack: () => void }) {
  const [detail, setDetail] = useState<ApiInvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [selectedCheckNum, setSelectedCheckNum] = useState<number | null>(null);
  const [resolutionType, setResolutionType] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [emailTo, setEmailTo] = useState('vendor.ops@pacificlines.com');
  const [emailCc, setEmailCc] = useState('audit.india@pacificlines.com');
  const [emailBody, setEmailBody] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/invoices/${rowSerial}`);
      const data: ApiInvoiceDetail = await res.json();
      setDetail(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [rowSerial]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const selectedCheck = detail?.checks.find(c => c.check_number === selectedCheckNum) ?? null;

  useEffect(() => {
    if (!selectedCheck || !detail) return;
    setEmailBody(
      `Dear Team,\n\nWe have identified an issue in row ${detail.row_serial} (Invoice: ${detail.invoice_no || 'N/A'}).\n\nCheck: ${selectedCheck.check_name}\nCost Code: ${detail.cost_code || 'N/A'}\nDetail: ${selectedCheck.detail || 'N/A'}\n\nPlease review and respond.\n\nRegards,\nAudit Team`
    );
  }, [selectedCheckNum]);

  const handleSendEmail = async () => {
    if (!detail || !selectedCheck) return;
    setActionLoading(true);
    try {
      await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowSerial: detail.row_serial,
          checkNumber: selectedCheck.check_number,
          to: emailTo,
          cc: emailCc,
          body: emailBody,
        }),
      });
      // Stay on Case View — don't close the panel; let it re-render with Query Sent state
      await fetchDetail();
    } catch {
      // ignore network errors
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsPassed = async () => {
    if (!detail || !selectedCheck || !resolutionType) return;
    setActionLoading(true);
    try {
      await fetch('/api/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowSerial: detail.row_serial,
          checkNumber: selectedCheck.check_number,
          type: resolutionType,
          note: resolutionNotes || null,
        }),
      });
      setResolutionType('');
      setResolutionNotes('');
      setSelectedCheckNum(null);
      await fetchDetail();
    } finally {
      setActionLoading(false);
    }
  };

  const handleUndo = async (resolutionId: number) => {
    setActionLoading(true);
    try {
      await fetch('/api/resolve/undo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolutionId }),
      });
      await fetchDetail();
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-1 text-slate-500 hover:text-navy-900 text-sm font-medium transition-colors mb-6">
          <ChevronLeft size={16} /> Back to Queue
        </button>
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-1 text-slate-500 hover:text-navy-900 text-sm font-medium transition-colors mb-6">
          <ChevronLeft size={16} /> Back to Queue
        </button>
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Search size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-lg font-bold text-navy-900">Invoice Not Found</h3>
          <p className="text-slate-500">Row {rowSerial} was not found in the database.</p>
        </div>
      </div>
    );
  }

  const ageing = 0;
  const contention = (detail.audit_status === 'Audit Failed' || detail.audit_status === 'Validation Failed')
    ? Math.abs(detail.manual_value || 0).toFixed(2)
    : '0.00';
  const passedCount = detail.checks.filter(c => c.status === 'Passed').length;
  const failedCount = detail.checks.filter(c => c.status === 'Failed').length;
  const unvalidatedCount = detail.checks.filter(c => c.status === 'Validation Failed').length;
  const totalCount = detail.checks.length;
  const statusColor = detail.audit_status === 'All Clear' ? 'text-green-700' : detail.audit_status === 'Audit Failed' ? 'text-red-700' : detail.audit_status === 'Query Raised' ? 'text-blue-700' : 'text-amber-700';
  const statusDot = detail.audit_status === 'All Clear' ? 'bg-green-500' : detail.audit_status === 'Audit Failed' ? 'bg-red-500' : detail.audit_status === 'Query Raised' ? 'bg-blue-500' : 'bg-amber-500';

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-5xl mx-auto pb-24">
          <div className="flex items-center justify-between mb-8">
            <button onClick={onBack} className="flex items-center gap-1 text-slate-500 hover:text-navy-900 text-sm font-medium transition-colors">
              <ChevronLeft size={16} /> Back to Queue
            </button>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{detail.row_serial}</div>
          </div>

          {/* Header Tiles */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Audit Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${statusDot}`}></div>
                <p className={`font-bold ${statusColor}`}>{detail.audit_status}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Checks (P/F/U/T)</p>
              <p className="font-bold text-slate-700">{passedCount} / {failedCount} / {unvalidatedCount} / {totalCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Amount in Contention</p>
              <p className="font-bold text-navy-900">{detail.currency || 'USD'} {contention}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Ageing</p>
              <p className="font-bold text-slate-700">{ageing} Days</p>
            </div>
          </div>

          {/* Invoice Details Section */}
          <div className="mb-8">
            <button
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-navy-900 transition-colors mb-4"
            >
              Invoice Details {isDetailsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <AnimatePresence>
              {isDetailsExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-4">
                    {/* Group 1: Invoice Identity */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Invoice Identity</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="Invoice No" value={detail.invoice_no || '—'} />
                        <DetailItem label="Vendor" value={detail.vendor || '—'} />
                        <DetailItem label="Cost Office" value={detail.cost_office || '—'} />
                        <DetailItem label="CSR No" value={detail.csr_no || '—'} />
                      </div>
                    </div>
                    {/* Group 2: Vessel & Voyage */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Vessel & Voyage</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="VVD" value={detail.vvd || '—'} />
                        <DetailItem label="Yard Code" value={detail.yard_code || '—'} />
                        <DetailItem label="Depot Type" value={detail.depot_type || '—'} />
                        <DetailItem label="ATB Date" value={detail.atb_date || '—'} />
                      </div>
                    </div>
                    {/* Group 3: Dates & Reference */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Dates & Reference</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="Invoice Confirm Date" value={detail.issue_date || '—'} />
                        <DetailItem label="Row Serial" value={detail.row_serial} />
                        <div className="col-span-2">
                          <DetailItem label="Calc Remark" value={detail.calc_remark || '—'} />
                        </div>
                      </div>
                    </div>
                    {/* Group 4: Cost & Financials */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Cost & Financials</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="Cost Code" value={detail.cost_code || '—'} />
                        <DetailItem label="Currency" value={detail.currency || '—'} />
                        <DetailItem label="Contract Rate" value={detail.contract_rate != null ? String(detail.contract_rate) : '—'} />
                        <DetailItem label="Manual Value" value={detail.manual_value != null ? String(detail.manual_value) : '—'} highlight />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Audit Checklist Panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50">
              <h4 className="text-sm font-bold text-slate-700">Audit Checklist — TES</h4>
            </div>
            <div className="divide-y divide-slate-100">
              {detail.checks.map((check) => {
                const resolution = detail.resolutions.find(r => r.check_number === check.check_number && r.resolution_type !== 'email_sent' && r.resolution_type !== 'undone');
                const isManuallyResolved = !!resolution;
                const hasEmailQuery = detail.resolutions.some(r => r.check_number === check.check_number && r.resolution_type === 'email_sent');
                const displayStatus = isManuallyResolved ? 'Passed' : check.status;
                return (
                  <button
                    key={check.check_number}
                    onClick={() => { setSelectedCheckNum(check.check_number); setResolutionType(''); setResolutionNotes(''); }}
                    className={`w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors text-left ${selectedCheckNum === check.check_number ? 'bg-slate-50 ring-1 ring-inset ring-amber-500/20' : ''}`}
                  >
                    <span className="text-sm font-medium text-slate-700">{check.check_name}</span>
                    <div className="flex items-center gap-2">
                      {hasEmailQuery && !isManuallyResolved && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">📨 Query Sent</span>}
                      {displayStatus === 'Passed' && !isManuallyResolved && (
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">✅ Passed</span>
                      )}
                      {isManuallyResolved && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">✅ Manually Resolved</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleUndo(resolution!.id); }}
                            disabled={actionLoading}
                            className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 hover:bg-amber-100 disabled:opacity-40 transition-colors"
                          >
                            ↩ Undo
                          </button>
                        </div>
                      )}
                      {displayStatus === 'Failed' && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">❌ Failed</span>}
                      {displayStatus === 'Validation Failed' && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">⚠️ Unvalidated</span>}
                      {displayStatus === 'Not Applicable' && <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">— N/A</span>}
                    </div>
                  </button>
                );
              })}
              {/* Coming-soon checks */}
              {[
                'Incorrect dates',
                'Positive in ADJ invoice',
                '> 180 days',
                'Common VVD',
                'Wrong currency',
                'Wrong cost code',
                'Wrong rate',
                'Wrong UI',
                'Wrong / Excess costing',
                'Manual verification',
                'Partner vessel re-stow',
              ].map((name) => (
                <div
                  key={name}
                  className="flex items-center justify-between px-6 py-4 opacity-40 cursor-not-allowed select-none"
                >
                  <span className="text-sm font-medium text-slate-400">{name}</span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Coming Soon
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Trail Log */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Audit Trail Log</h4>
            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {detail.resolutions.map((r) => {
                const isEmail = r.resolution_type === 'email_sent';
                const isUndone = r.resolution_type === 'undone';

                if (isUndone) {
                  // Render two steps: the original resolution (dimmed) + the undo action
                  // resolution_note holds the original resolution_type saved at undo time
                  const originalType = r.resolution_note || 'Manual resolution';
                  return (
                    <React.Fragment key={r.id}>
                      <div className="flex items-start gap-4 relative z-10 opacity-50">
                        <div className="p-1 rounded-full bg-green-50 text-green-400"><CheckCircle2 size={16} /></div>
                        <div>
                          <p className="text-sm font-bold text-slate-500 line-through">Check Manually Resolved — {originalType}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{new Date(r.resolved_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="p-1 rounded-full bg-amber-50 text-amber-500"><Undo2 size={16} /></div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Resolution Undone — Reverted to {r.original_status || 'previous status'}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{new Date(r.resolved_at).toLocaleString()}</p>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                }

                const iconClass = isEmail ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500';
                const icon = isEmail ? <Mail size={16} /> : <CheckCircle2 size={16} />;
                const label = isEmail ? 'Query Email Sent' : `Check Manually Resolved — ${r.resolution_type}`;
                return (
                  <div key={r.id} className="flex items-start gap-4 relative z-10">
                    <div className={`p-1 rounded-full ${iconClass}`}>{icon}</div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{label}</p>
                      {r.resolution_note && <p className="text-xs text-slate-500 mt-0.5 italic">"{r.resolution_note}"</p>}
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(r.resolved_at).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
              <AuditStepTrail
                date={detail.created_at || ''}
                title="Audit Engine Run"
                detail={`${passedCount} checks passed, ${failedCount} failed, ${unvalidatedCount} unvalidated`}
                icon={<Play size={16} />}
                color={detail.audit_status === 'All Clear' ? 'text-green-500' : detail.audit_status === 'Audit Failed' ? 'text-red-500' : 'text-amber-500'}
                bgColor={detail.audit_status === 'All Clear' ? 'bg-green-50' : detail.audit_status === 'Audit Failed' ? 'bg-red-50' : 'bg-amber-50'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <AnimatePresence>
        {selectedCheckNum !== null && selectedCheck && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="w-[400px] bg-white border-l border-slate-200 shadow-2xl flex flex-col shrink-0 z-50"
          >
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-navy-900 uppercase tracking-widest">{selectedCheck.check_name}</h3>
              <button onClick={() => setSelectedCheckNum(null)} className="text-slate-400 hover:text-navy-900">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Audit Trail Steps */}
              <div className="mb-8">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Audit Trail</h4>
                <div className="space-y-4 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {selectedCheck.status === 'Passed' && (
                    <>
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm"></div>
                        <div>
                          <p className="text-xs text-slate-900">Cost code fetched → <b>{detail.cost_code || 'N/A'}</b></p>
                          <p className="text-[10px] text-slate-400">Automated check</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm"></div>
                        <div>
                          <p className="text-xs text-slate-900">Check criteria evaluated → <b>{selectedCheck.detail || 'All criteria met'}</b></p>
                          <p className="text-[10px] text-slate-400">✓ Check Passed</p>
                        </div>
                      </div>
                    </>
                  )}
                  {selectedCheck.status === 'Failed' && (
                    <>
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm"></div>
                        <div>
                          <p className="text-xs text-slate-900">Cost code fetched → <b>{detail.cost_code || 'N/A'}</b></p>
                          <p className="text-[10px] text-slate-400">Automated check</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="w-4 h-4 rounded-full bg-slate-400 border-4 border-white shadow-sm"></div>
                        <div>
                          <p className="text-xs text-slate-900">Depot type → <b>{detail.depot_type || 'N/A'}</b></p>
                          <p className="text-[10px] text-slate-400">Condition evaluated</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="w-4 h-4 rounded-full bg-red-500 border-4 border-white shadow-sm"></div>
                        <div>
                          <p className="text-xs text-slate-900"><b>{selectedCheck.detail || 'Check Failed'}</b></p>
                          <p className="text-[10px] text-slate-400">✗ Check Failed</p>
                        </div>
                      </div>
                    </>
                  )}
                  {selectedCheck.status === 'Validation Failed' && (
                    <>
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="w-4 h-4 rounded-full bg-amber-500 border-4 border-white shadow-sm"></div>
                        <div>
                          <p className="text-xs text-slate-900">Cost code is in auto list → <b>{detail.cost_code || 'N/A'}</b></p>
                          <p className="text-[10px] text-slate-400">Check 4 condition met</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="w-4 h-4 rounded-full bg-amber-500 border-4 border-white shadow-sm"></div>
                        <div>
                          <p className="text-xs text-slate-900">Manual value found → <b>USD {detail.manual_value ?? '0'}</b></p>
                          <p className="text-[10px] text-slate-400">Remark: {detail.calc_remark || '(blank)'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="w-4 h-4 rounded-full bg-amber-500 border-4 border-white shadow-sm"></div>
                        <div>
                          <p className="text-xs text-slate-900"><b>{selectedCheck.detail || 'Validation Failed'}</b></p>
                          <p className="text-[10px] text-slate-400">⚠ Validation required</p>
                        </div>
                      </div>
                    </>
                  )}
                  {selectedCheck.status === 'Not Applicable' && (
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-4 h-4 rounded-full bg-slate-300 border-4 border-white shadow-sm"></div>
                      <div>
                        <p className="text-xs text-slate-900">N/A — check conditions not met for this row</p>
                        <p className="text-[10px] text-slate-400">Check skipped</p>
                      </div>
                    </div>
                  )}
                  {detail.resolutions.filter(r => r.check_number === selectedCheckNum).map(r => (
                    <div key={r.id} className="flex items-start gap-4 relative z-10">
                      <div className={`w-4 h-4 rounded-full border-4 border-white shadow-sm ${r.resolution_type === 'email_sent' ? 'bg-blue-500' : r.resolution_type === 'undone' ? 'bg-amber-400' : 'bg-green-500'}`}></div>
                      <div>
                        <p className="text-xs text-slate-900">
                          {r.resolution_type === 'email_sent'
                            ? 'Query email sent'
                            : r.resolution_type === 'undone'
                            ? `Resolution undone — reverted to ${r.original_status || 'previous status'}`
                            : `Manually resolved — ${r.resolution_type}`}
                        </p>
                        <p className="text-[10px] text-slate-400">{new Date(r.resolved_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions for Failed / Validation Failed */}
              {(selectedCheck.status === 'Failed' || selectedCheck.status === 'Validation Failed') && !detail.resolutions.some(r => r.check_number === selectedCheckNum && r.resolution_type !== 'undone') && (
                <div className="space-y-6">
                  <p className="text-[11px] text-slate-500 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">
                    You can send a query to the relevant party or resolve this check manually.
                  </p>

                  {/* Option A: Send Query Email */}
                  <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                    <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-4">Option A — Send Query Email</h4>
                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="block text-[10px] font-bold text-red-400 uppercase mb-1">To</label>
                        <input type="text" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} className="w-full bg-white border border-red-200 rounded px-3 py-1.5 text-xs focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-red-400 uppercase mb-1">CC</label>
                        <input type="text" value={emailCc} onChange={(e) => setEmailCc(e.target.value)} className="w-full bg-white border border-red-200 rounded px-3 py-1.5 text-xs focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-red-400 uppercase mb-1">Body</label>
                        <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className="w-full bg-white border border-red-200 rounded px-3 py-2 text-xs focus:outline-none min-h-[120px]" />
                      </div>
                    </div>
                    <button
                      onClick={handleSendEmail}
                      disabled={actionLoading}
                      className="w-full bg-red-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Send size={14} /> Approve & Send
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-slate-100"></div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase">OR</span>
                    <div className="flex-1 h-px bg-slate-100"></div>
                  </div>

                  {/* Option B: Manual Resolution */}
                  <div className={`rounded-xl p-6 border ${selectedCheck.status === 'Failed' ? 'bg-slate-50 border-slate-200' : 'bg-amber-50 border-amber-100'}`}>
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${selectedCheck.status === 'Failed' ? 'text-slate-700' : 'text-amber-800'}`}>
                      Option B — Validate Manually
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Resolution Type</label>
                        <select value={resolutionType} onChange={(e) => setResolutionType(e.target.value)} className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none">
                          <option value="">Select resolution...</option>
                          <option value="Data Entry Error">Data Entry Error</option>
                          <option value="Approved Exception">Approved Exception</option>
                          <option value="Duplicate Entry">Duplicate Entry</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      {resolutionType === 'Other' && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Notes</label>
                          <textarea value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} placeholder="Enter additional notes..." className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none min-h-[60px]" />
                        </div>
                      )}
                      <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl bg-white text-center">
                        <FileUp size={24} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-[10px] font-bold text-slate-600 uppercase">Upload Proof</p>
                        <p className="text-[9px] text-slate-400 mt-1">PDF, JPG or PNG up to 5MB</p>
                      </div>
                      <button
                        onClick={handleMarkAsPassed}
                        disabled={!resolutionType || actionLoading}
                        className="w-full bg-navy-900 text-white py-2.5 rounded-lg text-xs font-bold hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Mark This Check as Passed
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {(selectedCheck.status === 'Passed' || selectedCheck.status === 'Not Applicable') && (
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-center">
                  <CheckCircle2 size={32} className="mx-auto text-green-500 mb-2" />
                  <p className="text-sm font-bold text-slate-700">
                    {selectedCheck.status === 'Not Applicable' ? 'Check Not Applicable' : 'Check Passed Successfully'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedCheck.status === 'Not Applicable' ? 'This check does not apply to this row.' : 'All automated validation criteria were met.'}
                  </p>
                </div>
              )}

              {detail.resolutions.some(r => r.check_number === selectedCheckNum && r.resolution_type === 'email_sent') && selectedCheck.status !== 'Passed' && selectedCheck.status !== 'Not Applicable' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 text-center">
                    <Mail size={32} className="mx-auto text-blue-500 mb-2" />
                    <p className="text-sm font-bold text-slate-700">Query Email Sent</p>
                    <p className="text-xs text-slate-500 mt-1">Awaiting response. Invoice moved to Escalations.</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-slate-100"></div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase">OR</span>
                    <div className="flex-1 h-px bg-slate-100"></div>
                  </div>

                  {/* Option B — available after query email to close check manually on reply */}
                  <div className={`rounded-xl p-6 border ${selectedCheck.status === 'Failed' ? 'bg-slate-50 border-slate-200' : 'bg-amber-50 border-amber-100'}`}>
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 ${selectedCheck.status === 'Failed' ? 'text-slate-700' : 'text-amber-800'}`}>
                      Option B — Validate Manually
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Resolution Type</label>
                        <select value={resolutionType} onChange={(e) => setResolutionType(e.target.value)} className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none">
                          <option value="">Select resolution...</option>
                          <option value="Data Entry Error">Data Entry Error</option>
                          <option value="Approved Exception">Approved Exception</option>
                          <option value="Duplicate Entry">Duplicate Entry</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      {resolutionType === 'Other' && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Notes</label>
                          <textarea value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} placeholder="Enter additional notes..." className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none min-h-[60px]" />
                        </div>
                      )}
                      <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl bg-white text-center">
                        <FileUp size={24} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-[10px] font-bold text-slate-600 uppercase">Upload Proof</p>
                        <p className="text-[9px] text-slate-400 mt-1">PDF, JPG or PNG up to 5MB</p>
                      </div>
                      <button
                        onClick={handleMarkAsPassed}
                        disabled={!resolutionType || actionLoading}
                        className="w-full bg-navy-900 text-white py-2.5 rounded-lg text-xs font-bold hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Mark This Check as Passed
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AuditStepTrail({ date, title, detail, icon, color, bgColor }: { date: string, title: string, detail: string, icon: React.ReactNode, color: string, bgColor: string }) {
  return (
    <div className="flex items-start gap-4 relative z-10">
      <div className={`p-1 rounded-full ${bgColor} ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{detail}</p>
        <p className="text-[10px] text-slate-400 mt-1">{date}</p>
      </div>
    </div>
  );
}

function AuditStep({ status, title, detail }: { status: 'pass' | 'fail' | 'warning', title: string, detail: string }) {
  const Icon = status === 'pass' ? CheckCircle2 : status === 'fail' ? XCircle : AlertTriangle;
  const color = status === 'pass' ? 'text-green-500' : status === 'fail' ? 'text-red-500' : 'text-amber-500';
  const bgColor = status === 'pass' ? 'bg-green-50' : status === 'fail' ? 'bg-red-50' : 'bg-amber-50';

  return (
    <div className="flex items-start gap-4 relative z-10">
      <div className={`p-1 rounded-full ${bgColor} ${color}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{detail}</p>
      </div>
    </div>
  );
}

function DetailItem({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? 'text-amber-600' : 'text-slate-700'}`}>{value}</p>
    </div>
  );
}

function TimelineItem({ date, text, color = 'text-slate-500' }: { date: string, text: string, color?: string }) {
  return (
    <div className="flex gap-4 text-xs">
      <span className="text-slate-400 w-32 shrink-0">{date}</span>
      <span className={`font-medium ${color}`}>{text}</span>
    </div>
  );
}

// --- SCREEN 3: DASHBOARD ---
function Dashboard({ onNavigateToAlerts }: { onNavigateToAlerts: () => void }) {
  const regionalData = [
    { region: 'Middle East', total: 28, audited: 28, cleared: 21, query: 5, pending: 2, contention: 42300, aging: 4.1 },
    { region: 'Brazil', total: 19, audited: 19, cleared: 11, query: 6, pending: 2, contention: 89400, aging: 11.3 },
    { region: 'Europe', total: 31, audited: 24, cleared: 18, query: 4, pending: 9, contention: 38700, aging: 3.8 },
    { region: 'China', total: 22, audited: 22, cleared: 14, query: 7, pending: 1, contention: 91200, aging: 9.7 },
    { region: 'India', total: 17, audited: 15, cleared: 12, query: 2, pending: 3, contention: 22100, aging: 2.9 },
    { region: 'Southeast Asia', total: 14, audited: 14, cleared: 11, query: 1, pending: 2, contention: 18400, aging: 3.2 },
    { region: 'West Africa', total: 11, audited: 8, cleared: 4, query: 2, pending: 5, contention: 16900, aging: 7.4 },
  ];

  const donutData = {
    labels: ['Cleared', 'Query Raised', 'In Review', 'Pending'],
    datasets: [{
      data: [61, 23, 18, 40],
      backgroundColor: ['#22c55e', '#ef4444', '#f59e0b', '#94a3b8'],
      borderWidth: 0,
    }]
  };

  const barData = {
    labels: regionalData.map(d => d.region),
    datasets: [{
      label: 'Amount in Contention (USD)',
      data: regionalData.map(d => d.contention),
      backgroundColor: '#f59e0b',
      borderRadius: 4,
    }]
  };

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden">
      {/* Main Dashboard Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Audit Dashboard — March 2026 | FY2026 Q1</h2>
          <p className="text-slate-500 mt-1">Regional performance and audit health metrics.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <KPICard label="Total Invoices Audited" value="142" icon={<ClipboardList className="text-blue-500" />} />
          <KPICard label="Amount Cleared" value="$1.24M" icon={<CheckCircle2 className="text-green-500" />} />
          <KPICard label="Amount in Contention" value="$318,000" icon={<AlertTriangle className="text-red-500" />} />
          <KPICard label="Avg. Resolution Time" value="6.2 days" icon={<LayoutDashboard className="text-amber-500" />} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold text-slate-700 mb-6">Audit Status Distribution</h4>
            <div className="h-[250px] flex justify-center">
              <Doughnut data={donutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold text-slate-700 mb-6">Amount in Contention by Region</h4>
            <div className="h-[250px]">
              <Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>
        </div>

        {/* Regional Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <h4 className="text-sm font-bold text-slate-700">Regional Summary Table</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                  <th className="px-6 py-3 border-b border-slate-200">Region</th>
                  <th className="px-6 py-3 border-b border-slate-200">Total</th>
                  <th className="px-6 py-3 border-b border-slate-200">Audited</th>
                  <th className="px-6 py-3 border-b border-slate-200">Cleared</th>
                  <th className="px-6 py-3 border-b border-slate-200">Query Raised</th>
                  <th className="px-6 py-3 border-b border-slate-200">Pending</th>
                  <th className="px-6 py-3 border-b border-slate-200">Amount in Contention</th>
                  <th className="px-6 py-3 border-b border-slate-200">Avg Aging</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {regionalData.map((d) => (
                  <tr key={d.region} className={`hover:bg-slate-50 transition-colors ${d.contention > 50000 ? 'border-l-4 border-l-red-500' : ''}`}>
                    <td className="px-6 py-4 text-sm font-semibold text-navy-900">{d.region}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{d.total}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{d.audited}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{d.cleared}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{d.query}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{d.pending}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">${d.contention.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{d.aging} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-80 border-l border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-sm font-bold text-navy-900 uppercase tracking-widest">System Alerts & Activity</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Alerts Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alerts</h4>
              <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">3 Critical</span>
            </div>
            <div className="space-y-4">
              <DashboardAlertItem 
                id="INV-2026-5004" 
                text="Rate difference exceeds $100 threshold for COSCO Shanghai." 
                type="critical"
              />
              <DashboardAlertItem 
                id="INV-2026-5006" 
                text="Cannot verify rate for Hapag Brazil — ambiguous clause." 
                type="warning"
              />
              <DashboardAlertItem 
                id="INV-2026-5005" 
                text="Missing contract reference for Maersk North Europe." 
                type="warning"
              />
            </div>
            <button 
              onClick={onNavigateToAlerts}
              className="w-full mt-6 flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              View All Alerts <ArrowUpRight size={14} />
            </button>
          </section>

          {/* Recent Insights / Activity Section */}
          <section>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Recent Insights</h4>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-800 mb-1">Audit Efficiency Up</p>
                <p className="text-[10px] text-blue-700/70 leading-relaxed">AI Agent successfully auto-cleared 82% of Middle East invoices this week.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-800 mb-1">New Scenario Detected</p>
                <p className="text-[10px] text-slate-600 leading-relaxed">Agent identified a recurring pattern of "Peak Season Surcharge" mismatch in Brazil.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function DashboardAlertItem({ id, text, type }: { id: string, text: string, type: 'critical' | 'warning' }) {
  return (
    <div className={`p-3 rounded-xl border ${type === 'critical' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-mono text-[10px] font-bold text-navy-900">{id}</span>
        <div className={`w-1.5 h-1.5 rounded-full ${type === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
      </div>
      <p className="text-[11px] text-slate-600 leading-snug">{text}</p>
    </div>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-50 p-12 text-center">
      <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
        {title === 'Artefacts' ? <Archive size={40} /> : <Terminal size={40} />}
      </div>
      <h2 className="text-2xl font-bold text-navy-900 mb-2">{title}</h2>
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200 mb-6">
        <Clock size={14} /> Work in Progress
      </div>
      <p className="text-slate-500 max-w-md leading-relaxed">
        This module is currently under development. We are building a robust system to manage audit {title.toLowerCase()} and historical data.
      </p>
    </div>
  );
}

function ArtefactsView() {
  const dashboards = [
    { 
      title: "PIL Invoices", 
      thumbnail: "https://picsum.photos/seed/analytics/800/500",
      description: "Comprehensive view of all Pacific Lines invoices with audit status trends and regional performance metrics."
    },
    { 
      title: "Invoice breakdown", 
      thumbnail: "https://picsum.photos/seed/chart/800/500",
      description: "Detailed analysis of cost codes, vendor performance, and regional variances for deeper financial insights."
    }
  ];

  const quickLinks = [
    { title: "Learning Management System (LMS)", description: "Access training modules and audit certification courses.", icon: <FileText size={20} /> },
    { title: "Sharepoint Repository", description: "Centralized storage for all supporting documents and policy files.", icon: <Archive size={20} /> }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Artefacts</h2>
        <p className="text-slate-500">Access generated reports, dashboards, and exported audit data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {dashboards.map((db, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group cursor-pointer"
          >
            <div className="aspect-video relative overflow-hidden bg-slate-100 border-b border-slate-100">
              <img 
                src={db.thumbnail} 
                alt={db.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-navy-900/0 group-hover:bg-navy-900/20 transition-colors flex items-center justify-center">
                <div className="bg-white p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 duration-300">
                  <ExternalLink size={20} className="text-amber-600" />
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-navy-900 group-hover:text-amber-600 transition-colors flex items-center gap-2">
                {db.title}
                <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                {db.description}
              </p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tableau Dashboard</span>
                <span className="text-xs font-medium text-amber-600">Open Dashboard →</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">External Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickLinks.map((link, i) => (
            <motion.div 
              key={i}
              whileHover={{ x: 5 }}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-amber-200 transition-colors group"
            >
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                {link.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-navy-900 group-hover:text-amber-600 transition-colors">{link.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{link.description}</p>
              </div>
              <ExternalLink size={14} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LogsView() {
  const [logs] = useState([
    { time: '10:15:22', event: 'Agent picked invoice INV-2026-5004', type: 'info' },
    { time: '10:15:25', event: 'Audit check 1 (Incorrect dates) completed for INV-2026-5004', type: 'success' },
    { time: '10:15:28', event: 'Audit check 2 (Terminal code) completed for INV-2026-5004', type: 'success' },
    { time: '10:15:32', event: 'Discrepancy identified in Rate Filing Validation', type: 'warning' },
    { time: '10:15:45', event: 'Agent picked invoice INV-2026-5005', type: 'info' },
    { time: '10:15:48', event: 'Audit check 1 (Incorrect dates) completed for INV-2026-5005', type: 'success' },
    { time: '10:15:52', event: 'Validation failed for Supporting Documents', type: 'warning' },
    { time: '10:16:05', event: 'Agent picked invoice INV-2026-5006', type: 'info' },
    { time: '10:16:08', event: 'Audit check 1 (Incorrect dates) completed for INV-2026-5006', type: 'success' },
    { time: '10:16:12', event: 'Audit check 2 (Terminal code) completed for INV-2026-5006', type: 'success' },
    { time: '10:16:15', event: 'Audit check 3 (Depot code) completed for INV-2026-5006', type: 'success' },
  ]);

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Section: Thinking Animation */}
      <div className="h-1/3 bg-[#0f172a] p-8 flex flex-col items-center justify-center relative overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-6 mb-8">
            <motion.div 
              animate={{ 
                boxShadow: ["0 0 0px rgba(245, 158, 11, 0)", "0 0 20px rgba(245, 158, 11, 0.3)", "0 0 0px rgba(245, 158, 11, 0)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20"
            >
              <Terminal size={32} className="text-navy-900" />
            </motion.div>
            
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-1 h-1 bg-slate-600 rounded-full"
                />
              ))}
            </div>

            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700">
              <FileText size={32} className="text-slate-400" />
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    delay: i * 0.2 
                  }}
                  className="w-2.5 h-2.5 bg-amber-500 rounded-full"
                />
              ))}
            </div>
            <p className="text-slate-400 font-mono text-xs tracking-[0.2em] uppercase mt-2">Agent is thinking...</p>
            <motion.p 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-amber-500/60 font-mono text-[10px] mt-1"
            >
              Analyzing invoice structures • Batch #882 • Current: INV-2026-5006
            </motion.p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Event Logs */}
      <div className="flex-1 p-8 overflow-hidden flex flex-col">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-navy-900">Event Logs</h2>
            <p className="text-xs text-slate-500 mt-1">Real-time audit execution stream</p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Live Stream</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="w-20">Timestamp</span>
            <span>Event Description</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 font-mono text-[11px] leading-relaxed">
            <div className="space-y-3">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-6 group">
                  <span className="text-slate-400 w-20 shrink-0">{log.time}</span>
                  <span className={`flex-1 ${
                    log.type === 'success' ? 'text-green-600' : 
                    log.type === 'warning' ? 'text-amber-600' : 'text-slate-700'
                  }`}>
                    <span className="text-slate-300 mr-4">❯</span>
                    {log.event}
                  </span>
                </div>
              ))}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                className="flex gap-6"
              >
                <span className="text-slate-400 w-20 shrink-0">10:16:18</span>
                <span className="text-amber-500">
                  <span className="text-slate-300 mr-4">❯</span>
                  Processing next item...
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className="p-3 bg-slate-50 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-navy-900 mt-1">{value}</p>
      </div>
    </div>
  );
}

function OverdueItem({ id, vendor, region, amount, aging }: { id: string, vendor: string, region: string, amount: string, aging: string }) {
  return (
    <div className="flex items-center justify-between text-sm bg-white p-3 rounded-lg border border-red-100 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="font-mono font-bold text-navy-900">{id}</span>
        <span className="text-slate-400">|</span>
        <span className="font-medium text-slate-700">{vendor}</span>
        <span className="text-slate-400">|</span>
        <span className="text-slate-500">{region}</span>
        <span className="text-slate-400">|</span>
        <span className="font-bold text-slate-900">{amount}</span>
      </div>
      <span className="text-red-600 font-bold">{aging}</span>
    </div>
  );
}

const SCENARIOS = [
  "Storage for SOC Units",
  "Rate Mismatch — LCL Units",
  "Terminal Storage — Overbilling on Days",
  "Rate Applied from Superseded Agreement (VVD)",
  "Credit Note Processing",
  "Short Billing by Terminal",
  "Agreement Not Found in LMS",
  "Rate Mismatch Between Agreements",
  "Exceptional Agreement Setup",
  "Approval-Based Cost",
  "Incorrect Cost Code Applied",
  "Adjustment Entry — Reversal and Re-posting",
  "LMS Agreement Module Limitation",
  "Rounding Off Discrepancy"
];

// --- SCREEN 5: AUDIT CONFIGURATION ---
function AIProviderSection() {
  const [info, setInfo] = useState<{ provider: string; model: string | null; configured: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/config/ai-provider')
      .then(r => r.json())
      .then(setInfo)
      .catch(() => setInfo({ provider: 'none', model: null, configured: false }));
  }, []);

  const providerLabel =
    info?.provider === 'azure' ? 'Azure OpenAI' :
    info?.provider === 'openai' ? 'OpenAI' :
    info === null ? 'Loading…' : 'Not Configured';

  return (
    <ConfigSection
      title="AI Classification Engine"
      subtitle="Classifies calc remarks for Check 4 (Auto Cost Code With Manual Values). Provider is set via server environment variables."
    >
      <div className="p-6 flex flex-wrap items-center gap-8">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${info?.configured ? 'bg-green-500' : info === null ? 'bg-amber-400' : 'bg-red-400'}`} />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Provider</p>
            <p className="text-sm font-bold text-navy-900">{providerLabel}</p>
          </div>
        </div>
        {info?.model && (
          <>
            <div className="w-px h-10 bg-slate-100" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Model</p>
              <p className="text-sm font-bold text-navy-900">{info.model}</p>
            </div>
          </>
        )}
        <div className="w-px h-10 bg-slate-100" />
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confidence Threshold</p>
          <p className="text-sm font-bold text-navy-900">&lt; 50% → Validation Failed</p>
        </div>
        <div className="w-px h-10 bg-slate-100" />
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categories</p>
          <p className="text-sm font-bold text-navy-900">14 scenarios + Other</p>
        </div>
        <div className="w-px h-10 bg-slate-100" />
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Used In</p>
          <p className="text-sm font-bold text-navy-900">Check 4 only</p>
        </div>
      </div>
    </ConfigSection>
  );
}

function AuditRunHistory() {
  const [monthIdx, setMonthIdx] = useState(3); // April 2026
  
  const months = [
    { name: 'January', days: 31, offset: 4, coverage: 90.3, missing: [12, 24, 25] },
    { name: 'February', days: 28, offset: 0, coverage: 85.7, missing: [5, 14, 21, 28] },
    { name: 'March', days: 31, offset: 0, coverage: 93.5, missing: [10, 22] },
    { name: 'April', days: 30, offset: 3, coverage: 100, missing: [] },
  ];

  const currentMonth = months[monthIdx];

  const history = [
    { start: '2026-03-05 09:00', type: 'Automatic', range: '2026-02-01 to 2026-02-28', end: '2026-03-05 09:45', status: 'Completed' },
    { start: '2026-03-15 14:30', type: 'Manual', range: '2026-03-01 to 2026-03-14', end: '2026-03-15 15:10', status: 'Completed' },
    { start: '2026-04-05 09:00', type: 'Automatic', range: '2026-03-01 to 2026-03-31', end: '2026-04-05 09:50', status: 'Completed' },
  ];

  return (
    <ConfigSection title="Audit Run History" subtitle="View past audit execution logs and coverage.">
      <div className="p-6 space-y-8">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                <th className="px-6 py-3 border-b border-slate-200">Start Time</th>
                <th className="px-6 py-3 border-b border-slate-200">Type</th>
                <th className="px-6 py-3 border-b border-slate-200">Input Date Range</th>
                <th className="px-6 py-3 border-b border-slate-200">Completion Time</th>
                <th className="px-6 py-3 border-b border-slate-200">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((run, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-navy-900">{run.start}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{run.type}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{run.range}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{run.end}</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                      {run.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calendar View */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Audit Coverage Calendar</h5>
              <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                <button 
                  onClick={() => setMonthIdx(Math.max(0, monthIdx - 1))}
                  disabled={monthIdx === 0}
                  className={`p-1 rounded hover:bg-white transition-colors ${monthIdx === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600'}`}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-bold text-navy-900 w-32 text-center">{currentMonth.name} 2026</span>
                <button 
                  onClick={() => setMonthIdx(Math.min(3, monthIdx + 1))}
                  disabled={monthIdx === 3}
                  className={`p-1 rounded hover:bg-white transition-colors ${monthIdx === 3 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600'}`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Audit Coverage (Period)</p>
              <p className="text-2xl font-bold text-navy-900">{currentMonth.coverage}%</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-[10px] font-bold text-slate-400 py-2">{day}</div>
            ))}
            {/* Empty slots for offset */}
            {Array.from({ length: currentMonth.offset }).map((_, i) => (
              <div key={`offset-${i}`} className="h-12 border border-transparent"></div>
            ))}
            {Array.from({ length: currentMonth.days }).map((_, i) => {
              const day = i + 1;
              const isMissing = currentMonth.missing.includes(day);
              const isCovered = !isMissing;
              
              return (
                <div 
                  key={i} 
                  className={`h-12 border border-slate-100 flex flex-col items-center justify-center relative ${isCovered ? 'bg-green-50' : 'bg-white'}`}
                >
                  <span className={`text-xs ${isCovered ? 'text-green-700 font-bold' : 'text-slate-400'}`}>{day}</span>
                  {isCovered && <div className="absolute bottom-1 w-1 h-1 bg-green-500 rounded-full"></div>}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
              <span className="text-[10px] text-slate-500">Audit Covered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white border border-slate-200 rounded"></div>
              <span className="text-[10px] text-slate-500">Pending / No Coverage</span>
            </div>
          </div>
        </div>
      </div>
    </ConfigSection>
  );
}

function AuditConfiguration() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [showToast, setShowToast] = useState(false);

  const openModal = (title: string) => {
    setModalTitle(title);
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    setIsModalOpen(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-slate-900">Audit Configuration</h2>
            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border border-amber-200">
              <Lock size={10} /> Restricted Access
            </span>
          </div>
          <p className="text-slate-500">Define audit rules, configure checks by region, set schedules, and manage scenario-to-action mappings.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => openModal('Schedule Audit Run')}
            className="flex items-center gap-2 px-4 py-2 border border-amber-500 text-amber-600 rounded font-medium hover:bg-amber-50 transition-colors"
          >
            <Calendar size={18} /> Schedule Audit
          </button>
          <button 
            onClick={() => openModal('Initiate Audit Now')}
            className="btn-amber flex items-center gap-2"
          >
            <Play size={18} fill="currentColor" /> Start Now
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Section 1: Audit Checklist Configuration */}
        <ConfigSection 
          title="Audit Checklist Configuration" 
          subtitle="Enable or disable specific audit checks for each invoice type."
        >
          <div className="p-6 grid grid-cols-3 gap-8">
            {Object.entries(CHECKLIST_ITEMS).map(([type, items]) => (
              <div key={type} className="space-y-4">
                <h5 className="text-sm font-bold text-navy-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                  {type} Checks
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">{items.length} Total</span>
                </h5>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item, i) => (
                    <label key={i} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer transition-colors group">
                      <input type="checkbox" defaultChecked={true} className="accent-amber-500 w-4 h-4" />
                      <span className="text-xs text-slate-600 group-hover:text-navy-900">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ConfigSection>

        {/* Section 2: Region-Level Configuration */}
        <ConfigSection 
          title="Region-Level Configuration" 
          subtitle="Enable or disable specific checks per region and set regional discrepancy thresholds."
        >
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                  <th className="px-6 py-3 border-b border-slate-200">Region</th>
                  {CHECKLIST_ITEMS.TES.slice(0, 10).map((item, i) => (
                    <th key={i} className="px-2 py-3 border-b border-slate-200 text-center" title={item}>C{i + 1}</th>
                  ))}
                  <th className="px-2 py-3 border-b border-slate-200 text-center">...</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <RegionMatrixRow region="Middle East" checks={[true, true, true, true, true, false, false, true, true, true]} />
                <RegionMatrixRow region="Brazil" checks={[true, true, true, true, true, true, false, true, true, true]} />
                <RegionMatrixRow region="Europe" checks={[true, true, false, true, true, false, false, true, true, true]} />
                <RegionMatrixRow region="China" checks={[true, true, true, true, true, true, true, true, true, true]} />
                <RegionMatrixRow region="India" checks={[true, false, false, true, true, false, true, true, true, true]} />
                <RegionMatrixRow region="Southeast Asia" checks={[true, true, true, false, true, false, false, true, true, true]} />
                <RegionMatrixRow region="West Africa" checks={[true, true, false, false, true, false, false, true, true, true]} />
              </tbody>
            </table>
          </div>

          {/* Checklist Legend */}
          <div className="px-6 pb-6">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Checklist Legend (TES)</h5>
            <div className="grid grid-cols-5 gap-x-8 gap-y-2">
              {CHECKLIST_ITEMS.TES.slice(0, 15).map((s, i) => (
                <div key={i} className="flex gap-2 text-[11px]">
                  <span className="font-bold text-navy-900 w-6">C{i + 1}:</span>
                  <span className="text-slate-500 truncate">{s}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-slate-50/50 rounded-lg border border-slate-200 p-4">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Regional Threshold Override</h5>
            <div className="grid grid-cols-7 gap-4">
              <ThresholdItem region="Middle East" threshold="$100" target="40%" />
              <ThresholdItem region="Brazil" threshold="$100" target="60%" />
              <ThresholdItem region="Europe" threshold="$100" target="35%" />
              <ThresholdItem region="China" threshold="$100" target="55%" />
              <ThresholdItem region="India" threshold="$100" target="30%" />
              <ThresholdItem region="Southeast Asia" threshold="$100" target="35%" />
              <ThresholdItem region="West Africa" threshold="$100" target="25%" />
            </div>
          </div>
        </ConfigSection>

        {/* Section 3: Audit Schedule */}
        <ConfigSection 
          title="Audit Schedule & Trigger Configuration" 
          subtitle="Set how often audits run and what triggers them."
        >
          <div className="p-6 border-b border-slate-100 bg-amber-50/30">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <Calendar size={16} className="text-amber-600" /> Current Schedules
                </h5>
                <p className="text-xs text-slate-500 mt-1">Active recurring audit tasks for all global regions.</p>
              </div>
              <div className="bg-white border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-6 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Frequency</span>
                  <span className="text-sm font-bold text-navy-900">Monthly</span>
                </div>
                <div className="w-px h-8 bg-slate-100"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Next Run</span>
                  <span className="text-sm font-bold text-navy-900">5th of every month</span>
                </div>
                <div className="w-px h-8 bg-slate-100"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time</span>
                  <span className="text-sm font-bold text-navy-900">10:00 AM IST</span>
                </div>
                <div className="w-px h-8 bg-slate-100"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scope</span>
                  <span className="text-sm font-bold text-navy-900">All Regions (Prev. Month)</span>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-12 p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Default Audit Frequency</label>
                <div className="flex gap-6">
                  {['Daily', 'Weekly', 'Monthly'].map((freq) => (
                    <label key={freq} className="flex items-center gap-2 cursor-pointer group">
                      <input type="radio" name="freq" defaultChecked={freq === 'Monthly'} className="accent-amber-500 w-4 h-4" />
                      <span className="text-sm text-slate-600 group-hover:text-navy-900 transition-colors">{freq}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Audit Window</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-400 mb-1">From</p>
                    <input type="text" defaultValue="1st of month" className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-400 mb-1">To</p>
                    <input type="text" defaultValue="Last working day" className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Run Time</label>
                <input type="text" defaultValue="09:00 AM IST" className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
              </div>
            </div>

            <div className="space-y-6">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Trigger Mode</label>
              <div className="space-y-4">
                <div className="p-4 border-2 border-amber-500 bg-amber-50/30 rounded-xl relative">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-navy-900">Scheduled Run</p>
                    <div className="w-4 h-4 rounded-full border-4 border-amber-500 bg-white"></div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">Audit runs automatically at the configured frequency and time window.</p>
                </div>
                <div className="p-4 border border-slate-200 bg-slate-50 rounded-xl opacity-60 grayscale relative overflow-hidden">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-slate-400">Event-Driven (Live Audit)</p>
                    <div className="w-4 h-4 rounded-full border border-slate-300 bg-white"></div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">Audit triggers automatically when an invoice is approved in LMS. Enables real-time audit.</p>
                  <div className="absolute top-2 right-2 bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border border-amber-200">
                    Coming in Full Implementation
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-2 pt-6 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Invoice Selection Priority</label>
              <div className="flex gap-8">
                <PriorityCheckbox label="Always audit invoices above $10,000" checked={true} />
                <PriorityCheckbox label="Always audit flagged vendors" checked={true} />
                <PriorityCheckbox label="Random sampling within coverage target" checked={false} />
              </div>
            </div>
          </div>
        </ConfigSection>

        {/* Section 4: AI Classification Engine */}
        <AIProviderSection />

        {/* Section 5: Audit Run History */}
        <AuditRunHistory />

        {/* Section 4: Scenario-to-Action Mapping (Removed from here) */}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[600px] overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-navy-900">{modalTitle}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-navy-900 transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8">
                <div className="bg-slate-50 rounded-xl p-6 mb-6 space-y-4">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Regions</p>
                      <p className="text-slate-700 font-medium">All 7 regions</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Active Checks</p>
                      <p className="text-slate-700 font-medium">7 of 8 checks enabled</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Scenarios Covered</p>
                      <p className="text-slate-700 font-medium">14 of 14</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Estimated Volume</p>
                      <p className="text-slate-700 font-medium">~142 invoices</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Trigger Mode</p>
                      <p className="text-slate-700 font-medium">Scheduled Run</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Audit Window</p>
                      <p className="text-slate-700 font-medium">01 Mar 2026 — 31 Mar 2026</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Run Time</p>
                      <p className="text-slate-700 font-medium">09:00 AM IST</p>
                    </div>
                  </div>
                </div>

                {modalTitle === 'Schedule Audit Run' && (
                  <div className="mb-8 p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                    <h5 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-4">Set Schedule Details</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Date</label>
                        <input type="date" className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20" defaultValue="2026-04-05" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Time</label>
                        <input type="time" className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20" defaultValue="10:00" />
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-amber-600 text-sm font-medium text-center mb-8">
                  "This will initiate automated audit processing. Emails will be drafted but will require human approval before sending."
                </p>
                <div className="flex gap-4">
                  <button onClick={handleConfirm} className="flex-1 btn-amber py-3">Confirm</button>
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-slate-300 rounded font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed top-8 right-8 z-[200] bg-green-600 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-4 border border-green-500"
          >
            <div className="bg-white/20 p-1.5 rounded-full">
              <Check size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">Audit initiated successfully</p>
              <p className="text-xs text-green-100">Processing 142 invoices across 7 regions.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfigSection({ title, subtitle, children }: { title: string, subtitle: string, children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/30">
        <h4 className="text-lg font-bold text-navy-900">{title}</h4>
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function CheckRow({ name, scenarios, source, active }: { name: string, scenarios: string, source: string, active: boolean }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-6 py-4 text-sm font-semibold text-navy-900">{name}</td>
      <td className="px-6 py-4 text-xs text-slate-500 max-w-xs leading-relaxed">{scenarios}</td>
      <td className="px-6 py-4 text-xs font-medium text-slate-600">{source}</td>
      <td className="px-6 py-4">
        <input type="text" defaultValue="$100" className="inline-input" />
      </td>
      <td className="px-6 py-4">
        <Toggle active={active} />
      </td>
    </tr>
  );
}

function RegionMatrixRow({ region, checks }: { region: string, checks: boolean[] }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4 text-sm font-semibold text-navy-900">{region}</td>
      {checks.map((checked, i) => (
        <td key={i} className="px-6 py-4 text-center">
          <input type="checkbox" defaultChecked={checked} className="accent-amber-500 w-4 h-4 cursor-pointer" />
        </td>
      ))}
    </tr>
  );
}

function ThresholdItem({ region, threshold, target }: { region: string, threshold: string, target: string }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-slate-500 truncate">{region}</p>
      <input type="text" defaultValue={threshold} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
      <input type="text" defaultValue={target} className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
    </div>
  );
}

function PriorityCheckbox({ label, checked }: { label: string, checked: boolean }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input type="checkbox" defaultChecked={checked} className="accent-amber-500 w-4 h-4" />
      <span className="text-sm text-slate-600 group-hover:text-navy-900 transition-colors">{label}</span>
    </label>
  );
}

function ScenarioRow({ id, scenario, action, escalation, review }: { id: number, scenario: string, action: string, escalation: string, review: boolean }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4 text-xs font-mono text-slate-400">{id}</td>
      <td className="px-6 py-4 text-sm font-medium text-navy-900">{scenario}</td>
      <td className="px-6 py-4">
        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">{action}</span>
      </td>
      <td className="px-6 py-4 text-xs text-slate-500">{escalation}</td>
      <td className="px-6 py-4">
        <input type="text" defaultValue="$100" className="inline-input" />
      </td>
      <td className="px-6 py-4">
        <Toggle active={review} />
      </td>
    </tr>
  );
}

function Toggle({ active }: { active: boolean }) {
  const [isOn, setIsOn] = useState(active);
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={isOn} onChange={() => setIsOn(!isOn)} />
      <span className="toggle-slider"></span>
    </label>
  );
}

// --- SCREEN 4: OUTBOX ---
// --- SCREEN 4: ALERTS & ESCALATION ---
function AlertsEscalation({ onNavigateToCase }: { onNavigateToCase: (rowSerial: string) => void }) {
  const [activeTab, setActiveTab] = useState<'alerts' | 'escalations'>('alerts');
  const [alertsData, setAlertsData] = useState<ApiAlertsResponse | null>(null);
  const [escalationsData, setEscalationsData] = useState<ApiAlertsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ar, er] = await Promise.all([
        fetch('/api/alerts?tab=alerts').then(r => r.json()),
        fetch('/api/alerts?tab=escalations').then(r => r.json()),
      ]);
      setAlertsData(ar);
      setEscalationsData(er);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const kpi = alertsData?.kpi;
  const cards = activeTab === 'alerts' ? (alertsData?.cards ?? []) : (escalationsData?.cards ?? []);

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* KPI Tiles — 3 tiles, no Amount in Contention, Ageing always 0 */}
      <div className="p-6 bg-white border-b border-slate-200 shrink-0">
        <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
          <KPICard label="Total Invoices Requiring Action" value={kpi?.totalRequiringAction?.toString() ?? '—'} icon={<Bell className="text-amber-500" />} />
          <KPICard label="Awaiting Response" value={kpi?.awaitingResponse?.toString() ?? '—'} icon={<Clock className="text-blue-500" />} />
          <KPICard label="Average Ageing" value="0 Days" icon={<TrendingUp className="text-slate-700" />} />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 shrink-0">
        <div className="max-w-7xl mx-auto flex gap-8">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'alerts' ? 'border-amber-500 text-navy-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Alerts
            <span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px]">{alertsData?.cards.length ?? 0}</span>
          </button>
          <button
            onClick={() => setActiveTab('escalations')}
            className={`py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'escalations' ? 'border-amber-500 text-navy-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Escalations
            <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px]">{escalationsData?.cards.length ?? 0}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : cards.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-7xl mx-auto">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-navy-900">
              {activeTab === 'alerts' ? 'No items requiring action' : 'No escalations'}
            </h3>
            <p className="text-slate-500 mt-1">
              {activeTab === 'alerts' ? 'All invoices are cleared.' : 'No query emails have been sent yet.'}
            </p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'alerts' ? cards.map((card: ApiAlertCard, idx: number) => (
              <div key={card.row_serial} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 left-0 bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-br-lg z-10">#{idx + 1}</div>
                {/* Card header */}
                <div className="p-4 bg-slate-50/50 border-b border-slate-100 grid grid-cols-6 gap-4 pt-6">
                  <SummaryItem label="Row Serial" value={card.row_serial} />
                  <SummaryItem label="Invoice #" value={card.invoice_no || '—'} />
                  <SummaryItem label="Vendor" value={card.vendor || '—'} />
                  <SummaryItem label="Cost Code" value={card.cost_code || '—'} />
                  <SummaryItem label="Amount in Contention" value={`USD ${(card.manual_value ?? 0).toLocaleString()}`} highlight />
                  <SummaryItem label="Ageing" value="0 Days" />
                </div>
                {/* Failing checks — read-only; action happens in Case View */}
                <div className="p-6 space-y-2">
                  {(card.failedChecks || []).map((fc) => (
                    <div key={fc.check_number} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white">
                      <span className="text-sm font-medium text-slate-700 shrink-0">{fc.check_name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${fc.status === 'Failed' ? 'text-red-600 bg-red-50 border-red-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
                        {fc.status === 'Failed' ? '❌ Audit Failed' : '⚠️ Validation Failed'}
                      </span>
                      {fc.detail && <span className="text-[10px] text-slate-400 truncate">{fc.detail}</span>}
                    </div>
                  ))}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => onNavigateToCase(card.row_serial)}
                      className="flex items-center gap-1.5 text-xs font-bold text-white bg-navy-900 hover:bg-navy-800 px-4 py-2 rounded-lg transition-colors"
                    >
                      Take Action <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )) : cards.map((card: ApiAlertCard, idx: number) => (
              <div key={card.row_serial} className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 left-0 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-br-lg z-10">#{idx + 1}</div>
                {/* Escalation card header */}
                <div className="p-4 bg-blue-50/30 border-b border-blue-100 grid grid-cols-5 gap-4 pt-6">
                  <SummaryItem label="Row Serial" value={card.row_serial} />
                  <SummaryItem label="Invoice #" value={card.invoice_no || '—'} />
                  <SummaryItem label="Vendor" value={card.vendor || '—'} />
                  <SummaryItem label="Amount in Contention" value={`USD ${(card.manual_value ?? 0).toLocaleString()}`} highlight />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                    <AuditStatusBadge status="Query Raised" />
                  </div>
                </div>
                {/* Email threads */}
                <div className="p-6 space-y-2">
                  {(card.threads || []).map((thread, tidx) => (
                    <div key={tidx} className="flex items-center justify-between p-3 rounded-lg border border-blue-100 bg-blue-50">
                      <div className="flex items-center gap-3">
                        <Mail size={14} className="text-blue-500 shrink-0" />
                        <span className="text-xs text-slate-700">Query sent for Check #{thread.check_number}</span>
                        {thread.resolution_note && <span className="text-[10px] text-slate-400 italic truncate max-w-[200px]">"{thread.resolution_note}"</span>}
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{new Date(thread.resolved_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
function AlertCard({ invoice, serialNumber, onAction, manualResolutions, sentQueries, comments, newComment, setNewComment, onSaveComment, isAdmin, onReverse }: any) {
  const [isFindingsExpanded, setIsFindingsExpanded] = useState(true);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);

  const totalFindings = invoice.findings.length;
  const resolvedFindings = invoice.findings.filter((f: any) => manualResolutions[f.name] || sentQueries.includes(f.name)).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 left-0 bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-br-lg z-10">
        #{serialNumber}
      </div>
      {/* Summary Tiles */}
      <div className="p-4 bg-slate-50/50 border-b border-slate-100 grid grid-cols-6 gap-4 pt-6">
        <SummaryItem label="Invoice #" value={invoice.id} />
        <SummaryItem label="Vendor" value={invoice.vendor} />
        <SummaryItem label="Type" value={invoice.invoiceType} />
        <SummaryItem 
          label="Checks Requiring Action" 
          value={`${totalFindings} (${invoice.findings.filter((f: any) => f.status === 'fail').length}F / ${invoice.findings.filter((f: any) => f.status === 'warning').length}U)`} 
        />
        <SummaryItem label="Amount in Contention" value={`USD ${invoice.contention.toLocaleString()}`} highlight />
        <SummaryItem label="Ageing" value={`${invoice.aging} Days`} />
      </div>

      {/* Findings List */}
      <div className="p-6">
        <button 
          onClick={() => setIsFindingsExpanded(!isFindingsExpanded)}
          className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 hover:text-navy-900 transition-colors"
        >
          Findings List {isFindingsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <AnimatePresence>
          {isFindingsExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-2"
            >
              {invoice.findings.map((f: any) => {
                const isResolved = manualResolutions[f.name] || sentQueries.includes(f.name);
                return (
                  <div 
                    key={f.name} 
                    onClick={() => onAction(f.name, f.status)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isResolved ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-sm'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-700">{f.name}</span>
                      {isResolved ? (
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 flex items-center gap-1">
                          <CheckCircle2 size={10} /> Resolved
                        </span>
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${f.status === 'fail' ? 'text-red-600 bg-red-50 border-red-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
                          {f.status === 'fail' ? '❌ Audit Failed' : '⚠️ Validation Failed'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!isResolved && (
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                          Take Action
                        </span>
                      )}
                      {isResolved && <ChevronRight size={14} className="text-slate-300" />}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Indicator */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 max-w-xs">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 transition-all duration-500" 
                style={{ width: `${(resolvedFindings / totalFindings) * 100}%` }}
              ></div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{resolvedFindings} of {totalFindings} resolved</span>
          </div>
          
          <button 
            onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
            className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-navy-900 transition-colors flex items-center gap-1"
          >
            <MessageSquare size={12} /> Comments ({comments.length})
          </button>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {isCommentsExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-6 pt-6 border-t border-slate-100"
            >
              <div className="flex gap-4 mb-6">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add review notes..." 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <button 
                  onClick={onSaveComment}
                  className="bg-navy-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-navy-800 transition-colors"
                >
                  Save Comment
                </button>
              </div>
              <div className="space-y-3">
                {comments.map((c: any) => (
                  <div key={c.id} className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
                      <User size={12} className="text-slate-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-navy-900">{c.user}</span>
                        <span className="text-[9px] text-slate-400">{c.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function EscalationCard({ invoice, serialNumber, comments, newComment, setNewComment, onSaveComment, onProcessResponse }: any) {
  const [isThreadsExpanded, setIsThreadsExpanded] = useState(true);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 left-0 bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-br-lg z-10">
        #{serialNumber}
      </div>
      {/* Summary Tiles */}
      <div className="p-4 bg-slate-50/50 border-b border-slate-100 grid grid-cols-6 gap-4 pt-6">
        <SummaryItem label="Invoice #" value={invoice.id} />
        <SummaryItem label="Vendor" value={invoice.vendor} />
        <SummaryItem label="Type" value={invoice.invoiceType} />
        <SummaryItem label="Checks Awaiting Response" value={invoice.threads.length.toString()} />
        <SummaryItem label="Amount in Contention" value={`USD ${invoice.contention.toLocaleString()}`} highlight />
        <SummaryItem label="Ageing" value={`${invoice.aging} Days`} />
      </div>

      {/* Threads List */}
      <div className="p-6">
        <button 
          onClick={() => setIsThreadsExpanded(!isThreadsExpanded)}
          className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 hover:text-navy-900 transition-colors"
        >
          Threads List {isThreadsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <AnimatePresence>
          {isThreadsExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-3"
            >
              {invoice.threads.map((t: any, idx: number) => (
                <ThreadRow key={idx} thread={t} onProcess={() => onProcessResponse(t.checkName)} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
            className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-navy-900 transition-colors flex items-center gap-1"
          >
            <MessageSquare size={12} /> Comments ({comments.length})
          </button>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {isCommentsExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-6 pt-6 border-t border-slate-100"
            >
              <div className="flex gap-4 mb-6">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add review notes..." 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <button 
                  onClick={onSaveComment}
                  className="bg-navy-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-navy-800 transition-colors"
                >
                  Save Comment
                </button>
              </div>
              <div className="space-y-3">
                {comments.map((c: any) => (
                  <div key={c.id} className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
                      <User size={12} className="text-slate-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-navy-900">{c.user}</span>
                        <span className="text-[9px] text-slate-400">{c.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ThreadRow({ thread, onProcess }: any) {
  const [isResponseExpanded, setIsResponseExpanded] = useState(thread.status === 'Response Received');
  const [autoReminder, setAutoReminder] = useState(thread.autoReminder);

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div className="grid grid-cols-5 gap-6 flex-1">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Check Name</p>
            <p className="text-xs font-semibold text-navy-900">{thread.checkName}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Recipient</p>
            <p className="text-xs text-slate-600 truncate">{thread.recipient}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Sent Date</p>
            <p className="text-xs text-slate-600">{thread.sentDate}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Status</p>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                thread.status === 'Response Received' ? 'text-green-600 bg-green-50 border-green-100' : 
                thread.status === 'Reminder Sent' ? 'text-amber-600 bg-amber-50 border-amber-100' : 
                'text-blue-600 bg-blue-50 border-blue-100'
              }`}>
                {thread.status}
              </span>
              {thread.status === 'Response Received' && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title="New Response"></span>
              )}
            </div>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Last Activity</p>
            <p className="text-xs text-slate-600">{thread.daysSinceActivity} days ago</p>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-6 border-l border-slate-100 pl-6">
          {thread.status === 'Response Received' ? (
            <button 
              onClick={onProcess}
              className="bg-green-600 text-white px-4 py-2 rounded text-[10px] font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <ArrowUpRight size={14} /> Process Response
            </button>
          ) : (
            <>
              <div className="flex flex-col items-center">
                <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Auto Reminder</p>
                <button 
                  onClick={() => setAutoReminder(!autoReminder)}
                  className={`w-8 h-4 rounded-full transition-colors relative ${autoReminder ? 'bg-amber-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${autoReminder ? 'left-4.5' : 'left-0.5'}`}></div>
                </button>
                {autoReminder && <p className="text-[8px] text-amber-600 mt-1 font-bold">Next: Mar 16</p>}
              </div>
              <button className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded text-[10px] font-bold hover:bg-slate-200 transition-colors">
                Send Now
              </button>
            </>
          )}
        </div>
      </div>

      {thread.response && (
        <div className="px-4 pb-4">
          <button 
            onClick={() => setIsResponseExpanded(!isResponseExpanded)}
            className="flex items-center gap-1 text-[10px] font-bold text-green-600 hover:text-green-700 uppercase tracking-wider"
          >
            {isResponseExpanded ? 'Hide Response' : 'View Response Received'} {isResponseExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <AnimatePresence>
            {isResponseExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3 p-3 bg-green-50 rounded border border-green-100"
              >
                <p className="text-xs text-green-800 leading-relaxed italic">"{thread.response}"</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function FindingSidePanel({ finding, onClose, resolutionType, setResolutionType, resolutionNotes, setResolutionNotes, onMarkAsPassed, onSendQuery, isAdmin, manualResolution, sentQuery, onReverse }: any) {
  const isFail = finding.status === 'fail';
  const colorClass = isFail ? 'red' : 'amber';
  const isResolved = manualResolution || sentQuery;

  return (
    <motion.div 
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      exit={{ x: 400 }}
      className="fixed top-0 right-0 w-[400px] h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col z-[100]"
    >
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-navy-900 uppercase tracking-widest">{finding.findingName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${isFail ? 'text-red-600 bg-red-50 border-red-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
              {isFail ? '❌ Audit Failed' : '⚠️ Validation Failed'}
            </span>
            {isResolved && (
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 flex items-center gap-1">
                <CheckCircle2 size={10} /> Resolved
              </span>
            )}
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-navy-900">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Audit Trail */}
        <div className="mb-8">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Audit Trail</h4>
          <div className="space-y-4 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {isFail ? (
              <>
                <SidePanelStep title="Fetched contract rate from LMS" value="USD 450.00 per TEU" status="pass" />
                <SidePanelStep title="Invoice rate found" value="USD 485.00 per TEU" status="fail" />
                <SidePanelStep title="Variance identified" value="USD 35.00 per TEU. Check Failed." status="fail" />
              </>
            ) : (
              <>
                <SidePanelStep title="Attempted to fetch supporting document from SharePoint" value="Document not found" status="warning" />
                <SidePanelStep title="Unable to complete validation" value="Manual review required" status="warning" />
              </>
            )}
            {manualResolution && (
              <SidePanelStep 
                title={`Manually resolved as Passed (${manualResolution.type})`} 
                value={manualResolution.notes || 'No notes'} 
                status="pass" 
              />
            )}
            {sentQuery && (
              <SidePanelStep 
                title="Query email sent to vendor" 
                value="Awaiting response" 
                status="pass" 
              />
            )}
          </div>
        </div>

        {!isResolved ? (
          <>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-slate-100"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Take Action</span>
              <div className="flex-1 h-px bg-slate-100"></div>
            </div>

            <div className="space-y-6">
              {isFail && (
                <div className={`bg-${colorClass}-50 rounded-xl p-6 border border-${colorClass}-100`}>
                  <h4 className={`text-xs font-bold text-${colorClass}-800 uppercase tracking-wider mb-4`}>Option A — Send Query Email</h4>
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className={`block text-[10px] font-bold text-${colorClass}-400 uppercase mb-1`}>To</label>
                      <input type="text" defaultValue="vendor.ops@example.com" className={`w-full bg-white border border-${colorClass}-200 rounded px-3 py-1.5 text-xs focus:outline-none`} />
                    </div>
                    <div>
                      <label className={`block text-[10px] font-bold text-${colorClass}-400 uppercase mb-1`}>CC</label>
                      <input type="text" defaultValue="audit.india@pacificlines.com" className={`w-full bg-white border border-${colorClass}-200 rounded px-3 py-1.5 text-xs focus:outline-none`} />
                    </div>
                    <div>
                      <label className={`block text-[10px] font-bold text-${colorClass}-400 uppercase mb-1`}>Body</label>
                      <textarea 
                        className={`w-full bg-white border border-${colorClass}-200 rounded px-3 py-2 text-xs focus:outline-none min-h-[100px]`}
                        defaultValue={`Dear Team,\n\nWe identified a rate mismatch for ${finding.findingName}. The contract rate is $450.00 but the invoice rate is $485.00.\n\nPlease review.\n\nRegards,\nAudit Team`}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={onSendQuery}
                    className={`w-full bg-${colorClass}-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-${colorClass}-700 transition-colors flex items-center justify-center gap-2`}
                  >
                    <Send size={14} /> Approve & Send
                  </button>
                </div>
              )}

              {isFail && (
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-slate-100"></div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase">OR</span>
                  <div className="flex-1 h-px bg-slate-100"></div>
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
                  {isFail ? 'Option B — Resolve Manually' : 'Resolve Manually'}
                </h4>
                <p className="text-[10px] text-slate-500 mb-4 italic">Resolve this yourself</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Resolution Type</label>
                    <select 
                      value={resolutionType}
                      onChange={(e) => setResolutionType(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="">Select resolution...</option>
                      <option value="manual">Verified Manually</option>
                      <option value="email">Verified Against Email</option>
                      <option value="exceptional">Exceptional Approval</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {resolutionType === 'other' && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Notes</label>
                      <textarea 
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder="Enter additional notes..."
                        className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none min-h-[60px]"
                      />
                    </div>
                  )}
                  
                  <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl bg-white text-center cursor-pointer hover:bg-slate-50 transition-colors">
                    <FileUp size={24} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-[10px] font-bold text-slate-600 uppercase">Upload Proof</p>
                  </div>

                  <button 
                    onClick={onMarkAsPassed}
                    disabled={!resolutionType}
                    className="w-full bg-navy-900 text-white py-2.5 rounded-lg text-xs font-bold hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark This Check as Passed
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="p-6 bg-green-50 rounded-xl border border-green-100">
              <div className="flex items-center gap-3 text-green-700 font-bold text-sm mb-4">
                <CheckCircle2 size={20} />
                <span>Finding Resolved</span>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Resolution Method</p>
                  <p className="text-xs text-green-800 font-medium">{manualResolution ? `Manual: ${manualResolution.type}` : 'Query Email Sent'}</p>
                </div>
                {manualResolution?.notes && (
                  <div>
                    <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Notes</p>
                    <p className="text-xs text-green-800 leading-relaxed">{manualResolution.notes}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Timestamp</p>
                  <p className="text-xs text-green-800">{manualResolution?.timestamp || 'Just now'}</p>
                </div>
              </div>
            </div>

            {isAdmin && (
              <button 
                onClick={onReverse}
                className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors"
              >
                <Undo2 size={16} /> Reverse Resolution
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function SidePanelStep({ title, value, status }: any) {
  const dotColor = status === 'pass' ? 'bg-green-500' : status === 'fail' ? 'bg-red-500' : 'bg-amber-500';
  return (
    <div className="flex items-start gap-4 relative z-10">
      <div className={`w-4 h-4 rounded-full ${dotColor} border-4 border-white shadow-sm`}></div>
      <div>
        <p className="text-xs text-slate-900">{title} → <b>{value}</b></p>
        <p className="text-[10px] text-slate-400">10:15 AM</p>
      </div>
    </div>
  );
}

function SummaryItem({ label, value, highlight = false }: any) {
  return (
    <div>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-xs font-bold truncate ${highlight ? 'text-red-600' : 'text-navy-900'}`}>{value}</p>
    </div>
  );
}

function SummaryTile({ label, value, trend, trendUp, icon, color }: { label: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode, color: 'amber' | 'blue' | 'navy' }) {
  const colorClasses = {
    amber: 'border-amber-200 bg-amber-50/30',
    blue: 'border-blue-200 bg-blue-50/30',
    navy: 'border-slate-200 bg-slate-50/30'
  };

  return (
    <div className={`p-4 rounded-2xl border ${colorClasses[color]} flex items-center justify-between`}>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
          <p className="text-xl font-bold text-navy-900">{value}</p>
        </div>
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {trend}
      </div>
    </div>
  );
}

function CaseAccordionCard({ index, data, isExpanded, onToggle }: any) {
  return null;
}
