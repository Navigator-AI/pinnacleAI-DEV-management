import { FileText, FolderPlus, Upload, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function DocumentsPage() {
  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold" data-testid="text-documents-title">Documents</h1>
            <p className="text-sm text-muted-foreground">
              File management and document storage
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" data-testid="button-new-folder">
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
            <Button data-testid="button-upload-file">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="pl-9"
              data-testid="input-search-documents"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2" data-testid="text-documents-coming-soon">Documents</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Folder tree organization, drag-and-drop upload, file preview,
              version history, and share access controls.
            </p>
            <Badge variant="secondary">Coming Soon</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
