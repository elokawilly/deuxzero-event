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
              {balance > 0 ? <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4"><label htmlFor="amount" className="block text-sm text-white/70">Montant du prochain versement (€)</label><input id="amount" type="number" min={balance < 25 ? balance : 25} max={balance} step="0.01" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full rounded-xl border border-white/15 bg-black p-3" /><p className="text-xs text-white/50">Versement minimum de 25 €, sauf pour régler un solde inférieur à 25 €.</p>{!validAmount && <p className="text-xs text-orange-300">Choisis un montant valide, sans dépasser le solde.</p>}{paypalUrl ? <a href={validAmount ? paypalUrl : undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!validAmount} className={`flex items-center justify-center gap-2 rounded-xl p-4 font-bold ${validAmount ? "bg-orange-500 hover:bg-orange-400" : "pointer-events-none bg-neutral-700 opacity-50"}`}><CreditCard size={18} /> Continuer vers PayPal</a> : <p className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-orange-200">Le lien PayPal officiel de l’association n’est pas encore configuré. Contacte le trésorier pour effectuer ton versement.</p>}<p className="text-xs text-white/50">Le paiement ne sera comptabilisé qu’après validation par le trésorier.</p></div> : <p className="rounded-xl bg-green-950/40 p-4 font-semibold text-green-300">🎉 Cotisation intégralement réglée !</p>}
              <div><h4 className="mb-3 font-bold">Historique des versements validés</h4>{Array.isArray(profile.payments) && profile.payments.length > 0 ? <div className="space-y-2">{profile.payments.map((p, i) => <div key={`${p.reference || "versement"}-${i}`} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-3 text-sm"><div><p>{p.date ? new Date(p.date).toLocaleDateString("fr-FR") : "Date non précisée"}</p>{p.reference && <p className="mt-1 break-all text-xs text-white/50">Réf. {p.reference}</p>}</div><strong className="text-green-300">{euro(Number(p.amount || 0))}</strong></div>)}</div> : <p className="text-sm text-white/50">Aucun versement validé pour le moment.</p>}</div>
              <button type="button" onClick={() => { setToken(""); setCode(""); setProfile(null); setStep("email"); }} className="text-sm text-white/50 underline">Se déconnecter</button>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="flex justify-center"><Image src="/logo-fc2zero.png" alt="Logo FC 2Zéro Paris" width={170} height={170} priority className="object-contain" /></div>
          <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6 md:p-8"><h2 className="text-2xl font-black">Deux formules au choix</h2><div className="mt-6 space-y-4"><div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5"><p className="text-lg font-semibold">🚌 Transport uniquement</p><p className="mt-2 text-4xl font-black">100 €</p></div><div className="rounded-2xl border border-white/15 p-5"><p className="text-lg font-semibold">🚌 🏨 Transport + hébergement</p><p className="mt-2 text-4xl font-black">150 €</p><p className="mt-1 text-sm text-white/60">100 € de transport + 50 € d’hébergement</p></div></div><div className="mt-6 rounded-2xl bg-white/5 p-5"><h3 className="font-bold">Comment ça marche ?</h3><p className="mt-3 leading-7 text-white/70">1. Vérifie ton email et inscris-toi.<br />2. Choisis ta formule.<br />3. Effectue tes versements, à partir de 25 €.<br />4. Retrouve automatiquement les montants validés et ton solde.</p></div><p className="mt-5 text-sm text-white/50">Objectif : constituer les cotisations dès janvier–février 2027, en préparation du déplacement de mai 2027.</p></div>
        </aside>
      </section>
      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-neutral-500">FC 2Zéro Paris — Ensemble sur le terrain, ensemble en famille.</footer>
    </main>
  );
}
