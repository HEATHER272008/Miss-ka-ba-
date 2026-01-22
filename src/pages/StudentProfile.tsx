import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CrossLogo } from '@/components/CrossLogo';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Upload, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const StudentProfile = () => {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile?.user_id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: data.publicUrl })
        .eq('user_id', profile?.user_id);

      if (updateError) throw updateError;

      await refreshProfile();

      toast({
        title: 'Success!',
        description: 'Your profile picture has been updated.',
      });

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <CrossLogo size={120} clickable={false} />
          <p className="mt-4 text-lg text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

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
              <CrossLogo size={80} clickable={false} />
            </div>
            <CardTitle className="text-2xl">My Profile</CardTitle>
            <CardDescription>
              View and update your profile information
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                {profile.profile_picture_url ? (
                  <img 
                    src={profile.profile_picture_url} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-primary" />
                )}
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Label htmlFor="picture" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>{uploading ? 'Uploading...' : 'Change Profile Picture'}</span>
                  </div>
                </Label>
                <Input
                  id="picture"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Upload a photo (JPG, PNG)
                </p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-4 pt-4 border-t">
              <div>
                <Label className="text-muted-foreground">Full Name</Label>
                <p className="text-lg font-semibold">{profile.name}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="text-lg">{profile.email}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Phone Number</Label>
                <p className="text-lg">{profile.phone || 'Not provided'}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Section</Label>
                <p className="text-lg font-semibold text-primary">{profile.section}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Adviser</Label>
                <p className="text-lg">{profile.adviser_name || 'Not assigned'}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Parent/Guardian</Label>
                <p className="text-lg">{profile.parent_guardian_name || 'Not provided'}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Parent Contact Number</Label>
                <p className="text-lg">{profile.parent_number || 'Not provided'}</p>
              </div>

              {profile.birthday && (
                <div>
                  <Label className="text-muted-foreground">Birthday</Label>
                  <p className="text-lg">
                    {new Date(profile.birthday).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentProfile;
