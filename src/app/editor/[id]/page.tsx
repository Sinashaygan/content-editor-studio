"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, FileX, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useDocument } from "@/entities/document/hooks/use-document-by-id";
import { EditorCanvas } from "@/widget/editor/ui/editor-canvas";

interface DocumentEditorPageProps {
  params: Promise<{ id: string }>;
}

export default function DocumentEditorPage({
  params,
}: DocumentEditorPageProps) {
  const { id } = use(params);
  const { data: document, isLoading, error, refetch } = useDocument(id);

  // 1. Loading State (Shadcn Skeleton)
  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-10">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-36" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
        <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Error or Not Found State
  if (error || !document) {
    const isForbiddenOrNotFound = !document && !error;
    const errorMessage =
      error instanceof Error
        ? error.message
        : "The document you are looking for does not exist or you do not have permission to view it.";

    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center p-4">
        <Card className="w-full text-center shadow-md">
          <CardHeader className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              {isForbiddenOrNotFound ? (
                <FileX className="h-6 w-6" />
              ) : (
                <AlertCircle className="h-6 w-6" />
              )}
            </div>
            <CardTitle className="text-xl font-bold">
              {isForbiddenOrNotFound
                ? "Document Not Found"
                : "Failed to Load Document"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="text-sm">
                {errorMessage}
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-center gap-3">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            {error && (
              <Button variant="default" onClick={() => void refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 3. Success / Main Canvas State
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between border-b pb-4">
        <Link
          href="/"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <main className="transition-all duration-200">
        <EditorCanvas initialDocument={document} />
      </main>
    </div>
  );
}
