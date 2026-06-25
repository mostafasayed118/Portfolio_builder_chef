"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

function DefaultFallback({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("errors");
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <AlertTriangle className="h-10 w-10 text-muted-foreground mb-4" />
      <p className="text-foreground font-medium mb-1">{t("convexTitle")}</p>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        {t("convexMessage")}
      </p>
      <Button onClick={onRetry} variant="outline" size="sm">
        {t("tryAgain")}
      </Button>
    </div>
  );
}

export class ConvexErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ConvexErrorBoundary caught:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return <DefaultFallback onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}
