"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "../../../../components/Navbar";
import { useAuthStore } from "../../../../stores/auth-store";
import { api } from "../../../../lib/api-client";
import { IndividualResponseView } from "../../../../types";
import { ArrowLeft, Clock, Calendar, Star, CheckCircle2 } from "lucide-react";
import { Badge } from "../../../../components/ui/badge";

export default function IndividualResponsePage() {
  const params = useParams();
  const formId = params.id as string;
  const responseId = params.responseId as string;

  const { user, fetchUser } = useAuthStore();
  const [detail, setDetail] = useState<IndividualResponseView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user && responseId) {
      setLoading(true);
      api
        .getResponseDetail(responseId)
        .then(setDetail)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, responseId]);

  if (loading || !detail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF8]">
        <div className="w-8 h-8 border-4 border-[#6E1F2A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const answerMap = new Map<string, any>();
  detail.answers.forEach((ans) => {
    answerMap.set(ans.question_id, ans.value);
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF8]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
        <Link
          href={`/responses/${formId}`}
          className="text-xs font-semibold text-[#6E1F2A] hover:underline flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Submissions
        </Link>

        {/* Card Header */}
        <div className="bg-white border border-[#E7E2DE] rounded-2xl p-6 shadow-subtle mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E2DE]">
            <div>
              <span className="text-xs font-bold text-[#6E1F2A] uppercase tracking-wider">
                Published Version v{detail.version_number}
              </span>
              <h1 className="text-2xl font-extrabold text-[#191716] tracking-tight">
                Submission #{detail.id.substring(0, 8)}
              </h1>
            </div>
            <Badge variant="published">{detail.status}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2 text-[#6F6A67]">
              <Calendar className="w-4 h-4 text-[#6E1F2A]" />
              <span>Submitted: {detail.submitted_at ? new Date(detail.submitted_at).toLocaleString() : "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 text-[#6F6A67]">
              <Clock className="w-4 h-4 text-[#6E1F2A]" />
              <span>Completion Time: {detail.completion_time_seconds || 0}s</span>
            </div>
            <div className="flex items-center gap-2 text-[#6F6A67]">
              <span className="font-mono text-[#191716]">Token: {detail.respondent_token}</span>
            </div>
          </div>
        </div>

        {/* Answers List */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-[#191716]">Respondent Answers</h2>

          {detail.questions_snapshot.map((q, idx) => {
            const val = answerMap.get(q.id);

            return (
              <div key={q.id || idx} className="bg-white border border-[#E7E2DE] rounded-2xl p-6 shadow-subtle space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#6E1F2A]">
                  <span>{String(idx + 1).padStart(2, "0")}</span>
                  <span className="text-[#6F6A67] font-normal">• {q.type}</span>
                </div>

                <h3 className="text-base font-bold text-[#191716]">{q.title}</h3>
                {q.description && <p className="text-xs text-[#6F6A67]">{q.description}</p>}

                <div className="pt-2">
                  {val === undefined || val === null || val === "" ? (
                    <span className="text-xs italic text-[#6F6A67]">No answer provided</span>
                  ) : q.type === "rating" ? (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Number(val) ? "text-[#B7791F] fill-[#B7791F]" : "text-[#E7E2DE]"
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold ml-2 text-[#191716]">{val} / 5</span>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-[#FCFBF8] border border-[#E7E2DE] rounded-xl text-sm font-semibold text-[#191716]">
                      {Array.isArray(val) ? val.join(", ") : String(val)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
