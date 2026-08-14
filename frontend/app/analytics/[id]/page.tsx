"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "../../../components/Navbar";
import { useAuthStore } from "../../../stores/auth-store";
import { api } from "../../../lib/api-client";
import { FormAnalyticsResponse, QuestionAnalytics } from "../../../types";
import { ArrowLeft, BarChart3, PieChart, TrendingUp, Clock, Star, Heart, CheckCircle2 } from "lucide-react";
import { Button } from "../../../components/ui/button";

export default function AnalyticsPage() {
  const params = useParams();
  const formId = params.id as string;

  const { user, fetchUser } = useAuthStore();
  const [data, setData] = useState<FormAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user && formId) {
      setLoading(true);
      api
        .getAnalytics(formId)
        .then(setData)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, formId]);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF8]">
        <div className="w-8 h-8 border-4 border-[#6E1F2A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF8]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <Link href={`/builder/${formId}`} className="text-xs font-semibold text-[#6E1F2A] hover:underline flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Builder
            </Link>
            <h1 className="text-2xl font-extrabold text-[#191716] tracking-tight flex items-center gap-3">
              <span>{data.title}</span>
              <span className="text-sm font-semibold text-[#6F6A67]">Analytics Overview</span>
            </h1>
          </div>

          <Link href={`/responses/${formId}`}>
            <Button variant="outline" size="sm">
              View Submissions Table
            </Button>
          </Link>
        </div>

        {/* Aggregated Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-[#E7E2DE] p-5 rounded-2xl shadow-subtle">
            <span className="text-xs font-semibold text-[#6F6A67] uppercase">Total Views</span>
            <p className="text-3xl font-extrabold text-[#191716] mt-2">{data.total_views}</p>
          </div>

          <div className="bg-white border border-[#E7E2DE] p-5 rounded-2xl shadow-subtle">
            <span className="text-xs font-semibold text-[#6F6A67] uppercase">Completed Submissions</span>
            <p className="text-3xl font-extrabold text-[#2F7D5B] mt-2">{data.total_completed}</p>
          </div>

          <div className="bg-white border border-[#E7E2DE] p-5 rounded-2xl shadow-subtle">
            <span className="text-xs font-semibold text-[#6F6A67] uppercase">Completion Rate</span>
            <p className="text-3xl font-extrabold text-[#6E1F2A] mt-2">{data.completion_rate}%</p>
          </div>

          <div className="bg-white border border-[#E7E2DE] p-5 rounded-2xl shadow-subtle">
            <span className="text-xs font-semibold text-[#6F6A67] uppercase">Avg Completion Time</span>
            <p className="text-3xl font-extrabold text-[#41658A] mt-2">{data.average_completion_time_seconds}s</p>
          </div>
        </div>

        {/* Question-Level Analytics */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-[#191716] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#6E1F2A]" /> Question Breakdown
          </h2>

          {data.questions.map((q, idx) => (
            <div key={q.question_id || idx} className="bg-white border border-[#E7E2DE] rounded-2xl p-6 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-[#E7E2DE] pb-3">
                <div>
                  <span className="text-xs font-bold text-[#6E1F2A] uppercase">
                    Question {idx + 1} • {q.type}
                  </span>
                  <h3 className="text-base font-bold text-[#191716] mt-0.5">{q.title}</h3>
                </div>
                <span className="text-xs font-semibold text-[#6F6A67] bg-[#F5F2EF] px-2.5 py-1 rounded-lg">
                  {q.total_answers} answers
                </span>
              </div>

              {/* Choices Breakdown */}
              {q.choices_breakdown && q.choices_breakdown.length > 0 && (
                <div className="space-y-3 pt-2">
                  {q.choices_breakdown.map((choice, cIdx) => (
                    <div key={cIdx} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-[#191716]">
                        <span>{choice.label}</span>
                        <span className="font-bold">{choice.count} ({choice.percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full h-3 bg-[#F5F2EF] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#6E1F2A] rounded-full transition-all duration-500"
                          style={{ width: `${choice.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Rating & NPS */}
              {q.type === "nps" && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-[#FCFBF8] border border-[#E7E2DE] rounded-xl text-center">
                    <div>
                      <span className="text-[11px] font-bold uppercase text-[#6F6A67]">NPS Score</span>
                      <p className="text-2xl font-black text-[#6E1F2A]">{q.nps_score ?? 0}</p>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase text-[#2F7D5B]">Promoters (9-10)</span>
                      <p className="text-xl font-bold text-[#2F7D5B]">{q.promoters_pct ?? 0}%</p>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase text-[#B7791F]">Passives (7-8)</span>
                      <p className="text-xl font-bold text-[#B7791F]">{q.passives_pct ?? 0}%</p>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase text-[#B54747]">Detractors (0-6)</span>
                      <p className="text-xl font-bold text-[#B54747]">{q.detractors_pct ?? 0}%</p>
                    </div>
                  </div>
                </div>
              )}

              {q.type === "rating" && (
                <div className="p-4 bg-[#FCFBF8] border border-[#E7E2DE] rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#6F6A67]">Average Star Rating</span>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-5 h-5 text-[#B7791F] fill-[#B7791F]" />
                    <span className="text-xl font-extrabold text-[#191716]">{q.average_score ?? 0} / 5</span>
                  </div>
                </div>
              )}

              {/* Numeric */}
              {q.type === "number" && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-[#FCFBF8] border border-[#E7E2DE] rounded-xl text-center text-xs">
                  <div>
                    <span className="font-semibold text-[#6F6A67]">Average</span>
                    <p className="text-base font-bold text-[#191716]">{q.average_score ?? 0}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-[#6F6A67]">Min</span>
                    <p className="text-base font-bold text-[#191716]">{q.min_value ?? 0}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-[#6F6A67]">Max</span>
                    <p className="text-base font-bold text-[#191716]">{q.max_value ?? 0}</p>
                  </div>
                </div>
              )}

              {/* Text Sample */}
              {q.recent_text_responses && q.recent_text_responses.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-[#6F6A67] uppercase">Recent Text Responses</span>
                  <div className="space-y-1.5">
                    {q.recent_text_responses.map((txt, tIdx) => (
                      <div key={tIdx} className="p-3 bg-[#FCFBF8] border border-[#E7E2DE] rounded-xl text-xs text-[#191716]">
                        &quot;{txt}&quot;
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
