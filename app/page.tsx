"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Phone,
  CreditCard,
  CheckCircle2,
  Flame,
  Trophy,
} from "lucide-react";

export default function DeuxZeroEventSite() {
  const PRICE_PER_PERSON = 30;

  const [form, setForm] = useState({
    name: "",
    phone: "",
    peopleCount: 1,
    amount: 30,
    message: "",
  });

  const total = useMemo(() => {
  return Number(form.amount || 0);
}, [form.amount]);

  const paypalLink = `https://paypal.me/willyeloka/${total}`;

  const whatsappMessage = encodeURIComponent(
    `🔥 Contribution 2Zéro 🔥

Nom : ${form.name}
Téléphone : ${form.phone}
Nombre de personnes: ${form.peopleCount}
Montant : ${total} €

Message : ${form.message}

Paiement effectué via PayPal 👊🏾`
  );

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-black to-black" />

        <div className="relative mx-auto max-w-7xl px-5 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-300">
              <Trophy className="h-4 w-4" />
              FC 2Zéro Paris
            </div>

            <h1 className="text-5xl font-black leading-tight md:text-7xl">
              Match Amical & BBQ
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-white/70 md:text-xl">
              Une journée de football, de fraternité, de famille et de bonne
              ambiance autour du 2Zéro 👊🏾🔥
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#participer"
                className="rounded-2xl bg-orange-500 px-8 py-4 font-semibold text-white transition hover:bg-orange-400"
              >
                Participer maintenant
              </a>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-white/70">
                17 mai ⚽ & 7 juin 🔥
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CONTENT */}
      <section
        id="participer"
        className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-2"
      >
        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-white/10 bg-neutral-900 p-6 md:p-8"
        >
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.3em] text-orange-300">
              Contribution
            </p>

            <h2 className="mt-2 text-5xl font-black">
              30 € <span className="text-3xl">par personne</span>
            </h2>

            <p className="mt-4 text-white/70">
              La contribution couvre l’organisation des deux événements :
              accueil du match, nourriture, boissons, matériel, logistique BBQ.
            </p>
          </div>

          <div className="space-y-5">
            {/* NAME */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <label className="mb-2 flex items-center gap-2 text-sm text-white/70">
                <Users className="h-4 w-4" />
                Nom complet
              </label>

              <input
                type="text"
                placeholder="Ex : Le Foker"
                className="w-full bg-transparent text-lg outline-none"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>

            {/* PHONE */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <label className="mb-2 flex items-center gap-2 text-sm text-white/70">
                <Phone className="h-4 w-4" />
                Téléphone
              </label>

              <input
                type="text"
                placeholder="Ex : 06 00 00 00 00"
                className="w-full bg-transparent text-lg outline-none"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />
            </div>

            {/* PEOPLE */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <label className="mb-2 flex items-center gap-2 text-sm text-white/70">
                <Users className="h-4 w-4" />
                Nombre de personnes
                </label>

<div className="rounded-2xl border border-white/10 bg-black/40 p-4">
  <label className="mb-2 flex items-center gap-2 text-sm text-white/70">
    Montant de ma contribution
  </label>

  <input
    type="number"
    min="1"
    placeholder="Ex : 30"
    className="w-full bg-transparent text-lg outline-none"
    value={form.amount}
    onChange={(e) =>
      setForm({ ...form, amount: Number(e.target.value) })
    }
  />
</div>

            {/* MESSAGE */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <label className="mb-2 text-sm text-white/70">
                Petit message
              </label>

              <textarea
                rows={4}
                placeholder="Votre message..."
                className="w-full resize-none bg-transparent outline-none"
                value={form.message}
                onChange={(e) =>
                  setForm({ ...form, message: e.target.value })
                }
              />
            </div>
          </div>

          {/* TOTAL */}
          <div className="mt-6 rounded-3xl border border-orange-500/20 bg-orange-500/10 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70">Montant total à régler</p>
              </div>

              <div className="text-5xl font-black text-orange-300">
                {total} €
              </div>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="mt-6 space-y-4">
            <a
              href={paypalLink}
              target="_blank"
              className="flex items-center justify-center gap-3 rounded-2xl bg-orange-500 px-6 py-5 text-lg font-bold text-white transition hover:bg-orange-400"
            >
              <CreditCard className="h-5 w-5" />
              Payer avec PayPal
            </a>

            <a
              href={`https://wa.me/?text=${whatsappMessage}`}
              target="_blank"
              className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-lg font-semibold text-white transition hover:bg-white/10"
            >
              Confirmer aussi par WhatsApp
            </a>
          </div>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="rounded-3xl border border-white/10 bg-neutral-900 p-6 md:p-8">
            <h3 className="text-2xl font-black">
              Ce que finance la contribution
            </h3>

            <div className="mt-6 space-y-5 text-white/90">
              <div className="border-b border-white/10 pb-4">
                <p className="font-semibold">
                  ⚽ Accueil des invités du match amical
                </p>

                <p className="mt-1 text-sm text-white/60">
                  Organisation et réception du 2Zéro Sartrouville dans une
                  ambiance conviviale.
                </p>
              </div>

              <div className="border-b border-white/10 pb-4">
                <p className="font-semibold">
                  🔥 Grand barbecue du 7 juin
                </p>

                <p className="mt-1 text-sm text-white/60">
                  Nourriture, boissons, matériel, logistique et installation.
                </p>
              </div>

              <div className="border-b border-white/10 pb-4">
                <p className="font-semibold">
                  👨🏾‍👩🏾‍👧🏾 Activités familles & enfants
                </p>

                <p className="mt-1 text-sm text-white/60">
                  Jeux, animations et moment de partage pour petits et grands.
                </p>
              </div>

              <div>
                <p className="font-semibold">🤝🏾 Objectif</p>

                <p className="mt-1 text-sm text-white/60">
                  Créer un événement fédérateur, propre et transparent autour du
                  2Zéro.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-white/[0.06] p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 text-green-400" />

                <p className="text-sm leading-7 text-neutral-300">
                  Chaque participation aide à construire un événement de qualité
                  pour les joueurs, les familles et les invités.
                </p>
              </div>
            </div>
          </div>

          {/* EVENT CARD */}
          <div className="mt-8 rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-black p-8">
            <div className="flex items-center gap-3">
              <Flame className="h-8 w-8 text-orange-400" />

              <h3 className="text-3xl font-black">
                2 événements. Une famille.
              </h3>
            </div>

            <p className="mt-5 text-lg leading-8 text-white/70">
              Le 17 mai, on représente le 2Zéro sur le terrain.
              <br />
              Le 7 juin, on célèbre ça tous ensemble autour d’un grand barbecue
              familial 🔥
            </p>
          </div>
<div className="mt-6 flex flex-col items-center gap-4 text-center">
  <p className="text-white/70 text-sm md:text-base">
    Je participe et je suis le statut de ma contribution via le lien ci-dessous.
  </p>

  <a
    href="https://docs.google.com/spreadsheets/d/165HRyHbAa9cghL4fo5VcSSg364mNQFcJShL1Ychu1qY/edit?usp=sharing"
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-2xl bg-green-600 hover:bg-green-700 px-6 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-orange-400"
  >
    Voir le suivi des contributions
  </a>
</div>

        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-neutral-500">
        <span className="font-semibold text-orange-300">2Zéro Paris</span> —
        Ensemble sur le terrain, ensemble en famille.
      </footer>
    </main>
  );
}