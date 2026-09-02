import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Document } from "../model/types";

interface DocumentCardProps {
  document: Document;
  onDelete?: (id: string) => void;
}

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="line-clamp-1">
          {document.title || "Untitled Document"}
        </CardTitle>
        <CardDescription>
          Version: {document.version} • Updated:{" "}
          {document.updatedAt.toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <Link href={`/editor/${document.id}`}>
          <Button variant="outline" size="sm">
            Open Editor
          </Button>
        </Link>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(document.id)}
          >
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
