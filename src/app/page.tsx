'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, AlertCircle, CheckCircle2, Loader2, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

export default function VideoDownloader() {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tiktokUrl, setTiktokUrl] = useState('');

  // Reset download state when URL changes
  const resetDownloadState = () => {
    setDownloadComplete(false);
    setError(null);
    setProgress(0);
  };

  const handleTiktokUrlChange = (value: string) => {
    setTiktokUrl(value);
    resetDownloadState();
  };

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      setError('Por favor, insira um link válido');
      return false;
    }

    const tiktokRegex = /^(https?:\/\/)?(www\.)?(tiktok\.com|vm\.tiktok\.com)\/.+/;
    if (!tiktokRegex.test(url)) {
      setError('Link inválido do TikTok');
      return false;
    }

    setError(null);
    return true;
  };

  const handleDownload = async (url: string) => {
    if (!validateUrl(url)) {
      return;
    }

    setDownloading(true);
    setProgress(0);
    setDownloadComplete(false);
    setError(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      const response = await fetch('/api/download/tiktok', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar o vídeo');
      }

      // Download actual video file
      if (data.data?.downloadUrl) {
        const filename = data.data.title || 'TikTok_Video';
        const sanitizedFilename = filename.replace(/[^a-z0-9]/gi, '_');

        // Use our backend proxy to download the video (avoids CORS issues)
        const proxyUrl = `/api/download/tiktok?url=${encodeURIComponent(data.data.downloadUrl)}&filename=${sanitizedFilename}.mp4`;

        const videoResponse = await fetch(proxyUrl);

        if (!videoResponse.ok) {
          throw new Error('Erro ao baixar o vídeo do servidor');
        }

        const blob = await videoResponse.blob();

        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${sanitizedFilename}.mp4`;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        window.URL.revokeObjectURL(downloadUrl);
      }

      clearInterval(progressInterval);
      setProgress(100);
      setDownloadComplete(true);

      toast({
        title: 'Sucesso!',
        description: 'Vídeo baixado com sucesso!',
        className: 'bg-green-500 text-white',
      });
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'Erro ao processar o vídeo');
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro ao processar o vídeo',
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
      clearInterval(progressInterval);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Background gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a] opacity-50 pointer-events-none" />

      <div className="relative min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
          <div className="container mx-auto px-4 py-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 bg-gradient-to-br from-[#00f2ea] to-[#ff0050] rounded-xl">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00f2ea] to-[#ff0050] bg-clip-text text-transparent">
                  TikTok Video Downloader
                </h1>
                <p className="text-sm text-gray-400">Baixe vídeos do TikTok em MP4 sem marca d'água</p>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-white/10 bg-black/40 backdrop-blur-sm shadow-2xl overflow-hidden">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-2xl font-bold text-white">
                  Baixar Vídeo do TikTok
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Cole o link do TikTok e clique em baixar
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Link do TikTok
                    </label>
                    <Input
                      type="text"
                      placeholder="https://www.tiktok.com/@usuario/video/..."
                      value={tiktokUrl}
                      onChange={(e) => handleTiktokUrlChange(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#00f2ea] transition-colors"
                      disabled={downloading}
                    />
                  </div>
                  <Button
                    onClick={() => handleDownload(tiktokUrl)}
                    disabled={downloading}
                    className="w-full bg-gradient-to-r from-[#00f2ea] to-[#ff0050] hover:from-[#00d0ca] hover:to-[#e60048] text-black font-semibold shadow-lg shadow-[#00f2ea]/25 transition-all duration-300"
                  >
                    {downloading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Baixando...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Baixar MP4
                      </>
                    )}
                  </Button>

                  {/* Progress Bar */}
                  {downloading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Progresso</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 bg-white/10" />
                    </motion.div>
                  )}
                </div>

                {/* Error Alert */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {/* Success Alert */}
                {downloadComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <Alert className="bg-green-500/10 border-green-500/50 text-green-200">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        Vídeo baixado com sucesso! O arquivo foi salvo no seu dispositivo.
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Features Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8"
            >
              <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#00f2ea]/20 rounded-xl">
                      <Video className="w-6 h-6 text-[#00f2ea]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">TikTok Downloader</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Baixe vídeos do TikTok em alta qualidade MP4, com ou sem marca d'água.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 backdrop-blur-sm bg-black/20 mt-auto">
          <div className="container mx-auto px-4 py-6">
            <p className="text-sm text-gray-400 text-center">
              © 2025 TikTok Video Downloader. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
