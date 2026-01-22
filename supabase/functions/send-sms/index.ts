import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SMSRequest {
  phone_number: string;
  message: string;
  student_id?: string;
  notification_type?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const semaphoreApiKey = Deno.env.get("SEMAPHORE_API_KEY");
    if (!semaphoreApiKey) {
      throw new Error("SEMAPHORE_API_KEY not configured");
    }

    const { phone_number, message, student_id, notification_type = "attendance_sms" }: SMSRequest = await req.json();

    if (!phone_number || !message) {
      throw new Error("phone_number and message are required");
    }

    console.log('[send-sms] request:', {
      phone_number,
      student_id,
      notification_type,
      messagePreview: message.substring(0, 80),
    });

    // Format phone number for Philippines (remove leading 0, add 63)
    let formattedNumber = phone_number.replace(/\D/g, ''); // Remove non-digits
    if (formattedNumber.startsWith('0')) {
      formattedNumber = '63' + formattedNumber.substring(1);
    } else if (!formattedNumber.startsWith('63')) {
      formattedNumber = '63' + formattedNumber;
    }

    const displayNumber = '+' + formattedNumber;

    console.log(`[send-sms] formatted number: ${displayNumber}`);

    // Send SMS via Semaphore API
    const semaphoreUrl = "https://api.semaphore.co/api/v4/messages";

    const formData = new URLSearchParams();
    formData.append('apikey', semaphoreApiKey);
    formData.append('number', formattedNumber);
    formData.append('message', message);

    const senderName = Deno.env.get('SEMAPHORE_SENDER_NAME');
    if (senderName) {
      formData.append('sendername', senderName);
    }

    console.log('[send-sms] calling Semaphore API');
    const smsResponse = await fetch(semaphoreUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    // Get raw response text first
    const responseText = await smsResponse.text();
    console.log("[send-sms] Semaphore raw response:", responseText);

    // Try to parse as JSON
    let smsResult;
    try {
      smsResult = JSON.parse(responseText);
    } catch {
      // If not JSON, it's an error message from Semaphore
      console.error("[send-sms] Semaphore returned non-JSON response:", responseText);
      throw new Error(`Semaphore API error: ${responseText}`);
    }

    console.log("[send-sms] Semaphore API response:", {
      ok: smsResponse.ok,
      status: smsResponse.status,
      result: smsResult,
    });

    if (smsResult.error || (Array.isArray(smsResult) && smsResult[0]?.status === "failed")) {
      const errorMsg = smsResult.error || smsResult[0]?.message || "Failed to send SMS";
      console.error("[send-sms] SMS sending failed:", errorMsg);
      throw new Error(errorMsg);
    }

    // Log the SMS notification in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: logError } = await supabase.from("notifications").insert({
      title: "SMS Notification",
      body: message,
      sent_by: student_id ?? 'system',
      sent_to: student_id ? [student_id] : [],
      notification_type,
    });

    if (logError) {
      console.error('[send-sms] failed to log notification:', logError);
    }

    console.log(`[send-sms] SMS sent successfully to ${displayNumber}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "SMS sent successfully",
        recipient: displayNumber,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-sms:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
