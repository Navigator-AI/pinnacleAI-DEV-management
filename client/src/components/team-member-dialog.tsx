import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { TeamMember } from "@shared/schema";

interface TeamMemberDialogProps {
  member?: TeamMember;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function TeamMemberDialog({ member, onSuccess, trigger }: TeamMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    username: string;
    teamsUsername?: string;
    password?: string;
    role: TeamMember["role"];
    status: TeamMember["status"];
  }>({
    name: "",
    email: "",
    username: "",
    teamsUsername: "",
    password: "",
    role: "member",
    status: "online",
  });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        email: member.email,
        username: member.email.split('@')[0], // Fallback username
        teamsUsername: member.teamsUsername || "",
        password: "", // Don't show password
        role: member.role,
        status: member.status,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        username: "",
        teamsUsername: "",
        password: "",
        role: "member",
        status: "online",
      });
    }
  }, [member, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Submitting team member data:', formData);
      
      // Prepare payload with required fields
      const payload = {
        name: formData.name,
        email: formData.email,
        username: formData.username || formData.email.split('@')[0],
        teamsUsername: formData.teamsUsername || null,
        password: formData.password || "password", // Default password for new members
        role: formData.role,
        status: formData.status
      };
      
      console.log('Payload being sent:', { ...payload, password: '[HIDDEN]' });

      const url = member ? `/api/team/${member.id}` : '/api/team';
      const method = member ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log('Server response:', responseData);

      if (response.ok) {
        setOpen(false);
        toast({
          title: `Member ${member ? 'updated' : 'added'}`,
          description: `${formData.name} has been successfully ${member ? 'updated' : 'added to the team'}.`,
        });
        
        queryClient.invalidateQueries({ queryKey: ["/api/team"] });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        console.error('Server error:', responseData);
        toast({
          title: "Error",
          description: responseData.error || `Failed to ${member ? 'update' : 'add'} member`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error ${member ? 'updating' : 'adding'} member:`, error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button data-testid="button-add-member">
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{member ? 'Edit Team Member' : 'Add New Member'}</DialogTitle>
          <DialogDescription>
            {member ? 'Update member details and roles.' : 'Invite a new member to your team.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                required
              />
            </div>
            {!member && (
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="johndoe"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="teamsUsername">Microsoft Teams Username</Label>
              <Input
                id="teamsUsername"
                value={formData.teamsUsername}
                onChange={(e) => setFormData({ ...formData, teamsUsername: e.target.value })}
                placeholder="john.doe@company.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="away">Away</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{member ? 'Save Changes' : 'Add Member'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
