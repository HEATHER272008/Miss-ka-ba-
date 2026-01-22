import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CrossLogo } from '@/components/CrossLogo';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    const payload = {
      to_email: email,
      to_name: name,
      student_name: name,
      status: 'welcome',
      time: new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
    };

    console.log('[EMAIL] invoking send-email (welcome) with:', payload);
    const { data, error } = await supabase.functions.invoke('send-email', { body: payload });

    if (error) {
      console.error('[EMAIL] welcome email failed:', error);
      return;
    }

    console.log('[EMAIL] welcome email response:', data);
  } catch (error) {
    console.error('[EMAIL] unexpected error sending welcome email:', error);
  }
};

const SECTIONS = [
  '12 ABM JOY', '12 STEM COUNSEL', '12 STEM TEMPERANCE', '12 STEM INTEGRITY',
  '12 HUMSS PEACE', '12 HUMSS CHARITY', '12 HUMSS HUMILITY', '12 HUMSS FAITH',
  '12 TVL BP', '12 TVL ICT',
  '11 DILIGENCE', '11 WISDOM', '11 KNOWLEDGE', '11 PRUDENCE',
  '11 PIETY', '11 HOPE', '11 FORTITUDE'
];

const withTimeout = <T,>(promise: Promise<T>, ms: number, label: string) => {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
    promise
      .then((value) => {
        clearTimeout(id);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(id);
        reject(err);
      });
  });
};

