import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const TELEGRAM_BOT_TOKEN = "8442857475:AAHC7tZdzNY1RRg5kS3lCnyy2wBKtqsW2Mg";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderNotificationData {
  userToken: string;
  projectName: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { userToken, projectName }: OrderNotificationData = await req.json();
    console.log(`Order notification request for user: ${userToken}, project: ${projectName}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: settings, error } = await supabase
      .from("user_telegram_settings")
      .select("telegram_chat_id")
      .eq("user_token", userToken)
      .maybeSingle();

    if (error) {
      console.error("Database error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!settings || !settings.telegram_chat_id) {
      console.log(`User ${userToken} has not configured Telegram notifications`);
      return new Response(
        JSON.stringify({ success: false, message: "User has not configured Telegram notifications" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log(`Sending notification to chat_id: ${settings.telegram_chat_id}`);

    const message = `✅ Ваш Заказ WhitePage Готов\n\nНазвание проекта: ${projectName}\n\nПроверьте пожалуйста CRM в разделе Заказы`;

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: settings.telegram_chat_id,
        text: message,
      }),
    });

    const result = await response.json();
    console.log("Telegram API response:", JSON.stringify(result));

    if (!response.ok) {
      console.error("Telegram API error:", JSON.stringify(result));
      throw new Error(`Telegram API error: ${JSON.stringify(result)}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent" }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});