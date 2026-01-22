import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CrossLogo } from '@/components/CrossLogo';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '@/hooks/use-toast';

const StudentQRCode = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  if (!profile) {
    return null;
  }

  const qrData = JSON.stringify({
    name: profile.name,
    section: profile.section,
    parent_number: profile.parent_number,
    user_id: profile.user_id
  });

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 512;
    canvas.height = 512;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${profile.name.replace(/\s+/g, '_')}_QR.png`;
          link.click();
          URL.revokeObjectURL(url);
          
          toast({
            title: 'QR Code Downloaded',
            description: 'Your QR code has been saved to your device.',
          });
        }
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CrossLogo size={80} />
            </div>
            <CardTitle className="text-2xl">Your Personal QR Code</CardTitle>
            <CardDescription>
              Show this QR code to the admin for attendance scanning
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center gap-6">
            <div className="bg-white p-8 rounded-lg shadow-inner">
              <QRCodeSVG
                id="qr-code"
                value={qrData}
                size={256}
                level="H"
                includeMargin={true}
                className="glow-effect"
              />
            </div>

            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">{profile.name}</p>
              <p className="text-muted-foreground">Section: {profile.section}</p>
            </div>

            <Button 
              onClick={downloadQR}
              size="lg"
              className="w-full max-w-xs"
            >
              <Download className="h-5 w-5 mr-2" />
              Download My QR Code
            </Button>

            <p className="text-sm text-muted-foreground text-center max-w-md">
              Keep this QR code safe. Only show it to authorized school administrators for attendance recording.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentQRCode;