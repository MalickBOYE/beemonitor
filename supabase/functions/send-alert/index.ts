import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "https://esm.sh/resend@3.2.0";

Deno.serve(async (req) => {
  try {
    // 1. Vérification immédiate de la clé API
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("ERREUR: RESEND_API_KEY non configurée dans Supabase");
      throw new Error("Clé API Resend manquante");
    }

    const resend = new Resend(apiKey);

    // 2. Récupération des données
    const payload = await req.json();
    console.log("Payload reçu:", payload);

    // Extraction (gestion du cas 'record' pour les Webhooks Supabase)
    const record = payload.record || payload;
    const { hive_name, alert_type, value } = record;

    if (!hive_name || !alert_type) {
        throw new Error(`Données incomplètes. Reçu: hive_name=${hive_name}, alert_type=${alert_type}`);
    }

    // 3. Envoi de l'email
    const { data, error } = await resend.emails.send({
      from: 'Beemonitor <onboarding@resend.dev>',
      to: 'boye.malick02@gmail.com',
      subject: `⚠️ Alerte : ${alert_type} sur ${hive_name}`,
      html: `
        <div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #d9534f;">🚨 Alerte Ruche : ${hive_name}</h2>
          <p><strong>Type d'alerte :</strong> ${alert_type}</p>
          <p><strong>Valeur mesurée :</strong> ${value}</p>
          <hr />
          <p style="font-size: 12px; color: #666;">Ceci est un message automatique de votre système de surveillance.</p>
        </div>
      `
    });

    if (error) {
      console.error("Erreur retournée par Resend:", error);
      throw error;
    }

    console.log("Email envoyé ! ID:", data?.id);

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("ERREUR CRITIQUE:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});