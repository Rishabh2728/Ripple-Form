"use client";

import React, { useEffect, useState } from "react";
import { Dialog } from "./ui/dialog";
import { useBuilderStore } from "../stores/builder-store";
import { api } from "../lib/api-client";
import { FormHealthIssue } from "../types";
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";

export const FormHealthModal: React.FC<{
  onSelectIssueQuestion?: (questionId: string) => void;
  onPublishClick?: () => void;
}> = ({ onSelectIssueQuestion, onPublishClick }) => {
  const { form, isHealthModalOpen, toggleHealthModal } = useBuilderStore();
  const [issues, setIssues] = useState<FormHealthIssue[]>([]);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isHealthModalOpen && form) {
      setLoading(true);
      api
        .getFormHealth(form.id)
        .then((res) => {
          setIsValid(res.is_valid);
          setIssues(res.issues || []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isHealthModalOpen, form]);

  if (!form) return null;

  return (
    <Dialog
      isOpen={isHealthModalOpen}
      onClose={() => toggleHealthModal(false)}
      title="Form Health Audit"
      description="Validate structure and configuration before publishing to respondents."
    >
      <div className="space-y-4">
        {loading ? (
          <div className="py-8 text-center text-xs text-[#6F6A67] animate-pulse">Running diagnostic checks...</div>
        ) : isValid ? (
          <div className="p-4 bg-[#E6F4ED] border border-[#B7E2CE] rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#2F7D5B] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-[#2F7D5B]">Form Health ✓ Ready to Publish</h4>
              <p className="text-xs text-[#2F7D5B]/90 mt-0.5">
                All questions have valid titles, options, and settings. Respondents will enjoy a seamless experience.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3.5 bg-[#FEF3C7] border border-[#FDE68A] rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#B7791F] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[#B7791F]">
                  {issues.length} {issues.length === 1 ? "issue needs" : "issues need"} attention
                </h4>
                <p className="text-xs text-[#B7791F]/90 mt-0.5">
                  Resolve these issues so respondents can successfully submit your form.
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {issues.map((iss, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (iss.question_id && onSelectIssueQuestion) {
                      onSelectIssueQuestion(iss.question_id);
                      toggleHealthModal(false);
                    }
                  }}
                  className={`p-3 rounded-lg border border-[#E7E2DE] bg-white flex items-center justify-between text-xs transition-colors ${
                    iss.question_id ? "hover:border-[#6E1F2A] hover:bg-[#F7EEF0] cursor-pointer" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#B54747]" />
                    <span className="font-medium text-[#191716]">{iss.issue}</span>
                  </div>
                  {iss.question_id && (
                    <span className="text-[11px] font-semibold text-[#6E1F2A] flex items-center gap-1">
                      Focus <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E2DE]">
          <Button variant="outline" size="sm" onClick={() => toggleHealthModal(false)}>
            Close
          </Button>
          {isValid && onPublishClick && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                toggleHealthModal(false);
                onPublishClick();
              }}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Publish Now
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
};
