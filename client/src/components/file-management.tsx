import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Folder, 
  File, 
  Plus, 
  Search, 
  MoreVertical, 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  FileCode, 
  ChevronRight,
  Upload,
  FolderPlus,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { Folder as FolderType, Document } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface FileManagementProps {
  projectId: string;
}

export function FileManagement({ projectId }: FileManagementProps) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: folders, isLoading: foldersLoading } = useQuery<FolderType[]>({
    queryKey: [`/api/projects/${projectId}/folders`],
  });

  const { data: documents, isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: [`/api/projects/${projectId}/documents`, currentFolderId],
    queryFn: async () => {
      const url = `/api/projects/${projectId}/documents${currentFolderId ? `?folderId=${currentFolderId}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch documents");
      return res.json();
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest("POST", `/api/projects/${projectId}/folders`, {
        name,
        parentId: currentFolderId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/folders`] });
      setIsNewFolderDialogOpen(false);
      setNewFolderName("");
      toast({ title: "Folder created successfully" });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/documents`] });
      toast({ title: "Document deleted successfully" });
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      if (currentFolderId) {
        formData.append("folderId", currentFolderId);
      }

      const res = await fetch(`/api/projects/${projectId}/documents`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload file");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/documents`] });
      toast({ title: "Document uploaded successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Upload failed", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadDocumentMutation.mutate(file);
    }
  };

  const handleDownload = (doc: Document) => {
    window.open(`/api/documents/${doc.id}/download`, "_blank");
  };

  const currentFolders = folders?.filter(f => f.parentId === currentFolderId) || [];
  const filteredFolders = currentFolders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredDocuments = documents?.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-blue-500" />;
    if (type.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
    if (type.includes("javascript") || type.includes("typescript") || type.includes("json")) return <FileCode className="h-5 w-5 text-yellow-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const breadcrumbs: FolderType[] = [];
  let tempFolderId = currentFolderId;
  while (tempFolderId) {
    const folder = folders?.find(f => f.id === tempFolderId);
    if (folder) {
      breadcrumbs.unshift(folder);
      tempFolderId = folder.parentId;
    } else {
      break;
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground overflow-x-auto pb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 h-auto hover:bg-muted"
            onClick={() => setCurrentFolderId(null)}
          >
            All Files
          </Button>
          {breadcrumbs.map((b) => (
            <div key={b.id} className="flex items-center space-x-1 shrink-0">
              <ChevronRight className="h-4 w-4" />
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1 h-auto hover:bg-muted"
                onClick={() => setCurrentFolderId(b.id)}
              >
                {b.name}
              </Button>
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>Enter a name for the new folder.</DialogDescription>
              </DialogHeader>
              <Input 
                value={newFolderName} 
                onChange={(e) => setNewFolderName(e.target.value)} 
                placeholder="Folder Name"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newFolderName) {
                    createFolderMutation.mutate(newFolderName);
                  }
                }}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewFolderDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => createFolderMutation.mutate(newFolderName)} disabled={!newFolderName || createFolderMutation.isPending}>
                  {createFolderMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
          />
          <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadDocumentMutation.isPending}>
            <Upload className="mr-2 h-4 w-4" />
            {uploadDocumentMutation.isPending ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          className="pl-9" 
          placeholder="Search files and folders..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFolders.map((folder) => (
          <Card key={folder.id} className="cursor-pointer hover:border-primary/50 transition-colors group" onClick={() => setCurrentFolderId(folder.id)}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3 overflow-hidden">
                <Folder className="h-6 w-6 text-primary fill-primary/20 shrink-0" />
                <div className="overflow-hidden">
                  <p className="font-medium text-sm truncate">{folder.name}</p>
                  <p className="text-xs text-muted-foreground">Folder</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        ))}

        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="group hover:border-primary/50 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="shrink-0">{getFileIcon(doc.type)}</div>
                <div className="overflow-hidden">
                  <p className="font-medium text-sm truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDownload(doc)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => deleteDocumentMutation.mutate(doc.id)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        ))}

        {!foldersLoading && !documentsLoading && filteredFolders.length === 0 && filteredDocuments.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="h-6 w-6" />
            </div>
            <p>No files or folders found</p>
          </div>
        )}

        {(foldersLoading || documentsLoading) && (
          <div className="col-span-full py-12 text-center">
            <p>Loading files...</p>
          </div>
        )}
      </div>
    </div>
  );
}
