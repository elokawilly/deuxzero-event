"use client";

import Image from "next/image";
import { useState } from "react";
import { CheckCircle2, CreditCard, Mail, RefreshCw, ShieldCheck, Trophy } from "lucide-react";

type Formula = "transport" | "hotel";
type PaymentMethod = "especes" | "virement" | "paypal";
type Payment = { date?: string; amount?: number; reference?: string };
type Profile = {
  registered?: boolean;
  name?: string;
  email?: string;
  formula?: string;
  total?: number;
  paid?: number;
  balance?: number;
  payments?: Payment[];
};

// Lien PayPal confirmé pour les cotisations FC 2Zéro.
const ASSOCIATION_PAYPAL_URL: string = "https://paypal.me/willyeloka";
const ADMIN_SHEET_URL = process.env.NEXT_PUBLIC_ADMIN_SHEET_URL ?? "";
const amountFor = (f: Formula) => (f === "hotel" ? 150 : 100);
const euro = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

async function api(action: string, data: Record<string, unknown> = {}) {
  const response = await fetch("/api/cotisations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ action, ...data }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok === false || result.error) {
    throw new Error(result.error || `Erreur du serveur (${response.status})`);
  }
  return result;
}

export default function DeuxZeroEventSite() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"email" | "code" | "member">("email");
  const [name, setName] = useState("");
  const [formula, setFormula] = useState<Formula>("transport");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [amount, setAmount] = useState(25);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("especes");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmation, setConfirmation] = useState<{ amount: number; method: string; reference: string; paypal: boolean } | null>(null);

  async function run(task: () => Promise<void>) {
    setError("");
    setNotice("");
    setLoading(true);
    try { await task(); }
    catch (e) { setError(e instanceof Error ? e.message : "Une erreur est survenue."); }
    finally { setLoading(false); }
  }

  function loadProfile(data: Profile) {
    setProfile(data);
    if (data.name) setName(data.name);
    if (data.formula) setFormula(data.formula.toLowerCase().includes("hébergement") ? "hotel" : "transport");
  }

  const requestCode = () => run(async () => {
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) throw new Error("Renseigne une adresse email valide.");
    await api("requestCode", { email: clean });
    setEmail(clean);
    setStep("code");
    setNotice("Un code de vérification vient d'être demandé. Consulte ta boîte email et tes spams.");
  });

  const verifyCode = () => run(async () => {
    if (!code.trim()) throw new Error("Saisis le code reçu par email.");
    const result = await api("verifyCode", { email, code: code.trim() });
    const sessionToken = result.token || result.sessionToken;
    if (!sessionToken) throw new Error("Code accepté, mais aucun jeton de session n'a été retourné. Vérifie la réponse de l'API.");
    setToken(sessionToken);
    const data = await api("profile", { token: sessionToken });
    loadProfile(data);
    setStep("member");
  });

  const refresh = () => run(async () => {
    const data = await api("profile", { token });
    loadProfile(data);
    setNotice("Suivi actualisé à partir des versements validés.");
  });

  const enroll = () => run(async () => {
    if (name.trim().length < 2) throw new Error("Renseigne ton nom complet.");
    await api("enroll", { token, name: name.trim(), formula });
    const data = await api("profile", { token });
    loadProfile(data);
    setNotice("Inscription enregistrée. Tu peux maintenant consulter ton solde.");
  });

  const declarePayment = () => run(async () => {
    if (!validAmount) throw new Error("Le montant saisi n’est pas valide.");
    if (paymentMethod === "paypal" && !paypalUrl) {
      throw new Error("Le compte PayPal officiel n’est pas encore configuré.");
    }
    // Cette action doit enregistrer une déclaration EN ATTENTE dans Google Sheets.
    // Elle ne doit JAMAIS augmenter le montant payé ni diminuer le solde.
    const result = await api("declarePayment", { token, amount, paymentMethod });
    const method = paymentMethod === "especes" ? "Espèces" : paymentMethod === "virement" ? "Virement" : "PayPal";
    setConfirmation({ amount, method, reference: String(result.reference || ""), paypal: paymentMethod === "paypal" });
    setNotice("Déclaration enregistrée. Un récapitulatif a été demandé par e-mail pour toi et une notification pour l'administrateur. Ton solde reste inchangé jusqu'à validation.");
  });

  const total = Number(profile?.total ?? amountFor(formula));
  const paid = Number(profile?.paid ?? 0);
  const balance = Math.max(0, Number(profile?.balance ?? total - paid));
  const progress = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  const validAmount = Number.isFinite(amount) && amount > 0 && amount <= balance && (amount >= 25 || amount === balance);
  const paypalUrl = ASSOCIATION_PAYPAL_URL
    ? `${ASSOCIATION_PAYPAL_URL.replace(/\/$/, "")}/${amount}`
    : "";

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-gradient-to-br from-orange-500/20 via-black to-black px-5 py-16 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-300">
            <Trophy size={16} /> FC 2Zéro Paris
          </div>
          <h1 className="text-4xl font-black md:text-6xl">Déplacement de mai 2027</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/70">Choisis ta formule, participe à ton rythme et retrouve le suivi de tes cotisations en toute simplicité.</p>
          <a href="#cotisation" className="mt-8 inline-block rounded-2xl bg-orange-500 px-8 py-4 text-lg font-bold hover:bg-orange-400">Accéder à mon espace</a>
        </div>
      </header>

      <section id="cotisation" className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6 md:p-8">
          <h2 className="text-2xl font-black">Mon espace cotisation</h2>
          <p className="mt-2 text-sm text-white/60">Identification sécurisée par code envoyé à ton adresse email.</p>

          {error && <p role="alert" className="mt-5 rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-200">{error}</p>}
          {notice && <p role="status" className="mt-5 rounded-xl border border-green-500/30 bg-green-950/30 p-4 text-sm text-green-200">{notice}</p>}

          {step === "email" && (
            <form onSubmit={e => { e.preventDefault(); requestCode(); }} className="mt-7 space-y-4">
              <label htmlFor="email" className="flex items-center gap-2 text-sm text-white/70"><Mail size={17} /> Adresse email</label>
              <input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tonadresse@email.com" className="w-full rounded-xl border border-white/15 bg-black p-4 outline-none focus:border-orange-400" />
              <button disabled={loading} className="w-full rounded-xl bg-orange-500 p-4 font-bold disabled:opacity-50">{loading ? "Envoi en cours…" : "Recevoir mon code"}</button>
            </form>
          )}

          {step === "code" && (
            <form onSubmit={e => { e.preventDefault(); verifyCode(); }} className="mt-7 space-y-4">
              <p className="text-sm text-white/70">Code envoyé à <strong className="text-white">{email}</strong></p>
              <label htmlFor="code" className="block text-sm text-white/70">Code de vérification</label>
              <input id="code" required autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value)} placeholder="Code reçu par email" className="w-full rounded-xl border border-white/15 bg-black p-4 outline-none focus:border-orange-400" />
              <button disabled={loading} className="w-full rounded-xl bg-orange-500 p-4 font-bold disabled:opacity-50">{loading ? "Vérification…" : "Vérifier et accéder à mon espace"}</button>
              <div className="flex justify-between gap-4 text-sm"><button type="button" onClick={() => { setStep("email"); setCode(""); }} className="text-orange-300">Changer d’email</button><button type="button" disabled={loading} onClick={requestCode} className="text-orange-300">Renvoyer un code</button></div>
            </form>
          )}

          {step === "member" && profile && !profile.registered && (
            <form onSubmit={e => { e.preventDefault(); enroll(); }} className="mt-7 space-y-5">
              <p className="text-sm text-green-300"><ShieldCheck size={17} className="mr-2 inline" /> Email vérifié : {email}</p>
              <div><label htmlFor="name" className="mb-2 block text-sm text-white/70">Nom complet</label><input id="name" required minLength={2} value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border border-white/15 bg-black p-4" /></div>
              <fieldset className="space-y-3"><legend className="mb-3 font-semibold">Choisis ta formule</legend>
                <label className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 ${formula === "transport" ? "border-orange-500 bg-orange-500/10" : "border-white/15"}`}><span><input type="radio" name="formula" checked={formula === "transport"} onChange={() => setFormula("transport")} className="mr-3" />Transport uniquement</span><strong>100 €</strong></label>
                <label className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 ${formula === "hotel" ? "border-orange-500 bg-orange-500/10" : "border-white/15"}`}><span><input type="radio" name="formula" checked={formula === "hotel"} onChange={() => setFormula("hotel")} className="mr-3" />Transport + hébergement</span><strong>150 €</strong></label>
              </fieldset>
              <button disabled={loading} className="w-full rounded-xl bg-orange-500 p-4 font-bold disabled:opacity-50">{loading ? "Enregistrement…" : "Confirmer mon inscription"}</button>
            </form>
          )}

          {step === "member" && profile?.registered && (
            <div className="mt-7 space-y-6">
              <div className="flex items-start justify-between gap-3"><div><p className="text-sm text-green-300"><CheckCircle2 size={16} className="mr-2 inline" /> Membre inscrit</p><h3 className="mt-2 text-xl font-bold">{profile.name}</h3><p className="mt-1 break-all text-sm text-white/50">{email}</p><p className="mt-2 text-sm text-orange-300">{profile.formula}</p></div><button type="button" disabled={loading} onClick={refresh} title="Actualiser" className="rounded-xl border border-white/15 p-3 hover:bg-white/10"><RefreshCw size={18} /></button></div>
              <div className="grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-black p-3"><p className="text-xs text-white/50">Total</p><strong className="mt-1 block text-lg">{euro(total)}</strong></div><div className="rounded-xl bg-black p-3"><p className="text-xs text-white/50">Versé</p><strong className="mt-1 block text-lg text-green-300">{euro(paid)}</strong></div><div className="rounded-xl bg-black p-3"><p className="text-xs text-white/50">Solde</p><strong className="mt-1 block text-lg text-orange-300">{euro(balance)}</strong></div></div>
              <div><div className="mb-2 flex justify-between text-sm"><span>Progression</span><span>{progress} %</span></div><div className="h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-green-500" style={{ width: `${progress}%` }} /></div></div>
              {confirmation && (
                <div role="status" className="rounded-xl border border-green-500/40 bg-green-950/30 p-4 text-sm text-green-100 space-y-2">
                  <p className="font-bold">✓ Déclaration enregistrée — En attente</p>
                  <p>Montant : {euro(confirmation.amount)} · Moyen : {confirmation.method}</p>
                  <p>Formule : {profile.formula}</p>
                  {confirmation.reference && <p className="break-all">Référence : {confirmation.reference}</p>}
                  <p>Un récapitulatif a été demandé par e-mail. Le montant ne sera comptabilisé qu'après confirmation par l'administrateur.</p>
                  {confirmation.paypal && <a href={`${ASSOCIATION_PAYPAL_URL.replace(/\/$/, "")}/${confirmation.amount}`} target="_blank" rel="noopener noreferrer" className="inline-block rounded-xl bg-orange-500 px-4 py-3 font-bold text-white">Continuer vers PayPal</a>}
                </div>
              )}
              {balance > 0 ? (
                <form onSubmit={e => { e.preventDefault(); declarePayment(); }} className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-4">
                  <label htmlFor="amount" className="block text-sm text-white/70">Montant du versement à déclarer (€)</label>
                  <input id="amount" type="number" min={balance < 25 ? balance : 25} max={balance} step="0.01" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full rounded-xl border border-white/15 bg-black p-3" />
                  <p className="text-xs text-white/50">Minimum 25 €, sauf pour régler un solde inférieur à 25 €.</p>
                  <fieldset className="space-y-2">
                    <legend className="mb-2 text-sm font-semibold">Moyen de paiement</legend>
                    {([ ["especes", "Espèces"], ["virement", "Virement"], ["paypal", "PayPal"] ] as const).map(([value, label]) => (
                      <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${paymentMethod === value ? "border-orange-500 bg-orange-500/10" : "border-white/15"}`}>
                        <input type="radio" name="paymentMethod" checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} />
                        {label}
                      </label>
                    ))}
                  </fieldset>
                  {paymentMethod === "paypal" && !paypalUrl && <p className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-orange-200">Le lien PayPal officiel n’est pas encore configuré.</p>}
                  <p className="text-sm text-white/60">{paymentMethod === "paypal" ? "Après enregistrement, un message de confirmation et un bouton PayPal apparaîtront. Le versement restera en attente de confirmation administrative." : "Cette déclaration est indicative. Aucun IBAN n’est affiché et ton solde ne changera qu’après confirmation de réception par l’administrateur dans Google Sheets."}</p>
                  {!validAmount && <p className="text-sm text-orange-300">Choisis un montant valide sans dépasser le solde.</p>}
                  <button type="submit" disabled={loading || !validAmount || (paymentMethod === "paypal" && !paypalUrl)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 p-4 font-bold hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50">
                    <CreditCard size={18} /> {loading ? "Enregistrement…" : paymentMethod === "paypal" ? "Enregistrer et accéder à PayPal" : "Déclarer mon versement"}
                  </button>
                </form>
              ) : <p className="rounded-xl bg-green-950/40 p-4 font-semibold text-green-300">🎉 Cotisation intégralement réglée !</p>}
              {ADMIN_SHEET_URL && <div className="rounded-xl border border-white/10 p-3 text-sm"><p className="mb-2 text-white/50">Accès administrateur uniquement (droits Google requis)</p><a href={ADMIN_SHEET_URL} target="_blank" rel="noopener noreferrer" className="text-orange-300 underline">Ouvrir le tableau Google Sheets de validation</a></div>}
              <div><h4 className="mb-3 font-bold">Historique des versements validés</h4>{Array.isArray(profile.payments) && profile.payments.length > 0 ? <div className="space-y-2">{profile.payments.map((p, i) => <div key={`${p.reference || "versement"}-${i}`} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-3 text-sm"><div><p>{p.date ? new Date(p.date).toLocaleDateString("fr-FR") : "Date non précisée"}</p>{p.reference && <p className="mt-1 break-all text-xs text-white/50">Réf. {p.reference}</p>}</div><strong className="text-green-300">{euro(Number(p.amount || 0))}</strong></div>)}</div> : <p className="text-sm text-white/50">Aucun versement validé pour le moment.</p>}</div>
              <button type="button" onClick={() => { setToken(""); setCode(""); setProfile(null); setStep("email"); }} className="text-sm text-white/50 underline">Se déconnecter</button>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="flex justify-center"><Image src="/logo-fc2zero.png" alt="Logo FC 2Zéro Paris" width={170} height={170} priority className="object-contain" /></div>
          <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6 md:p-8"><h2 className="text-2xl font-black">Deux formules au choix</h2><div className="mt-6 space-y-4"><div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5"><p className="text-lg font-semibold">🚌 Transport uniquement</p><p className="mt-2 text-4xl font-black">100 €</p></div><div className="rounded-2xl border border-white/15 p-5"><p className="text-lg font-semibold">🚌 🏨 Transport + hébergement</p><p className="mt-2 text-4xl font-black">150 €</p><p className="mt-1 text-sm text-white/60">100 € de transport + 50 € d’hébergement</p></div></div><div className="mt-6 rounded-2xl bg-white/5 p-5"><h3 className="font-bold">Comment ça marche ?</h3><p className="mt-3 leading-7 text-white/70">1. Vérifie ton email et inscris-toi.<br />2. Choisis ta formule.<br />3. Déclare ton versement en espèces, par virement ou via PayPal.<br />4. L’administrateur confirme la réception dans Google Sheets.<br />5. Ton solde est alors actualisé.</p></div><p className="mt-5 text-sm text-white/50">Objectif : constituer les cotisations dès janvier–février 2027, en préparation du déplacement de mai 2027.</p></div>
        </aside>
      </section>
      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-neutral-500">FC 2Zéro Paris — Ensemble sur le terrain, ensemble en famille.</footer>
    </main>
  );
}
