                <label className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 ${formula === "transport" ? "border-orange-500 bg-orange-500/10" : "border-white/15"}`}><span><input type="radio" name="formula" checked={formula === "transport"} onChange={() => setFormula("transport")} className="mr-3" />Transport uniquement</span><strong>100 €</strong></label>
                <label className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 ${formula === "hotel" ? "border-orange-500 bg-orange-500/10" : "border-white/15"}`}><span><input type="radio" name="formula" checked={formula === "hotel"} onChange={() => setFormula("hotel")} className="mr-3" />Transport + hébergement</span><strong>150 €</strong></label>
              </fieldset>
              <button disabled={loading} className="w-full rounded-xl bg-orange-500 p-4 font-bold disabled:opacity-50">{loading ? "Enregistrement…" : "Confirmer mon inscription"}</button>
            </form>
          )}

          {step === "member" && profile?.registered && (
            <div className="mt-7 space-y-6">
              <div className="flex items-start justify-between gap-3"><div><p className="text-sm text-green-300"><CheckCircle2 size={16} className="mr-2 inline" /> Membre inscrit</p><h3 className="mt-2 text-xl font-bold">{profile.name}</h3><p className="mt-1 break-all text-sm text-white/50">{email}</p><p className="mt-2 text-sm text-orange-300">{profile.formula}</p></div><button type="button" disabled={loading} onClick={refresh} title="Actualiser" className="rounded-xl border border-white/15 p-3 hover:bg-white/10"><RefreshCw size={18} /></button></div>
              <section className="rounded-xl border border-white/15 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3"><h4 className="font-semibold">Ma formule</h4><button type="button" onClick={() => { if (profile.formulaChangeUsed) return; setEditingFormula(!editingFormula); setNewFormula(profile.formula?.toLowerCase().includes("hébergement") ? "hotel" : "transport"); setFormulaChoice(""); }} disabled={loading || !!profile.formulaChangeUsed} className="text-sm text-orange-300 underline disabled:cursor-not-allowed disabled:text-white/40">{editingFormula ? "Annuler" : "Changer ma formule"}</button></div>
                {profile.formulaChangeUsed && <p role="status" className="text-sm text-amber-200">🔒 Tu as déjà utilisé ton unique changement de formule. Pour toute demande exceptionnelle, contacte l’administrateur.</p>}
                {editingFormula && !profile.formulaChangeUsed && (
                  <form onSubmit={e => { e.preventDefault(); changeFormula(); }} className="space-y-3">
                    <p role="alert" className="rounded-lg border border-amber-400/50 bg-amber-500/10 p-3 text-sm text-amber-100">⚠️ Tu ne peux changer de formule qu’une seule fois pour ce déplacement. Une fois confirmé, ce changement sera définitif.</p>
                    <label className="block text-sm text-white/70" htmlFor="newFormula">Nouvelle formule</label>
                    <select id="newFormula" value={newFormula} onChange={e => { setNewFormula(e.target.value as Formula); setFormulaChoice(""); }} className="w-full rounded-xl border border-white/20 bg-black p-3">
                      <option value="transport">Transport uniquement — 100 €</option><option value="hotel">Transport + hébergement — 150 €</option>
                    </select>
                    {newFormula !== (profile.formula?.toLowerCase().includes("hébergement") ? "hotel" : "transport") && (
                      <div className="space-y-3 text-sm">
                        <p>Nouveau montant attendu : <strong>{euro(amountFor(newFormula))}</strong> · Déjà validé : <strong>{euro(paid)}</strong> · Nouveau solde : <strong>{euro(Math.max(0, amountFor(newFormula) - paid))}</strong>.</p>
                        {paid > amountFor(newFormula) && <div className="rounded-xl border border-amber-400/50 bg-amber-500/10 p-3 space-y-3">
                          <p className="font-bold">⚠️ Excédent de {euro(Math.round((paid - amountFor(newFormula)) * 100) / 100)} après changement.</p>
                          <p>Si tu souhaites un remboursement, contacte l'administrateur. Le remboursement n'est pas automatique. Sans consentement explicite, l'excédent ne constitue pas un don.</p>
                          <label className="flex gap-2"><input type="radio" name="formulaChoice" checked={formulaChoice === "refuse"} onChange={() => setFormulaChoice("refuse")}/><span>Je demande une régularisation / un remboursement auprès de l'administrateur.</span></label>
                          <label className="flex gap-2"><input type="radio" name="formulaChoice" checked={formulaChoice === "accept"} onChange={() => setFormulaChoice("accept")}/><span>Je consens explicitement à faire don de cet excédent à FC 2Zéro Paris.</span></label>
                        </div>}
                      </div>
                    )}
                    <button type="submit" disabled={loading || !!profile.formulaChangeUsed || newFormula === (profile.formula?.toLowerCase().includes("hébergement") ? "hotel" : "transport") || (paid > amountFor(newFormula) && !formulaChoice)} className="w-full rounded-xl bg-orange-500 p-3 font-bold disabled:opacity-50">{loading ? "Modification en cours…" : "Confirmer le changement de formule"}</button>
                  </form>
                )}
              </section>
              <div className="grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-black p-3"><p className="text-xs text-white/50">Total</p><strong className="mt-1 block text-lg">{euro(total)}</strong></div><div className="rounded-xl bg-black p-3"><p className="text-xs text-white/50">Versé</p><strong className="mt-1 block text-lg text-green-300">{euro(paid)}</strong></div><div className="rounded-xl bg-black p-3"><p className="text-xs text-white/50">Solde</p><strong className="mt-1 block text-lg text-orange-300">{euro(balance)}</strong></div></div>
              <div><div className="mb-2 flex justify-between text-sm"><span>Progression</span><span>{progress} %</span></div><div className="h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-green-500" style={{ width: `${progress}%` }} /></div></div>
               {surplus > 0 && (
                 <section className="space-y-4 rounded-xl border border-orange-500/40 bg-orange-500/10 p-4" aria-label="Gestion de mon excédent">
                   <h4 className="font-bold text-orange-200">Excédent de cotisation : {euro(surplus)}</h4>
                   <p className="text-sm text-white/75">Tu as versé davantage que le montant de ta formule. Cet excédent ne devient un don qu’avec ton accord explicite.</p>
                   {surplusDecision === "En attente" ? (
                     <form onSubmit={e => { e.preventDefault(); decideSurplus(); }} className="space-y-3">
                       <fieldset className="space-y-3">
                         <legend className="text-sm font-semibold">Que souhaites-tu faire de cet excédent ?</legend>
                         <label className="flex cursor-pointer gap-3 rounded-lg border border-white/20 p-3 text-sm">
                           <input type="radio" name="surplusChoice" checked={surplusChoice === "accept"} onChange={() => setSurplusChoice("accept")} />
                           <span>J’accepte explicitement de faire don de {euro(surplus)} à FC 2Zéro Paris.</span>
                         </label>
                         <label className="flex cursor-pointer gap-3 rounded-lg border border-white/20 p-3 text-sm">
                           <input type="radio" name="surplusChoice" checked={surplusChoice === "refuse"} onChange={() => setSurplusChoice("refuse")} />
                           <span>Je refuse le don et demande la régularisation de {euro(surplus)} auprès de l’administrateur.</span>
                         </label>
                       </fieldset>
                       <button type="submit" disabled={loading || !surplusChoice} className="w-full rounded-xl bg-orange-500 p-3 font-bold disabled:opacity-50">
                         {loading ? "Enregistrement…" : "Confirmer mon choix"}
                       </button>
                     </form>
                   ) : (
                     <p className="rounded-lg border border-white/20 p-3 text-sm" role="status">
                       {surplusDecision === "Accepté"
                         ? `Don accepté : ${euro(Number(profile?.donationAmount ?? surplus))}. Merci pour ton soutien !`
                         : surplusDecision === "Refusé"
                           ? `Don refusé : demande de régularisation de ${euro(surplus)} transmise à l’administrateur.`
                           : "Consulte l’administrateur pour le suivi de cet excédent."}
                     </p>
                   )}
                 </section>
               )}
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
               <form onSubmit={e => { e.preventDefault(); declarePayment(); }} className="space-y-4 rounded-xl border border-white/10 bg-black/40 p-4">
                   {balance === 0 && <p className="rounded-xl bg-green-950/40 p-3 text-sm font-semibold text-green-300">🎉 Cotisation soldée ! Tu peux effectuer un versement supplémentaire, sous réserve de confirmer ton intention de don.</p>}
                   <label htmlFor="amount" className="block text-sm text-white/70">Montant du versement à déclarer (€)</label>
                   <input id="amount" type="number" min={25} step={25} value={amount} onChange={e => { setAmount(Number(e.target.value)); setDonationConfirmed(false); setPaymentFeedback(""); }} className="w-full rounded-xl border border-white/15 bg-black p-3" />
                   <p className="text-xs text-white/50">Montants autorisés : 25 €, 50 €, 75 €, etc. Les versements dépassant le solde nécessitent une confirmation explicite.</p>
                   {projectedSurplus > 0 && (
                     <div role="alert" className="space-y-3 rounded-xl border border-amber-400/50 bg-amber-500/10 p-4 text-sm text-amber-100">
                       <p className="font-bold">⚠️ Attention : vous êtes sur le point de faire un don.</p>
                       <p>Sur les {euro(amount)} déclarés, {euro(projectedSurplus)} dépassent votre solde actuel de {euro(balance)}.</p>
                       <p>Confirmez-vous votre intention de faire don de {euro(projectedSurplus)} à FC 2Zéro Paris ?</p>
                       <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" checked={donationConfirmed} onChange={e => setDonationConfirmed(e.target.checked)} className="mt-1" /><span><strong>Oui, je confirme mon intention de don.</strong> Le montant effectivement reçu devra être validé par le trésorier. Le don définitif nécessitera ensuite la confirmation de l’excédent exact dans mon espace personnel.</span></label>
                       <button type="button" onClick={() => { setDonationConfirmed(false); setAmount(25); }} className="rounded-lg border border-white/30 px-3 py-2">Non, annuler cette intention</button>
                     </div>
                   )}
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
                   {!validAmount && <p className="text-sm text-orange-300">Choisis un multiple positif de 25 €.</p>}
                  {paymentFeedback && <p role="status" aria-live="polite" className={`rounded-xl border p-3 text-sm ${paymentFeedback.startsWith("Échec") ? "border-red-500/50 bg-red-950/40 text-red-200" : "border-green-500/40 bg-green-950/30 text-green-200"}`}>{paymentFeedback}</p>}
                  <button type="submit" disabled={loading || !validAmount || (projectedSurplus > 0 && !donationConfirmed) || (paymentMethod === "paypal" && !paypalUrl)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 p-4 font-bold hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50">
                    <CreditCard size={18} /> {loading ? "Enregistrement…" : paymentMethod === "paypal" ? "Enregistrer et accéder à PayPal" : "Déclarer mon versement"}
                  </button>
                </form>
{ADMIN_SHEET_URL && <div className="rounded-xl border border-white/10 p-3 text-sm"><p className="mb-2 text-white/50">Accès administrateur uniquement (droits Google requis)</p><a href={ADMIN_SHEET_URL} target="_blank" rel="noopener noreferrer" className="text-orange-300 underline">Ouvrir le tableau Google Sheets de validation</a></div>}
              <div><h4 className="mb-3 font-bold">Historique des versements validés</h4>{Array.isArray(profile.payments) && profile.payments.length > 0 ? <div className="space-y-2">{profile.payments.map((p, i) => <div key={`${p.reference || "versement"}-${i}`} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-3 text-sm"><div><p>{p.date ? new Date(p.date).toLocaleDateString("fr-FR") : "Date non précisée"}</p>{p.reference && <p className="mt-1 break-all text-xs text-white/50">Réf. {p.reference}</p>}</div><strong className="text-green-300">{euro(Number(p.amount || 0))}</strong></div>)}</div> : <p className="text-sm text-white/50">Aucun versement validé pour le moment.</p>}</div>
              <button type="button" onClick={() => { setToken(""); setCode(""); setProfile(null); setConfirmation(null); setSurplusChoice(""); setStep("email"); }} className="text-sm text-white/50 underline">Se déconnecter</button>
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
