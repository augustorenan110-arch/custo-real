import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import OpenAI from 'npm:openai@6.45.0';

// Geração de vídeo pelo AI Gateway (modelos avançados: 1:1, 4K, até 15s+).
// A geração é assíncrona: crie o job e depois consulte pelo id até concluir.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, request, videoId } = await req.json().catch(() => ({}));
    const { baseURL, token, headers } = base44.asServiceRole.aiGateway.connection();
    const videos = new OpenAI({ baseURL, apiKey: token, defaultHeaders: headers }).videos;

    if (action === 'create') {
      if (!request || typeof request !== 'object') {
        return Response.json({ error: 'request is required' }, { status: 400 });
      }
      if (!request.model) return Response.json({ error: 'request.model is required' }, { status: 400 });
      if (typeof request.prompt !== 'string' || !request.prompt.trim()) {
        return Response.json({ error: 'request.prompt is required' }, { status: 400 });
      }
      return Response.json(await videos.create(request, { maxRetries: 0 }), { status: 202 });
    }

    if (action === 'retrieve') {
      if (!videoId || typeof videoId !== 'string') {
        return Response.json({ error: 'videoId is required' }, { status: 400 });
      }
      return Response.json(await videos.retrieve(videoId));
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.log('videoGateway error', error?.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}