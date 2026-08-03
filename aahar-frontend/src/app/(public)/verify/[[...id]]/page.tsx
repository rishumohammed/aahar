"use client";
import { useState, useEffect }  from "react";
import { useParams } from "next/navigation";
import { verifyApi } from "@/lib/api";
import { Search, CheckCircle2, AlertTriangle, XCircle, Calendar, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function VerifyPage() {
  const params = useParams();
  const certIdParam = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : "";

  const [query,   setQuery]   = useState(certIdParam || "");
  const [result,  setResult]  = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleVerify = async (searchQuery?: string) => {
    const term = (searchQuery || query || "").trim();
    if (!term) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      // Try cert number lookup first
      const res = term.toUpperCase().startsWith("AHR-")
        ? await verifyApi.lookup(term.toUpperCase())
        : await verifyApi.search(term);
      setResult(res.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Certificate not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certIdParam) {
      handleVerify(certIdParam);
    }
  }, [certIdParam]);

  return (
    <div className="min-h-screen bg-aahar-wash py-20">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="text-center mb-12">
          <ShieldCheck className="h-16 w-16 text-aahar-teal mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-aahar-dark mb-4">Trust Verification</h1>
          <p className="text-aahar-body">Verify AAHAR certification status for any restaurant or hotel</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl border border-aahar-border mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-aahar-body/50" />
              <Input
                placeholder="Enter Certificate Number (AHR-...) or Business Name"
                className="pl-12 h-14 rounded-xl border-aahar-border focus-visible:ring-aahar-teal text-base"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              />
            </div>
            <Button 
              className="h-14 px-8 rounded-xl bg-aahar-teal hover:bg-aahar-teal/90 text-white font-black uppercase tracking-wider text-xs w-full sm:w-auto shrink-0 shadow-xl shadow-aahar-teal/20 transition-all hover:scale-105 active:scale-95"
              onClick={() => handleVerify()}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify Now"}
            </Button>
          </div>
          {error && <p className="mt-4 text-sm text-rose-600 font-bold text-center">{error}</p>}
        </div>

        {result && !Array.isArray(result) && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-aahar-border animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`p-6 text-center ${
              result.status === "active" ? "bg-emerald-50 border-b border-emerald-100" : 
              result.status === "expiring" ? "bg-amber-50 border-b border-amber-100" : "bg-rose-50 border-b border-rose-100"
            }`}>
              {result.status === "active" ? (
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
              ) : result.status === "expiring" ? (
                <AlertTriangle className="h-12 w-12 text-amber-600 mx-auto mb-2" />
              ) : (
                <XCircle className="h-12 w-12 text-rose-600 mx-auto mb-2" />
              )}
              <h2 className="text-2xl font-black text-aahar-dark uppercase tracking-wider">
                {result.status === "active" ? "Verified Active" : 
                 result.status === "expiring" ? "Expiring Soon" : "Certificate Expired"}
              </h2>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start border-b border-aahar-border pb-6">
                <div>
                  <p className="text-xs font-bold text-aahar-teal uppercase tracking-widest mb-1">Entity Name</p>
                  <h3 className="text-2xl font-bold text-aahar-dark">{result.entity.name}</h3>
                  <p className="text-aahar-body">{result.entity.city}, {result.entity.state || 'India'}</p>
                </div>
                <Badge variant="outline" className="text-lg py-1 px-4 font-mono">
                  {result.certNumber}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="flex items-center gap-4">
                  <Calendar className="h-8 w-8 text-aahar-body opacity-20" />
                  <div>
                    <p className="text-xs font-bold text-aahar-body uppercase tracking-widest">Issued On</p>
                    <p className="font-bold text-aahar-dark">
                      {new Date(result.issuedAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Calendar className="h-8 w-8 text-aahar-body opacity-20" />
                  <div>
                    <p className="text-xs font-bold text-aahar-body uppercase tracking-widest">Expires On</p>
                    <p className="font-bold text-aahar-dark">
                      {new Date(result.expiresAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {result.hygieneScore && (
                <div className="bg-aahar-wash rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-aahar-body uppercase tracking-widest">Hygiene Rating</p>
                    <p className="text-sm text-aahar-body">Last audited on {new Date(result.lastAuditDate || result.issuedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-3xl font-black text-aahar-teal">
                    {result.hygieneScore}/5
                  </div>
                </div>
              )}

              {result.daysRemaining > 0 && (
                <p className="text-center text-sm font-medium text-aahar-body">
                  Verification expires in <span className="text-aahar-dark font-bold">{result.daysRemaining} days</span>
                </p>
              )}
            </div>
          </div>
        )}

        {result && Array.isArray(result) && (
          <div className="space-y-4">
            <p className="text-sm text-aahar-body font-bold mb-4 px-2">Found {result.length} matching entities:</p>
            {result.map((item: any) => (
              <div 
                key={item.certNumber}
                className="bg-white rounded-2xl p-6 border border-aahar-border shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                onClick={() => {
                  setQuery(item.certNumber);
                  handleVerify();
                }}
              >
                <div>
                  <h3 className="font-black text-aahar-dark group-hover:text-aahar-teal transition-colors">{item.entity.name}</h3>
                  <p className="text-xs text-aahar-body mt-1">{item.entity.city} • {item.type.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="font-mono mb-2">{item.certNumber}</Badge>
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </div>
                </div>
              </div>
            ))}
            {result.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-aahar-border">
                <p className="text-aahar-body font-bold">No verified entities found matching "{query}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
