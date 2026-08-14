"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "../../../components/Navbar";
import { useAuthStore } from "../../../stores/auth-store";
import { api } from "../../../lib/api-client";
import { Form, ResponseListItem } from "../../../types";
import { useToast } from "../../../components/ui/toast";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  ArrowLeft, Download, Search, MessageSquare, Clock, CheckCircle2, ChevronLeft, ChevronRight, Eye
} from "lucide-react";

export default function ResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const { user, fetchUser } = useAuthStore();
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<ResponseListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user && formId) {
      api.getForm(formId).then(setForm).catch(() => {});
    }
  }, [user, formId]);

  const loadResponses = async () => {
    if (!formId) return;
    try {
      setLoading(true);
      const res = await api.getResponses(formId, page, 15, search);
      setResponses(res.responses);
      setTotal(res.total);
    } catch (err) {
      toastError("Failed to load responses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadResponses();
    }
  }, [user, formId, page, search]);

  const handleExportCSV = () => {
    const url = api.getExportUrl(formId);
    window.open(url, "_blank");
    success("CSV export download started.");
  };

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF8]">
        <div className="w-8 h-8 border-4 border-[#6E1F2A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalPages = Math.ceil(total / 15) || 1;

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF8]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Link href={`/builder/${form.id}`} className="text-xs font-semibold text-[#6E1F2A] hover:underline flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Builder
            </Link>
            <h1 className="text-2xl font-extrabold text-[#191716] tracking-tight flex items-center gap-3">
              <span>{form.title}</span>
              <span className="text-sm font-semibold text-[#6F6A67]">Submissions Dashboard</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/analytics/${form.id}`}>
              <Button variant="outline" size="sm">
                View Analytics
              </Button>
            </Link>
            <Button variant="primary" size="sm" onClick={handleExportCSV} leftIcon={<Download className="w-4 h-4" />}>
              Export CSV
            </Button>
          </div>
        </div>

        {/* Overview metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-[#E7E2DE] p-5 rounded-2xl shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6F6A67] uppercase">Total Submissions</span>
              <MessageSquare className="w-4 h-4 text-[#6E1F2A]" />
            </div>
            <p className="text-3xl font-extrabold text-[#191716] mt-2">{total}</p>
          </div>

          <div className="bg-white border border-[#E7E2DE] p-5 rounded-2xl shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6F6A67] uppercase">Completion Status</span>
              <CheckCircle2 className="w-4 h-4 text-[#2F7D5B]" />
            </div>
            <p className="text-3xl font-extrabold text-[#2F7D5B] mt-2">100%</p>
          </div>

          <div className="bg-white border border-[#E7E2DE] p-5 rounded-2xl shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6F6A67] uppercase">Avg Completion Time</span>
              <Clock className="w-4 h-4 text-[#41658A]" />
            </div>
            <p className="text-3xl font-extrabold text-[#191716] mt-2">
              {responses.length > 0
                ? `${Math.round(
                    responses.reduce((acc, r) => acc + (r.completion_time_seconds || 0), 0) / responses.length
                  )}s`
                : "0s"}
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-[#E7E2DE] rounded-2xl shadow-subtle overflow-hidden">
          <div className="p-4 border-b border-[#E7E2DE] flex items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#6F6A67] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter by respondent token..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F5F2EF] border border-[#E7E2DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6E1F2A]"
              />
            </div>

            <span className="text-xs font-semibold text-[#6F6A67]">Showing {responses.length} of {total}</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FCFBF8] border-b border-[#E7E2DE] uppercase text-[#6F6A67] font-semibold">
                <tr>
                  <th className="px-6 py-3">Submission ID</th>
                  <th className="px-6 py-3">Respondent Token</th>
                  <th className="px-6 py-3">Submitted Date</th>
                  <th className="px-6 py-3">Completion Time</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E2DE]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#6F6A67] animate-pulse">
                      Loading submission records...
                    </td>
                  </tr>
                ) : responses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#6F6A67]">
                      No responses recorded yet for this form.
                    </td>
                  </tr>
                ) : (
                  responses.map((r) => (
                    <tr key={r.id} className="hover:bg-[#F5F2EF]/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-[#6E1F2A]">{r.id.substring(0, 8)}...</td>
                      <td className="px-6 py-4 font-mono text-[#191716]">{r.respondent_token}</td>
                      <td className="px-6 py-4 text-[#6F6A67]">
                        {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-[#191716] font-semibold">{r.completion_time_seconds || 0} seconds</td>
                      <td className="px-6 py-4">
                        <Badge variant="published">{r.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/responses/${form.id}/${r.id}`}>
                          <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                            Inspect
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-[#E7E2DE] bg-[#FCFBF8] flex items-center justify-between text-xs">
            <span className="text-[#6F6A67]">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
