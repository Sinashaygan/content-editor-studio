"use client";

import { useDeleteDocument } from "@/entities/document/hooks/use-delete-documents";
import { useDocuments } from "@/entities/document/hooks/use-documents";
import { CreateDocumentSection } from "@/entities/document/ui/create-document-dialog";
import { DocumentCard } from "@/entities/document/ui/document-card";
export default function HomePage() {
  const { data: documents, isLoading, error } = useDocuments();
  const deleteMutation = useDeleteDocument();

  const handleDelete=(id:string)=>{
    if (confirm("Are you sure you want to delete this document?")) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <main className="max-w-5xl mx-auto p-6 md:p-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Content CMS</h1>
        <p className="text-neutral-500">
          Educational editor with Concurrency Control and Tiptap Integration.
        </p>
      </header>

      <CreateDocumentSection />

      <section>
        <h2 className="text-xl font-semibold mb-4">Documents</h2>
        {isLoading && <p className="text-neutral-500">Loading documents...</p>}
        {error && (
          <p className="text-red-500">
            Error loading documents: {(error as Error).message}
          </p>
        )}

        {documents && documents.length === 0 && (
          <p className="text-neutral-400">
            No documents yet. Create your first document above.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {documents?.map((doc) => (
            <DocumentCard key={doc.id} document={doc} onDelete={()=>handleDelete(doc.id)}/>
          ))}
        </div>
      </section>
    </main>
  );
}
