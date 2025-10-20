import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const TELEGRAM_BOT_TOKEN = "8442857475:AAHC7tZdzNY1RRg5kS3lCnyy2wBKtqsW2Mg";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function sendTelegramMessage(chatId: string, text: string) {
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  const response = await fetch(telegramUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
    }),
  });

  return response.json();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const update = await req.json();
    console.log("Telegram webhook update:", JSON.stringify(update));

    // Handle /start command with user token
    if (update.message && update.message.text) {
      const text = update.message.text;
      const chatId = update.message.chat.id.toString();
      const userName = update.message.from.first_name || "Пользователь";
      
      if (text.startsWith("/start")) {
        const parts = text.split(" ");
        
        if (parts.length > 1) {
          const userToken = parts[1];
          console.log(`Processing /start command for user_token: ${userToken}, chat_id: ${chatId}`);
          
          // Save chat_id for this user_token
          const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
          const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          const { error } = await supabase
            .from("user_telegram_settings")
            .upsert({
              user_token: userToken,
              telegram_chat_id: chatId,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: "user_token"
            });
          
          if (error) {
            console.error("Database error:", error);
            await sendTelegramMessage(
              chatId,
              `❌ Произошла ошибка при подключении уведомлений.\n\nПопробуйте еще раз позже.`
            );
          } else {
            console.log(`Successfully saved chat_id ${chatId} for user_token ${userToken}`);
            
            // Send confirmation message
            await sendTelegramMessage(
              chatId,
              `✅ Привет, ${userName}!\n\nУведомления успешно подключены!\n\nТеперь ты будешь получать уведомления о готовых заказах прямо здесь.\n\n📦 Как только твой заказ будет готов, я сразу же сообщу тебе!`
            );
          }
        } else {
          // No token provided
          await sendTelegramMessage(
            chatId,
            `👋 Привет!\n\nДля подключения уведомлений используй персональную ссылку из настроек CRM.\n\nПерейди в свой профиль → Настройки → Telegram Уведомления и скопируй свою уникальную ссылку.`
          );
        }
      }
    }

    // Handle when bot is added to a group
    if (update.my_chat_member) {
      const chatMember = update.my_chat_member;
      const chat = chatMember.chat;
      const newStatus = chatMember.new_chat_member.status;
      
      // Bot was added to the group
      if (newStatus === "member" || newStatus === "administrator") {
        const chatId = chat.id.toString();
        const chatTitle = chat.title || "Unknown Group";
        
        console.log(`Bot added to group: ${chatTitle} (${chatId})`);
      }
    }

    return new Response(
      JSON.stringify({ ok: true }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ ok: true }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});