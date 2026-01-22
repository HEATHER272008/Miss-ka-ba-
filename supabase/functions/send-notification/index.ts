import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  user_ids: string[];
  title: string;
  body: string;
  notification_type?: string;
  data?: Record<string, string>;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const firebaseServerKey = Deno.env.get("FIREBASE_SERVER_KEY");
    if (!firebaseServerKey) {
      throw new Error("FIREBASE_SERVER_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_ids, title, body, notification_type = "general", data = {} }: NotificationRequest = await req.json();

    console.log(`Sending notification to ${user_ids.length} users: ${title}`);

    // Get device tokens for the target users
    const { data: tokens, error: tokensError } = await supabase
      .from("device_tokens")
      .select("token, user_id")
      .in("user_id", user_ids);

    if (tokensError) {
      console.error("Error fetching tokens:", tokensError);
      throw tokensError;
    }

    if (!tokens || tokens.length === 0) {
      console.log("No device tokens found for specified users");
      return new Response(
        JSON.stringify({ success: true, message: "No device tokens found", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${tokens.length} device tokens`);

    // Send FCM notifications
    const fcmUrl = "https://fcm.googleapis.com/fcm/send";
    const successfulSends: string[] = [];
    const failedSends: string[] = [];

    for (const { token, user_id } of tokens) {
      try {
        const fcmResponse = await fetch(fcmUrl, {
          method: "POST",
          headers: {
            "Authorization": `key=${firebaseServerKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: token,
            notification: {
              title,
              body,
              icon: "/favicon.ico",
            },
            data: {
              ...data,
              notification_type,
            },
          }),
        });

        const fcmResult = await fcmResponse.json();
        console.log(`FCM response for user ${user_id}:`, fcmResult);

        if (fcmResult.success === 1) {
          successfulSends.push(user_id);
        } else {
          failedSends.push(user_id);
          // Remove invalid tokens
          if (fcmResult.results?.[0]?.error === "NotRegistered") {
            await supabase
              .from("device_tokens")
              .delete()
              .eq("token", token);
            console.log(`Removed invalid token for user ${user_id}`);
          }
        }
      } catch (fcmError) {
        console.error(`Error sending to user ${user_id}:`, fcmError);
        failedSends.push(user_id);
      }
    }

    // Log the notification
    const authHeader = req.headers.get("Authorization");
    let sentBy = user_ids[0]; // Default fallback
    
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      if (user) {
        sentBy = user.id;
      }
    }

    await supabase.from("notifications").insert({
      title,
      body,
      sent_by: sentBy,
      sent_to: user_ids,
      notification_type,
    });

    console.log(`Notification sent: ${successfulSends.length} success, ${failedSends.length} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successfulSends.length,
        failed: failedSends.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-notification:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
