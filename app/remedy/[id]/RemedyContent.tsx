import Link from "next/link";
import {
  BookOpen,
  Pill,
  AlertCircle,
  Beaker,
  ExternalLink,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InteractionWarnings } from "@/components/interactions/InteractionWarnings";
import { ReviewsSection } from "@/components/remedy/ReviewsSection";

interface RemedyContentProps {
  id: string;
  name: string;
  usage: string;
  dosage: string;
  precautions: string;
  scientificInfo: string;
  references: { title: string; url: string }[];
  relatedRemedies: { id: string; name: string }[];
}

export function RemedyContent({
  id,
  name,
  usage,
  dosage,
  precautions,
  scientificInfo,
  references,
  relatedRemedies,
}: RemedyContentProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Main Content */}
      <div className="space-y-6 md:col-span-2">
        {/* Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-primary" />
              Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {usage}
            </p>
          </CardContent>
        </Card>

        {/* Dosage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Pill className="h-4 w-4 text-primary" />
              Dosage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {dosage}
            </p>
          </CardContent>
        </Card>

        {/* Precautions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Precautions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {precautions}
            </p>
          </CardContent>
        </Card>

        {/* Interaction Warnings */}
        <InteractionWarnings remedyName={name} />

        {/* Scientific Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Beaker className="h-4 w-4 text-primary" />
              Scientific Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {scientificInfo}
            </p>
            {references.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">References</h4>
                <ul className="space-y-1.5">
                  {references.map(
                    (ref: { title: string; url: string }, index: number) => (
                      <li key={index}>
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          {ref.title}
                        </a>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medical Disclaimer */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Medical Disclaimer</AlertTitle>
          <AlertDescription>
            This information is for educational purposes only and is not
            intended as a substitute for medical advice. Always consult a
            qualified healthcare provider before using any natural remedy or
            making changes to your treatment plan.
          </AlertDescription>
        </Alert>

        {/* Reviews */}
        <ReviewsSection remedyId={id} remedyName={name} />
      </div>

      {/* Sidebar */}
      <div>
        <Card className="sticky top-24">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Related Remedies</CardTitle>
          </CardHeader>
          <CardContent>
            {relatedRemedies.length > 0 ? (
              <div className="space-y-2">
                {relatedRemedies.map(
                  (related: { id: string; name: string }) => (
                    <Link
                      key={related.id}
                      href={`/remedy/${related.id}`}
                      className="group flex items-center justify-between rounded-lg border p-3 text-sm transition-colors hover:bg-accent/50"
                    >
                      <span>{related.name}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  ),
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No related remedies found.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
