import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CrossLogo } from "@/components/CrossLogo";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CrossLogo size={100} />
            </div>
            <CardTitle className="text-3xl">About CathoLink</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">Faith. Attendance. Connection.</h2>
              <p className="text-muted-foreground">
                CathoLink is a comprehensive attendance tracking system designed specifically for 
                Binmaley Catholic School Inc. It combines faith, technology, and community to ensure 
                the safety and accountability of our students.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">Our Mission</h2>
              <p className="text-muted-foreground">
                To provide a seamless, secure, and efficient way to track student attendance while 
                keeping parents informed and connected with their children's school activities.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">Features</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Real-time QR code-based attendance tracking</li>
                <li>Automatic parent notifications via SMS and email</li>
                <li>Comprehensive attendance history and reports</li>
                <li>Role-based access for students and administrators</li>
                <li>Birthday celebrations for students</li>
                <li>Secure and encrypted data handling</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">Creators & Development Team</h2>
              <p className="text-muted-foreground mb-4">
                This application was developed with dedication to serve the Binmaley Catholic School community.
              </p>
              <div className="space-y-3">
                <div className="bg-primary/5 p-4 rounded-lg">
                  <p className="font-semibold text-primary">Developer:</p>
                  <p className="text-lg font-bold">Mark Emman Lopez</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <p className="font-semibold text-primary">Research Leader:</p>
                  <p className="text-lg font-bold">Jermaine Summer Segundo</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg">
                  <p className="font-semibold text-primary">Research Members:</p>
                  <ul className="text-lg font-bold space-y-1 mt-1">
                    <li>Edrian Rheine Baugan</li>
                    <li>Samuel Jr. De Guzman</li>
                    <li>Jake Raizain Bambao</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary mb-3">Contact</h2>
              <p className="text-muted-foreground">
                For support or inquiries, please contact the school administration at 
                Binmaley Catholic School Inc.
              </p>
            </section>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>© 2025 CathoLink - All Rights Reserved</p>
              <p className="mt-2">Powered by Stark Corporation</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
