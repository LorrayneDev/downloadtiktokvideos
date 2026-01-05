import { NextRequest, NextResponse } from 'next/server';

interface TikTokDownloadRequest {
  url: string;
}

interface TikTokDownloadResponse {
  success: boolean;
  message: string;
  data?: {
    title: string;
    thumbnail: string;
    author?: string;
    description?: string;
    downloadUrl?: string;
    noWatermarkUrl?: string;
  };
}

interface TikWMResponse {
  code: number;
  msg: string;
  data?: {
    id: string;
    title: string;
    cover: string;
    author: {
      nickname: string;
      unique_id: string;
    };
    play: string;
    wmplay: string;
    music: string;
  };
}

/**
 * TikTok Video Downloader API Endpoint
 *
 * Uses tikwm.com API to download TikTok videos without watermark
 */
export async function POST(request: NextRequest) {
  try {
    const body: TikTokDownloadRequest = await request.json();
    const { url } = body;

    // Validate request body
    if (!url) {
      return NextResponse.json(
        { error: 'URL é obrigatória' },
        { status: 400 }
      );
    }

    // Validate TikTok URL
    const tiktokRegex = /^(https?:\/\/)?(www\.)?(tiktok\.com|vm\.tiktok\.com)\/.+/;
    if (!tiktokRegex.test(url)) {
      return NextResponse.json(
        { error: 'URL inválida do TikTok' },
        { status: 400 }
      );
    }

    console.log(`Fetching TikTok video from: ${url}`);

    // Fetch video info from TikWM API
    const tikwmUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
    const response = await fetch(tikwmUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const tikwmData: TikWMResponse = await response.json();

    if (!response.ok || tikwmData.code !== 0 || !tikwmData.data) {
      console.error('TikWM API error:', tikwmData);
      return NextResponse.json(
        { error: 'Erro ao obter informações do vídeo do TikTok. Verifique se o link está correto.' },
        { status: 500 }
      );
    }

    const { data } = tikwmData;

    // Return video information with download URLs
    const responseData: TikTokDownloadResponse = {
      success: true,
      message: 'Vídeo obtido com sucesso',
      data: {
        title: data.title || 'TikTok Video',
        thumbnail: data.cover,
        author: data.author.nickname,
        description: data.title,
        downloadUrl: data.play, // With watermark
        noWatermarkUrl: data.wmplay, // Without watermark
      }
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Erro ao processar download do TikTok:', error);

    return NextResponse.json(
      {
        error: 'Erro ao processar o vídeo',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

/**
 * Get actual video file from TikTok
 * This endpoint handles CORS issues by proxying video through our server
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoUrl = searchParams.get('url');
    const filename = searchParams.get('filename') || 'tiktok_video.mp4';

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'URL do vídeo é obrigatória' },
        { status: 400 }
      );
    }

    console.log(`Downloading TikTok video from: ${videoUrl}`);

    // Fetch video from TikTok server
    const response = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch video:', response.status);
      return NextResponse.json(
        { error: 'Falha ao baixar o vídeo do servidor do TikTok' },
        { status: 500 }
      );
    }

    // Get video content
    const videoBuffer = await response.arrayBuffer();

    // Return video as download
    return new NextResponse(videoBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': videoBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('Erro ao baixar vídeo do TikTok:', error);

    return NextResponse.json(
      {
        error: 'Erro ao baixar o vídeo',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// OPTIONS method for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
