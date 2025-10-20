import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const TELEGRAM_BOT_TOKEN = "7985996300:AAG85SZGY_d2Yx5iinoZVLw5Ccjr26YNqOQ";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderData {
  projectName: string;
  theme: string;
  siteType: string;
  geo: string;
  siteLanguage: string;
  whitePageCount: string;
  buyerNickname: string;
  language: string;
  cost: string;
  date: string;
  createdBy: string;
  details: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const orderData: OrderData = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: settings, error } = await supabase
      .from("admin_telegram_settings")
      .select("orders_bot_chat_id")
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    const chatId = settings?.orders_bot_chat_id || "@zakazfpetsr";

    const message = `🔔 Новый заказ создан!

Название проекта: ${orderData.projectName}

Тематика сайта: ${orderData.theme}
Тип сайта: ${orderData.siteType}
Гео: ${orderData.geo}
Язык сайта: ${orderData.siteLanguage}
Кол-во White Page: ${orderData.whitePageCount}
Никнейм Баера: ${orderData.buyerNickname}
Язык написания: ${orderData.language}
Стоимость заказа: ${orderData.cost}$
Дата создания: ${orderData.date}
Создатель заказа: ${orderData.createdBy}

Уточняющие Детали Проекта:
${orderData.details || "Не указаны"}`;

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    const result = await response.json();

    if (!response.ok) {
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