const provisionAccount = async () => {
  // Get the current session to ensure we have a valid token
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.access_token) {
    console.warn('[Auth] No session available for provisioning, skipping');
    return;
  }
  
  const { error } = await withTimeout(
    supabase.functions.invoke('provision-user', {
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
    }),
    8000,
    'Account setup'
  );
  if (error) {
    console.error('[Auth] Provision error:', error);
    // Don't throw - allow login to continue even if provisioning fails
    // The useAuth hook will retry provisioning
  }
};

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [parentGuardianName, setParentGuardianName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [section, setSection] = useState('');
  const [adviserName, setAdviserName] = useState('');
  const [parentNumber, setParentNumber] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [informedConsentAccepted, setInformedConsentAccepted] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Ensure the user has matching profile + role records (fixes long/infinite dashboard loading)
      await provisionAccount();

      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!name || !email || !password || !phone || !birthday) {
        throw new Error('Please fill in all required fields.');
      }

      // Validate password confirmation
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match.');
      }

      // Validate student-specific fields only for students
      if (role === 'student' && (!section || !parentNumber || !parentGuardianName || !adviserName)) {
        throw new Error('Please fill in all required fields for students.');
      }

      // Validate terms acceptance
      if (!termsAccepted) {
        throw new Error('Please accept the Terms & Conditions to continue.');
      }

      // Validate informed consent
      if (!informedConsentAccepted) {
        throw new Error('Please accept the Informed Consent to continue.');
      }

      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            phone,
            parent_guardian_name: parentGuardianName,
            birthday,
            role,
            adviser_name: adviserName,
            terms_accepted: termsAccepted,
            section: role === 'student' ? section : null,
            parent_number: role === 'student' ? parentNumber : null,
          },
        },
      });

      if (error) throw error;

      // Some auth configurations may not immediately create a session on sign up.
      // If that happens, sign in once so we can finish account provisioning.
      if (!data.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }

      // Create/repair profile + role records
      await provisionAccount();

      // Send welcome email (don't block signup UI on external email latency)
      sendWelcomeEmail(email, name);

      toast({
        title: 'Account created!',
        description: 'Welcome to CathoLink. A welcome email has been sent to you.',
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CrossLogo size={100} />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">CathoLink</CardTitle>
          <CardDescription>Faith. Attendance. Connection.</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={isLogin ? 'login' : 'signup'} onValueChange={(v) => setIsLogin(v === 'login')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone/Contact Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birthday">Birthday (MM/DD/YYYY)</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={(v: 'student' | 'admin') => setRole(v)}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {role === 'student' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="parent-guardian">Parent/Guardian Name</Label>
                      <Input
                        id="parent-guardian"
                        type="text"
                        placeholder="Parent/Guardian full name"
                        value={parentGuardianName}
                        onChange={(e) => setParentGuardianName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="section">Section</Label>
                      <Select value={section} onValueChange={setSection}>
                        <SelectTrigger id="section">
                          <SelectValue placeholder="Select your section" />
                        </SelectTrigger>
                        <SelectContent>
                          {SECTIONS.map((sec) => (
                            <SelectItem key={sec} value={sec}>
                              {sec}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="adviser-name">Adviser Name</Label>
                      <Input
                        id="adviser-name"
                        type="text"
                        placeholder="Your adviser's name"
                        value={adviserName}
                        onChange={(e) => setAdviserName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="parent-number">Parent's Phone Number</Label>
                      <Input
                        id="parent-number"
                        type="tel"
                        placeholder="Enter parent's phone number"
                        value={parentNumber}
                        onChange={(e) => setParentNumber(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
                
                {/* Informed Consent */}
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="informed-consent"
                    checked={informedConsentAccepted}
                    onChange={(e) => setInformedConsentAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4"
                    required
                  />
                  <Label htmlFor="informed-consent" className="text-sm cursor-pointer">
                    I agree to the{' '}
                    <Dialog>
                      <DialogTrigger asChild>
                        <button type="button" className="text-primary underline hover:text-primary/80">
                          Informed Consent
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle className="text-xl">Informed Consent</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-[60vh] pr-4">
                          <div className="space-y-6 text-muted-foreground">
                            <p className="leading-relaxed">
                              <strong>Greetings of love and peace!</strong>
                            </p>
                            
                            <p className="leading-relaxed">
                              We, the undersigned Grade 12 students of Binmaley Catholic School, Inc., currently enrolled in the 
                              subject Inquiries, Investigation, and Immersion are presently working on our research paper entitled: 
                              <em className="font-medium text-foreground"> "Development of IoT-Based Student Monitoring App for Enhanced 
                              Security in the Senior High School Department of Binmaley Catholic School, Inc."</em>
                            </p>
                            
                            <p className="leading-relaxed">
                              In this connection, may we request your voluntary participation in our study as we believe that your 
                              insights, perspectives, and other relevant information are deemed relevant and significant in the success 
                              of our investigation. Please be informed that your participation is voluntary in nature and you may 
                              withdraw anytime when you feel your rights are at risk. Nevertheless, we assure you that all data shared 
                              in this study will be kept confidential and data privacy regulations mandated by law are strongly upheld.
                            </p>
                            
                            <p className="leading-relaxed">
                              By agreeing to this informed consent, you are signifying an intention to participate in the data gathering 
                              process. For any information you may be needing, kindly reach us through these contact details: 
                              cellphone no: <strong>0956-7456-492</strong> or email: <strong>lopezmarkemman@gmail.com</strong>.
                            </p>
                            
                            <p className="leading-relaxed">
                              Thank you and more power!
                            </p>
                            
                            <section className="pt-4 border-t">
                              <p className="font-medium text-foreground mb-2">Sincerely,</p>
                              <ul className="space-y-1 text-sm">
                                <li>Jermaine Summer A. Segundo</li>
                                <li>Mark Emman A. Lopez</li>
                                <li>Edrian Rheine C. Baugan</li>
                                <li>Samuel Jr. C. De Guzman</li>
                                <li>Jake Raizain E. Bambao</li>
                              </ul>
                            </section>
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </Label>
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4"
                    required
                  />
                  <Label htmlFor="terms" className="text-sm cursor-pointer">
                    I accept the{' '}
                    <Dialog>
                      <DialogTrigger asChild>
                        <button type="button" className="text-primary underline hover:text-primary/80">
                          Terms & Conditions
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle className="text-xl">Data Privacy Consent & Terms</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-[60vh] pr-4">
                          <div className="space-y-6 text-muted-foreground">
                            <section>
                              <h2 className="text-lg font-semibold text-foreground mb-3">Informed Consent for Data Collection</h2>
                              <p className="leading-relaxed">
                                In accordance with the <strong>Data Privacy Act of 2012</strong> and its Implementing Rules and Regulations, 
                                I voluntarily authorize <strong>12-Counsel Group #1</strong> to collect, process, and use my personal 
                                information for the research entitled <em>"Development of an IoT-Based Student Monitoring Application 
                                for Enhanced Security in the Senior High School Department of Binmaley Catholic School, Inc."</em>
                              </p>
                            </section>

                            <section>
                              <h2 className="text-lg font-semibold text-foreground mb-3">Voluntary Participation</h2>
                              <p className="leading-relaxed">
                                I understand that my participation is entirely voluntary and that I may withdraw from the study 
                                at any point without any form of penalty or adverse consequence.
                              </p>
                            </section>

                            <section>
                              <h2 className="text-lg font-semibold text-foreground mb-3">Confidentiality & Data Protection</h2>
                              <p className="leading-relaxed">
                                All information I provide will be treated with strict confidentiality and will be used exclusively 
                                for academic research purposes. I further acknowledge that the Research Team will apply appropriate 
                                data protection measures to ensure the security of my personal information.
                              </p>
                            </section>

                            <section className="pt-4 border-t">
                              <p className="text-sm italic">
                                By checking the terms acceptance box during signup, you confirm that you have read, understood, 
                                and agree to the above terms.
                              </p>
                            </section>
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </Label>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;