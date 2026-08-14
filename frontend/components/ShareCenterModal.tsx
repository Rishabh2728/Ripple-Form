"use client";

import React, { useState } from "react";
import { Dialog } from "./ui/dialog";
import { useBuilderStore } from "../stores/builder-store";
import { useToast } from "./ui/toast";
import { Copy, ExternalLink, Code2, QrCode, Check } from "lucide-react";
import { Button } from "./ui/button";

export const ShareCenterModal: React.FC = () => {
  const { form, isShareModalOpen, toggleShareModal } = useBuilderStore();
  const { success } = useToast();
  const [copied, setCopied] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [tab, setTab] = useState<"link" | "embed" | "qr">("link");

  if (!form) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const publicUrl = `${origin}/f/${form.slug}`;
  const embedCode = `<iframe src="${publicUrl}" width="100%" height="600" frameborder="0" marginheight="0" marginwidth="0">Loading...</iframe>`;

  const copyToClipboard = (text: string, isEmbed = false) => {
    navigator.clipboard.writeText(text);
    if (isEmbed) {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    success(isEmbed ? "✓ Embed code copied to clipboard" : "✓ Public link copied to clipboard");
  };

  return (
    <Dialog
      isOpen={isShareModalOpen}
      onClose={() => toggleShareModal(false)}
      title="Share Center"
      description="Share your published form link or embed it directly into your website."
    >
      <div className="space-y-4">
        {/* Subtabs */}
        <div className="flex border-b border-[#E7E2DE] gap-4">
          <button
            onClick={() => setTab("link")}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
              tab === "link"
                ? "border-[#6E1F2A] text-[#6E1F2A]"
                : "border-transparent text-[#6F6A67] hover:text-[#191716]"
            }`}
          >
            Direct Link
          </button>
          <button
            onClick={() => setTab("embed")}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
              tab === "embed"
                ? "border-[#6E1F2A] text-[#6E1F2A]"
                : "border-transparent text-[#6F6A67] hover:text-[#191716]"
            }`}
          >
            Embed HTML
          </button>
          <button
            onClick={() => setTab("qr")}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors ${
              tab === "qr"
                ? "border-[#6E1F2A] text-[#6E1F2A]"
                : "border-transparent text-[#6F6A67] hover:text-[#191716]"
            }`}
          >
            QR Code
          </button>
        </div>

        {tab === "link" && (
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-[#191716] uppercase">Public Respondent URL</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full px-3 py-2 text-xs bg-[#F5F2EF] border border-[#E7E2DE] rounded-lg font-mono text-[#191716]"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => copyToClipboard(publicUrl)}
                leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            <div className="pt-2">
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E1F2A] hover:underline"
              >
                Open live public form <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {tab === "embed" && (
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-[#191716] uppercase">iFrame Snippet</label>
            <textarea
              readOnly
              rows={4}
              value={embedCode}
              className="w-full p-3 text-xs bg-[#191716] text-[#FCFBF8] border border-transparent rounded-lg font-mono resize-none focus:outline-none"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => copyToClipboard(embedCode, true)}
              leftIcon={copiedEmbed ? <Check className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
            >
              {copiedEmbed ? "Copied Code" : "Copy iFrame Code"}
            </Button>
          </div>
        )}

        {tab === "qr" && (
          <div className="py-6 text-center space-y-3">
            <div className="w-40 h-40 mx-auto bg-white p-3 border-2 border-[#E7E2DE] rounded-xl flex items-center justify-center shadow-subtle">
              {/* QR Code Placeholder vector graphic */}
              <div className="w-full h-full border border-dashed border-[#6F6A67] rounded-lg flex flex-col items-center justify-center p-2 text-center">
                <QrCode className="w-12 h-12 text-[#6E1F2A] mb-1" />
                <span className="text-[10px] font-mono text-[#6F6A67]">Scan for Mobile</span>
              </div>
            </div>
            <p className="text-xs text-[#6F6A67]">Scan with any smartphone camera to open this form directly.</p>
          </div>
        )}
      </div>
    </Dialog>
  );
};
