import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@0.17.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

Deno.serve(async (req) => {
  try {
    // ÉTAPE 1 : Récupérer le corps de la requête
    const payload = await req.json();
    console.log("Données reçues du trigger:", JSON.stringify(payload));

    // ÉTAPE 2 : Extraction sécurisée (on utilise record si c'est un trigger direct)
    // Selon ta config, les données sont soit directes, soit dans 'record'
    const { hive_name, alert_type, value } = payload.record || payload;

    if (!hive_name || !alert_type) {
        throw new Error("Données manquantes : hive_name ou alert_type est vide");
    }

    // ÉTAPE 3 : Envoi
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'boye.malick02@gmail.com', 
      subject: `⚠️ Alerte : ${alert_type} sur ${hive_name}`,
      html: `<h3>Alerte Ruche</h3><p>Type: ${alert_type}</p><p>Valeur: ${value}</p>`
    });

    console.log("Email envoyé avec succès:", data);

    return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (err) {
    console.error("ERREUR FONCTION:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});