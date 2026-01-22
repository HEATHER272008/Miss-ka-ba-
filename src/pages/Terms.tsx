import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
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
          <CardHeader>
            <CardTitle className="text-2xl">Data Privacy Consent & Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-muted-foreground">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
