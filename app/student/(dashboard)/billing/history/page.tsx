"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useInvoices } from '@/hooks/useInvoices';
import { 
  format, 
  isSameDay, 
  isAfter, 
  subDays, 
  subMonths, 
  parseISO,
  startOfToday,
  startOfWeek,
  startOfMonth
} from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  FileSpreadsheet, 
  MoreVertical 
} from "lucide-react";

export default function BillingHistoryPage() {
  const { data: invoices, isLoading } = useInvoices();
  
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [periodFilter, setPeriodFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter Logic
  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    
    return invoices.filter((inv: any) => {
      // Search
      const matchesSearch = 
        inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.course?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      // Status
      const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;

      // Period
      const invDate = parseISO(inv.createdAt);
      let matchesPeriod = true;
      if (periodFilter === "TODAY") matchesPeriod = isSameDay(invDate, startOfToday());
      if (periodFilter === "WEEK") matchesPeriod = isAfter(invDate, subDays(new Date(), 7));
      if (periodFilter === "MONTH") matchesPeriod = isAfter(invDate, subMonths(new Date(), 1));

      return matchesSearch && matchesStatus && matchesPeriod;
    });
  }, [invoices, searchQuery, statusFilter, periodFilter]);

  // Stats (on all invoices or filtered? usually all for sum, but filtered for current view context)
  // Let's keep them on all invoices as per usual dashboard behavior
  const totalPaid = invoices?.reduce((sum: number, inv: any) => sum + parseFloat(inv.paidAmount), 0) || 0;
  const totalOutstanding = invoices?.reduce((sum: number, inv: any) => {
    const amount = parseFloat(inv.amount);
    const paid = parseFloat(inv.paidAmount);
    return sum + (amount - paid);
  }, 0) || 0;
  const nextDueInvoice = invoices?.filter((inv: any) => inv.status !== 'PAID')
    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Exporters
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("GVS Academy - Payment Statement", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${format(new Date(), "PPpp")}`, 14, 30);

    const tableData = filteredInvoices.map((inv: any) => [
      inv.id.substring(0, 8),
      format(parseISO(inv.createdAt), "dd/MM/yyyy"),
      inv.course?.title || inv.description || "Course Fee",
      `$${parseFloat(inv.amount).toFixed(2)}`,
      inv.status
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["Invoice ID", "Date", "Description", "Amount", "Status"]],
      body: tableData,
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`GVS_Statement_${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const exportCSV = () => {
    const headers = ["Invoice ID", "Date", "Description", "Amount", "Paid", "Status"];
    const rows = filteredInvoices.map((inv: any) => [
      inv.id,
      inv.createdAt,
      inv.course?.title || inv.description,
      inv.amount,
      inv.paidAmount,
      inv.status
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `billing_export_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display min-h-screen flex flex-col overflow-x-hidden transition-colors duration-200">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 px-4 md:px-10 py-3 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-slate-900 dark:text-white">
            <div className="size-8 flex items-center justify-center bg-primary/10 rounded-lg text-primary">
              <span className="material-symbols-outlined">school</span>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
              German Virtual School
            </h2>
          </div>
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-6">
              <Link
                className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                href="/student/dashboard"
              >
                Dashboard
              </Link>
              <Link
                className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                href="/courses"
              >
                Courses
              </Link>
              <Link
                className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                href="/student/assignments"
              >
                Grades
              </Link>
              <Link
                className="text-primary text-sm font-bold"
                href="/student/billing"
              >
                Billing
              </Link>
              <Link
                className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
                href="/support"
              >
                Support
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <button className="flex items-center justify-center p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-1.5 right-2 size-2 bg-red-500 rounded-full border border-white dark:border-surface-dark"></span>
              </button>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
              <div
                className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-white dark:border-slate-700 shadow-sm cursor-pointer"
                data-alt="User profile picture showing a smiling student"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDZAD4o2QbPTvq1rQNLpXJJPtVUAEg6aAKVAl4cfAVp2bc3S--WprJv3uptMpDtlRjmJvFVlIoGL9GE-al3Qims3phrGBuex8mfi6Vfwv0WmmacQSVY4tJLYhIEflnoRnZKRgjjE07n5gAh9xg0hKB_tH2vEa-1jNDikulp5LG8gp_SvUYoJSAWBN7WvIW7fzSpQvo7CcOiY3eX4bs5Ef3-7CP6HoxKY7PPVZmpTHTRPg9_FuH0cWw5Q-N1kW4EGy4owQ2W0OStWRM')",
                }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark scrollbar-hide">
        <div className="max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
          {/* Breadcrumbs */}
          <nav className="flex flex-wrap gap-2 text-sm">
            <Link
              className="text-slate-500 dark:text-slate-400 font-medium hover:text-primary transition-colors"
              href="/student/dashboard"
            >
              Home
            </Link>
            <span className="text-slate-400 dark:text-slate-600 font-medium">
              /
            </span>
            <Link
              className="text-slate-500 dark:text-slate-400 font-medium hover:text-primary transition-colors"
              href="/student/billing"
            >
              Billing
            </Link>
            <span className="text-slate-400 dark:text-slate-600 font-medium">
              /
            </span>
            <span className="text-slate-900 dark:text-white font-medium">
              History
            </span>
          </nav>

          {/* Page Heading */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2">
            <div className="flex flex-col gap-2">
              <h1 className="text-slate-900 dark:text-white text-3xl lg:text-4xl font-black leading-tight tracking-tight">
                Payment History
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-base font-normal max-w-xl">
                View and manage your tuition fees and invoices. Securely encrypted transactions.
              </p>
            </div>
            <button 
              onClick={downloadPDF}
              className="flex items-center justify-center gap-2 rounded-lg h-11 px-5 bg-primary hover:bg-blue-700 text-white text-sm font-bold leading-normal tracking-wide shadow-sm shadow-blue-500/30 transition-all active:scale-95"
            >
              <Download className="size-5" />
              <span className="whitespace-nowrap">Download Statement</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
              <div className="flex items-center justify-between">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">
                  Total Paid
                </p>
                <span className="material-symbols-outlined text-green-500 bg-green-100 dark:bg-green-900/30 p-1.5 rounded-md text-xl">
                  check_circle
                </span>
              </div>
              <p className="text-slate-900 dark:text-white text-3xl font-bold leading-tight">
                ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-400 mt-1">Just updated</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
              <div className="flex items-center justify-between">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">
                  Outstanding
                </p>
                <span className="material-symbols-outlined text-orange-500 bg-orange-100 dark:bg-orange-900/30 p-1.5 rounded-md text-xl">
                  pending
                </span>
              </div>
              <p className="text-slate-900 dark:text-white text-3xl font-bold leading-tight">
                ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Due for current semester
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
              <div className="flex items-center justify-between">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">
                  Next Due Date
                </p>
                <span className="material-symbols-outlined text-primary bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-md text-xl">
                  calendar_month
                </span>
              </div>
              <p className="text-slate-900 dark:text-white text-3xl font-bold leading-tight">
                {nextDueInvoice ? new Date(nextDueInvoice.dueDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {nextDueInvoice ? `Invoice #${nextDueInvoice.id.substring(0, 8)}` : 'No pending invoices'}
              </p>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col md:flex-row justify-between gap-4 bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400">
                  search
                </span>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition duration-150 ease-in-out"
                placeholder="Search by invoice ID or description..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0">
              <div className="relative">
                <select 
                  className="appearance-none inline-flex items-center gap-2 pl-9 pr-8 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap transition-colors cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
                <Filter className="absolute left-3 top-2.5 size-4 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select 
                  className="appearance-none inline-flex items-center gap-2 pl-9 pr-8 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap transition-colors cursor-pointer"
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                >
                  <option value="ALL">All Time</option>
                  <option value="TODAY">Today</option>
                  <option value="WEEK">Last 7 Days</option>
                  <option value="MONTH">Last 30 Days</option>
                </select>
                <CalendarIcon className="absolute left-3 top-2.5 size-4 text-slate-400 pointer-events-none" />
              </div>

              <div className="h-auto w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
              
              <button 
                onClick={exportCSV}
                className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary hover:border-primary transition-colors bg-transparent whitespace-nowrap"
              >
                <FileSpreadsheet className="size-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors duration-200">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                      scope="col"
                    >
                      Invoice ID
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                      scope="col"
                    >
                      Issue Date
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                      scope="col"
                    >
                      Description
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                      scope="col"
                    >
                      Amount
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                      scope="col"
                    >
                      Method
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                      scope="col"
                    >
                      Status
                    </th>
                    <th className="relative px-6 py-4" scope="col">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-surface-dark divide-y divide-slate-200 dark:divide-slate-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                        Loading history...
                      </td>
                    </tr>
                  ) : paginatedInvoices.length > 0 ? (
                    paginatedInvoices.map((invoice: any) => (
                      <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            className="text-primary font-medium hover:underline"
                            href={`/student/billing/pay?invoiceId=${invoice.id}`}
                          >
                            #{invoice.id.substring(0, 8)}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                          {format(parseISO(invoice.createdAt), "dd MMM yyyy")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-medium">
                          {invoice.course?.title || invoice.description || 'Course Fee'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-bold">
                          ${parseFloat(invoice.amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                          {invoice.payments?.[0]?.method || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            invoice.status === 'PAID' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : invoice.status === 'OVERDUE'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                          }`}>
                            <span className="size-1.5 rounded-full bg-current"></span>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-primary">
                            <MoreVertical className="size-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                        {searchQuery ? "No matches found for your search." : "No billing history found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                 <div className="p-10 text-center text-slate-500">Loading history...</div>
              ) : paginatedInvoices.length > 0 ? (
                paginatedInvoices.map((invoice: any) => (
                  <div key={invoice.id} className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                       <div>
                          <Link href={`/student/billing/pay?invoiceId=${invoice.id}`} className="text-sm font-bold text-primary hover:underline">
                             #{invoice.id.substring(0, 8)}
                          </Link>
                          <p className="text-xs text-slate-500 mt-0.5">{format(parseISO(invoice.createdAt), "dd MMM yyyy")}</p>
                       </div>
                       <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                            invoice.status === 'PAID' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : invoice.status === 'OVERDUE'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                          }`}>
                            {invoice.status}
                        </span>
                    </div>
                    <div>
                       <p className="font-bold text-slate-900 dark:text-white text-base">
                          {invoice.course?.title || invoice.description || 'Course Fee'}
                       </p>
                       <p className="text-xs text-slate-500 mt-1">
                          {invoice.payments?.[0]?.method || 'No payment method'}
                       </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                       <p className="text-lg font-black text-slate-900 dark:text-white">${parseFloat(invoice.amount).toFixed(2)}</p>
                       <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                          <MoreVertical className="size-5" />
                       </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-slate-500">
                   {searchQuery ? "No matches found." : "No billing history."}
                </div>
              )}
            </div>
            {/* Pagination */}
            <div className="bg-white dark:bg-surface-dark px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between sm:px-6 transition-colors duration-200">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Showing <span className="font-medium">1</span> to{" "}
                    <span className="font-medium">{Math.min(5, invoices?.length || 0)}</span> of{" "}
                    <span className="font-medium">{invoices?.length || 0}</span> results
                  </p>
                </div>
                <div>
                  <nav
                    aria-label="Pagination"
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  >
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="size-4" />
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        aria-current={currentPage === i + 1 ? "page" : undefined}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                          currentPage === i + 1
                            ? "bg-primary/10 border-primary z-10 text-primary"
                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      disabled={currentPage === totalPages || totalPages === 0}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="size-4" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
