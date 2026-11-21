
import { Resend } from "resend";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error("RESEND_API_KEY manquante");

      return Response.json(
        { success: false, error: "Service email non configuré" },
        { status: 503 }
      );
    }

    const resend = new Resend(apiKey);
    const data = await req.json();

    const { error } = await resend.emails.send({
      from: "FC 2Zéro <onboarding@resend.dev>",
      to: "eloka.willy@gmail.com",
      subject: `2Zéro • ${data.name ?? "Notification"} • ${data.total ?? 0}€`,
      text: `
Une mise à jour du formulaire a été effectuée.

Nom : ${data.name ?? "-"}
Montant : ${data.total ?? 0} €
Email : ${data.email ?? "-"}

Message :
${data.message || "-"}

Le 2Zéro !
      `,
    });

    if (error) {
      console.error("Erreur Resend :", error);

      return Response.json(
        { success: false, error: "Échec de l'envoi" },
        { status: 502 }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Erreur notification :", error);

    return Response.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
