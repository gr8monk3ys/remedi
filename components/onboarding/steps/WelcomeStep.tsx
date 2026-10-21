"use client";

import { Shield, Sparkles, Users, Zap } from "lucide-react";

interface WelcomeStepProps {}

export function WelcomeStep(_props: WelcomeStepProps): React.ReactNode {
  return (
    <div className="space-y-6">
      <p className="text-base leading-relaxed text-muted-foreground">
        Learn about natural remedies and how they relate to pharmaceuticals and
        supplements: what they are used for, how strong the evidence is, and
        known interactions. Remedi is information, not medical advice.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md border border-border bg-background p-4">
          <Shield className="mb-3 h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Evidence Levels
          </h3>
          <p className="text-sm text-muted-foreground">
            Each remedy shows its evidence level
          </p>
        </div>
        <div className="rounded-md border border-border bg-background p-4">
          <Sparkles className="mb-3 h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">AI-Powered</h3>
          <p className="text-sm text-muted-foreground">
            Smart recommendations for you
          </p>
        </div>
        <div className="rounded-md border border-border bg-background p-4">
          <Users className="mb-3 h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Community</h3>
          <p className="text-sm text-muted-foreground">
            Share reviews and suggest remedies
          </p>
        </div>
        <div className="rounded-md border border-border bg-background p-4">
          <Zap className="mb-3 h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Instant Results
          </h3>
          <p className="text-sm text-muted-foreground">
            Look things up in seconds
          </p>
        </div>
      </div>
    </div>
  );
}
