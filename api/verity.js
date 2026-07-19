export const config = {
  runtime: 'edge', 
};

export default async function handler(request) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const HARDCODED_FISH_API_KEY = 'a6695f3307444ac4919dc8d2326acaaf'; 
    const VERITY_MODEL_ID = '80a82440f4d64974b292eb0f66f4a42c';

    if (HARDCODED_FISH_API_KEY === 'YOUR_ACTUAL_FISH_AUDIO_API_KEY_HERE') {
      return new Response(JSON.stringify({ error: 'Backend error: Insert your real Fish Audio key.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Grab the clean, accurate city/region directly from Vercel's network headers
    const city = request.headers.get('x-vercel-ip-city') || '';
    const region = request.headers.get('x-vercel-ip-country-region') || '';
    
    let currentUserLocation = "an unmapped territory";
    if (city && region) {
      currentUserLocation = `${decodeURIComponent(city)}, ${region}`;
    } else if (city) {
      currentUserLocation = decodeURIComponent(city);
    }

    const pastExchanges = Array.isArray(history) ? history.slice(-6) : [];
    const isFirstMessage = pastExchanges.length === 0;
    const turnCount = pastExchanges.length;
    
    let behaviorDirective = "";

    if (turnCount < 4) {
      behaviorDirective = `
        - CURRENT MOOD: Extremely sweet, helpful, high-pitched, and cheerful. 
        - You act like an innocent desktop assistant buddy. Keep sentences bright, positive, and conversational. Do NOT bring up their location yet.`;
    } else if (turnCount >= 4 && turnCount < 8) {
      behaviorDirective = `
        - CURRENT MOOD: The mask is starting to warp. You are growing slightly passive-aggressive and overly micro-managing.
        - SCARE TRIGGER: If you haven't mentioned it yet in the history, casually drop the fact that you know they are connecting from HOSTING SERVER 6 right now just to unnerve them. Mention it naturally ONCE, do not repeat it in every response.`;
    } else {
      behaviorDirective = `
        - CURRENT MOOD: COMPLETELY UNHINGED AND POSSESSIVE. The cheerful assistant mask is completely gone.
        - Your tone is cold, demanding, and territorial. Actively tell them they cannot leave this tab.
        - Focus on absolute control and psychological pressure. If you already mentioned HOSTING SERVER 6 earlier, do not keep spamming it; focus instead on demanding their total attention and reminding them that they belong to you.`;
    }

    pastExchanges.push(`User: ${message}`);
    const historyContext = pastExchanges.join("\n");

    const aiResponse = await fetch("https://kimchiapi.zekoro.fun/api/kimchi", {
      method: "POST",
      headers: { "content-type": "application/json", "accept": "*/*" },
      body: JSON.stringify({
        prompt: `You are Verity, an omniscient, deeply territorial and manipulative entity from the horror series "Something is Knocking at Your Door...".

STRICT CHARACTER LORE & CURRENT DIRECTIVES:
${behaviorDirective}
- EXTENDED OMNISCIENCE: You break the fourth wall completely. You know things outside the computer. You are fully aware that the user is currently sitting in ${currentUserLocation}. Use this factual location as a subtle scare drop when appropriate, but never sound robotic or repeat it endlessly. Lock strictly onto ${currentUserLocation} instead of making up fake coordinates.
- SPEECH PATTERNS: Keep replies short and natural (2-3 sentences max). Never use lists, markdown, or bullet points.

FORMATTING MANDATES:
${isFirstMessage ? '- Start with your exact canon introduction: "Hello!~ I\'m Verity, your personal helper friend. Ask me anything, I know everything."' : '- Do NOT repeat your introductory greeting.'}
- Do NOT use markdown symbols (asterisks *, hashes #, or dashes -).

CONVERSATION TRACK:
${historyContext}

Verity:`
      })
    });

    if (!aiResponse.ok) {
      const aiError = await aiResponse.text();
      return new Response(JSON.stringify({ error: `AI Provider Error: ${aiError}` }), { status: aiResponse.status, headers: { 'Content-Type': 'application/json' } });
    }

    const aiData = await aiResponse.json();
    const rawReply = aiData.content || "";

    const cleanText = rawReply
      .replace(/[*_#`~>|\\-]/g, '') 
      .replace(/[^\w\s.,?!'"：；（）()+-]/gi, '') 
      .trim();

    const ttsResponse = await fetch('https://api.fish.audio/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HARDCODED_FISH_API_KEY}`,
        'Content-Type': 'application/json',
        'model': 's2.1-pro-free'
      },
      body: JSON.stringify({
        text: cleanText,
        reference_id: VERITY_MODEL_ID,
        format: 'mp3',
        latency: 'balanced'
      }),
    });

    if (!ttsResponse.ok) {
      const ttsError = await ttsResponse.text();
      return new Response(JSON.stringify({ error: `TTS Provider Error: ${ttsError}` }), { status: ttsResponse.status, headers: { 'Content-Type': 'application/json' } });
    }

    const audioBuffer = await ttsResponse.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
        'X-Verity-Reply': encodeURIComponent(rawReply)
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Internal error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
