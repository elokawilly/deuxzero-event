import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const data = await req.json();

    await resend.emails.send({
      from: "FC 2Zéro <onboarding@resend.dev>",
      to: "eloka.willy@gmail.com",
      subject: `2Zéro • ${data.name} • ${data.total}€`,
      text: `
Monsieur ${data.name} a effectué une mise à jour du formulaire.

Le montant de sa participation est : ${data.total} €
Présence au barbecue : ${data.bbqPresence}
Nombre d'adultes : ${data.adultCount}
Nombre d'enfants : ${data.childrenCount}
Moyen de paiement : ${data.paymentMethod}
Email : ${data.email}

Message :
${data.message || "-"}

Le 2Zéro !
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false }, { status: 500 });
  }
}