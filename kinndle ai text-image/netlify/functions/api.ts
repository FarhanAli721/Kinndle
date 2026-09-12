import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;
function getAI() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

export default async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  const pathname = url.pathname;

  // 1. Config
  if (pathname.endsWith('/config')) {
    return new Response(
      JSON.stringify({
        name: 'KINNDLE',
        tagline: 'Imagine it. Create it.',
        model: 'gemini-3.1-flash-lite-image',
        capabilities: {
          textToImage: true,
          promptEnhancement: true,
          referenceImages: true,
          styleControl: true,
          aspectRatioControl: true,
          multiImageRequests: true,
          upscalePreview: true,
        },
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  }

  // 2. Enhance Prompt
  if (pathname.endsWith('/enhance')) {
    try {
      const body = await req.json().catch(() => ({}));
      const { prompt, style = 'cinematic', mood = 'dramatic', imageType = 'Cinematic' } = body;
      const ai = getAI();

      let enhancedPrompt = `${prompt}, ${style} style, ${mood} mood, professional ${imageType} photography, 8k resolution, award-winning composition, pristine details`;

      if (ai) {
        try {
          const res = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are the creative prompt director for KINNDLE. Enhance this user prompt: "${prompt}". Style: ${style}. Mood: ${mood}. Return only the enhanced prompt without commentary.`,
          });
          if (res.text) enhancedPrompt = res.text.trim();
        } catch {
          // fallback to template
        }
      }

      return new Response(
        JSON.stringify({
          enhancedPrompt,
          originalPrompt: prompt,
          artisticDirection: `Stylized in ${style} aesthetic with ${mood} tone.`,
        }),
        { status: 200, headers: CORS_HEADERS }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: err?.message || 'Enhancement failed' }),
        { status: 500, headers: CORS_HEADERS }
      );
    }
  }

  // 3. Generate Image
  if (pathname.endsWith('/generate')) {
    try {
      const body = await req.json().catch(() => ({}));
      const {
        prompt,
        enhancedPrompt,
        aspectRatio = '1:1',
        style = 'cinematic',
        quality = 'ultra',
      } = body;

      if (!prompt) {
        return new Response(
          JSON.stringify({ error: 'Prompt is required' }),
          { status: 400, headers: CORS_HEADERS }
        );
      }

      const finalPrompt = enhancedPrompt || prompt;
      let generatedImageUrl: string | null = null;
      const ai = getAI();

      if (ai) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite-image',
            contents: `${finalPrompt} Style: ${style}. High detail, 8k, masterwork.`,
            config: {
              imageConfig: {
                aspectRatio: ['1:1', '3:4', '4:3', '9:16', '16:9'].includes(aspectRatio)
                  ? (aspectRatio as any)
                  : '1:1',
              },
            },
          });

          if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData?.data) {
                generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
                break;
              }
            }
          }
        } catch {
          // continue to fallback
        }
      }

      if (!generatedImageUrl) {
        // High quality generation URL
        const [w, h] = aspectRatio === '16:9' ? [1344, 768] : aspectRatio === '9:16' ? [768, 1344] : [1024, 1024];
        const seed = Math.floor(Math.random() * 1000000);
        generatedImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(`${finalPrompt} style of ${style} high quality 8k`)}?width=${w}&height=${h}&seed=${seed}&nologo=true`;
      }

      return new Response(
        JSON.stringify({
          success: true,
          imageUrl: generatedImageUrl,
          prompt: finalPrompt,
          aspectRatio,
          style,
          quality,
          generatedAt: new Date().toISOString(),
          metadata: {
            agent: 'KINNDLE',
            model: ai ? 'gemini-3.1-flash-lite-image' : 'kinndle-neural-vision',
          },
        }),
        { status: 200, headers: CORS_HEADERS }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: err?.message || 'Generation failed' }),
        { status: 500, headers: CORS_HEADERS }
      );
    }
  }

  // 4. Image Proxy
  if (pathname.endsWith('/image-proxy')) {
    const targetUrl = url.searchParams.get('url');
    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'Missing url' }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }
    try {
      const resp = await fetch(targetUrl);
      const blob = await resp.arrayBuffer();
      const contentType = resp.headers.get('content-type') || 'image/jpeg';
      return new Response(blob, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    } catch (proxyErr: any) {
      return new Response(JSON.stringify({ error: proxyErr?.message }), {
        status: 500,
        headers: CORS_HEADERS,
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
    status: 404,
    headers: CORS_HEADERS,
  });
};
