"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Dialog } from "../../components/ui/dialog";
import { useToast } from "../../components/ui/toast";
import {
  Package, MapPin, CreditCard, Download, ArrowLeft,
  CheckCircle2, Clock, Truck, ShieldCheck, Edit3, Loader2, FileText
} from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  plan: string;
  price: number;
  quantity: number;
}

export default function OrderPage() {
  const { success, error: toastError } = useToast();

  // Order Details State
  const [orderId] = useState("ORD-2026-89412");
  const [orderDate] = useState("August 14, 2026");
  const [orderStatus, setOrderStatus] = useState<"processing" | "shipped" | "delivered">("processing");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid">("pending");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Address State
  const [address, setAddress] = useState({
    fullName: "Rishabh Kumar",
    street: "42 Tech Innovation Blvd, Suite 400",
    city: "San Francisco",
    state: "CA",
    zipCode: "94107",
    country: "United States",
  });
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [tempAddress, setTempAddress] = useState({ ...address });

  // Order Items
  const [items] = useState<OrderItem[]>([
    { id: "item-1", name: "Ripple Pro Subscription", plan: "Annual Creator Plan", price: 199.0, quantity: 1 },
    { id: "item-2", name: "Custom Domain Add-on", plan: "SSL Managed Subdomain", price: 29.0, quantity: 1 },
  ]);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // Handle Payment Integration (Razorpay / Stripe Simulation)
  const handlePayment = async (provider: "stripe" | "razorpay") => {
    setIsProcessingPayment(true);
    try {
      // Simulate API call & payment gateway modal
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setPaymentStatus("paid");
      setOrderStatus("shipped");
      success(`✓ Payment successful via ${provider === "stripe" ? "Stripe" : "Razorpay"}! Order status updated.`);
    } catch (err) {
      toastError("Payment processing failed. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle Address Update
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddress({ ...tempAddress });
    setIsAddressModalOpen(false);
    success("Shipping & billing address updated.");
  };

  // Handle Invoice Download (RFC4180 / PDF Text Blob)
  const handleDownloadInvoice = () => {
    const invoiceText = `
RIPPLE SAAS INVOICE
----------------------------------------
Invoice ID: INV-${orderId}
Order Date: ${orderDate}
Status: ${paymentStatus.toUpperCase()}

BILL TO:
${address.fullName}
${address.street}
${address.city}, ${address.state} ${address.zipCode}
${address.country}

ITEMS:
${items.map((item) => `- ${item.name} (${item.plan}) x${item.quantity}: \$${item.price.toFixed(2)}`).join("\n")}

----------------------------------------
Subtotal: \$${subtotal.toFixed(2)}
Tax (8%): \$${tax.toFixed(2)}
TOTAL PAID: \$${total.toFixed(2)}
----------------------------------------
Thank you for using Ripple!
`.trim();

    const blob = new Blob([invoiceText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice_${orderId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    success("Invoice downloaded.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF8]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Navigation Back */}
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-[#6E1F2A] hover:underline inline-flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E7E2DE] mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6E1F2A] bg-[#F7EEF0] px-2.5 py-0.5 rounded-full">
                Order Summary
              </span>
              <span className="text-xs text-[#6F6A67]">Placed on {orderDate}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191716] tracking-tight flex items-center gap-3">
              <span>Order #{orderId}</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadInvoice}
              leftIcon={<Download className="w-4 h-4 text-[#6E1F2A]" />}
            >
              Download Invoice
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Items & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items Table */}
            <div className="bg-white border border-[#E7E2DE] rounded-2xl p-6 shadow-subtle space-y-4">
              <h2 className="text-base font-bold text-[#191716] flex items-center gap-2 border-b border-[#E7E2DE] pb-3">
                <Package className="w-4 h-4 text-[#6E1F2A]" /> Purchased Items
              </h2>

              <div className="divide-y divide-[#E7E2DE]">
                {items.map((item) => (
                  <div key={item.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div>
                      <h3 className="text-sm font-bold text-[#191716]">{item.name}</h3>
                      <p className="text-xs text-[#6F6A67]">{item.plan}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-[#191716]">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-[11px] text-[#6F6A67]">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="pt-4 border-t border-[#E7E2DE] space-y-2 text-xs">
                <div className="flex justify-between text-[#6F6A67]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#191716]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#6F6A67]">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-semibold text-[#191716]">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#191716] pt-2 border-t border-[#E7E2DE]">
                  <span>Total Amount</span>
                  <span className="text-[#6E1F2A]">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Order Tracking Timeline */}
            <div className="bg-white border border-[#E7E2DE] rounded-2xl p-6 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-[#E7E2DE] pb-3">
                <h2 className="text-base font-bold text-[#191716] flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#6E1F2A]" /> Order Status & Tracking
                </h2>
                <span className="text-xs font-bold text-[#6E1F2A] uppercase bg-[#F7EEF0] px-2.5 py-1 rounded-full">
                  {orderStatus}
                </span>
              </div>

              {/* Tracking Steps */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-[#2F7D5B] text-white flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#191716]">Order Placed</span>
                  <span className="text-[10px] text-[#6F6A67]">Completed</span>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                      paymentStatus === "paid" ? "bg-[#2F7D5B] text-white" : "bg-[#B7791F] text-white animate-pulse"
                    }`}
                  >
                    {paymentStatus === "paid" ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <span className="text-xs font-bold text-[#191716]">Processing</span>
                  <span className="text-[10px] text-[#6F6A67]">
                    {paymentStatus === "paid" ? "Active" : "Awaiting Payment"}
                  </span>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                      orderStatus === "delivered"
                        ? "bg-[#2F7D5B] text-white"
                        : "bg-[#F5F2EF] text-[#6F6A67] border border-[#E7E2DE]"
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#191716]">Full Fulfillment</span>
                  <span className="text-[10px] text-[#6F6A67]">Digital Delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Address & Payment Gateways */}
          <div className="space-y-6">
            {/* Address Card */}
            <div className="bg-white border border-[#E7E2DE] rounded-2xl p-6 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-[#E7E2DE] pb-3">
                <h2 className="text-base font-bold text-[#191716] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#6E1F2A]" /> Shipping & Billing
                </h2>
                <button
                  onClick={() => {
                    setTempAddress({ ...address });
                    setIsAddressModalOpen(true);
                  }}
                  className="text-xs font-semibold text-[#6E1F2A] hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              </div>

              <div className="text-xs space-y-1 text-[#6F6A67]">
                <p className="font-bold text-[#191716] text-sm">{address.fullName}</p>
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.state} {address.zipCode}
                </p>
                <p>{address.country}</p>
              </div>
            </div>

            {/* Payment Integration Gateways */}
            <div className="bg-white border border-[#E7E2DE] rounded-2xl p-6 shadow-subtle space-y-4">
              <h2 className="text-base font-bold text-[#191716] flex items-center gap-2 border-b border-[#E7E2DE] pb-3">
                <CreditCard className="w-4 h-4 text-[#6E1F2A]" /> Payment Checkout
              </h2>

              {paymentStatus === "paid" ? (
                <div className="p-4 bg-[#F4F7F4] border border-[#D2E2D8] rounded-xl text-center space-y-2">
                  <div className="w-8 h-8 rounded-full bg-[#2F7D5B] text-white flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-[#2F7D5B]">Payment Confirmed</p>
                  <p className="text-[11px] text-[#6F6A67]">Thank you! Your subscription is active.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-[#6F6A67]">Select your preferred payment gateway to complete checkout:</p>

                  <Button
                    variant="primary"
                    size="md"
                    className="w-full justify-between"
                    isLoading={isProcessingPayment}
                    onClick={() => handlePayment("stripe")}
                  >
                    <span>Pay with Stripe</span>
                    <span className="font-bold text-xs bg-white/20 px-2 py-0.5 rounded">${total.toFixed(2)}</span>
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full justify-between border border-[#E7E2DE]"
                    isLoading={isProcessingPayment}
                    onClick={() => handlePayment("razorpay")}
                  >
                    <span>Pay with Razorpay</span>
                    <span className="font-bold text-xs bg-[#6E1F2A]/10 text-[#6E1F2A] px-2 py-0.5 rounded">
                      ${total.toFixed(2)}
                    </span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Address Dialog */}
      <Dialog isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} title="Update Billing & Shipping Address">
        <form onSubmit={handleAddressSubmit} className="space-y-3">
          <Input
            label="Full Name"
            value={tempAddress.fullName}
            onChange={(e) => setTempAddress({ ...tempAddress, fullName: e.target.value })}
            required
          />
          <Input
            label="Street Address"
            value={tempAddress.street}
            onChange={(e) => setTempAddress({ ...tempAddress, street: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              value={tempAddress.city}
              onChange={(e) => setTempAddress({ ...tempAddress, city: e.target.value })}
              required
            />
            <Input
              label="State / Province"
              value={tempAddress.state}
              onChange={(e) => setTempAddress({ ...tempAddress, state: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="ZIP / Postal Code"
              value={tempAddress.zipCode}
              onChange={(e) => setTempAddress({ ...tempAddress, zipCode: e.target.value })}
              required
            />
            <Input
              label="Country"
              value={tempAddress.country}
              onChange={(e) => setTempAddress({ ...tempAddress, country: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddressModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Address
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
