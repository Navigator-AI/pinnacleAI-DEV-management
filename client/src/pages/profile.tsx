import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function ProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  
  // Fetch full user data
  const { data: userData } = useQuery({
    queryKey: [`/api/users/${user.id}`],
    enabled: Boolean(user?.id),
  });

  const maleAvatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=John&gender=male',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike&gender=male',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=David&gender=male',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=James&gender=male',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert&gender=male',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=William&gender=male',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Richard&gender=male',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas&gender=male',
  ];
  
  const femaleAvatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&gender=female',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia&gender=female',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia&gender=female',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella&gender=female',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&gender=female',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlotte&gender=female',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Amelia&gender=female',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Harper&gender=female',
  ];
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    role: user.role || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const updateAvatarMutation = useMutation({
    mutationFn: async (data: { avatar: string; gender: string }) => {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update avatar');
      return response.json();
    },
    onSuccess: (updatedUser) => {
      const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
      const newUser = { ...currentUser, avatar: updatedUser.avatar };
      sessionStorage.setItem('user', JSON.stringify(newUser));
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/team'] });
      setShowAvatarDialog(false);
      toast({
        title: "Avatar Updated",
        description: "Your avatar has been updated successfully.",
      });
      // Refresh page to show new avatar
      setTimeout(() => window.location.reload(), 500);
    },
  });

  const handleAvatarChange = () => {
    if (selectedAvatar) {
      updateAvatarMutation.mutate({ avatar: selectedAvatar, gender: selectedGender });
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: (updatedUser) => {
      // Update sessionStorage with new user data
      const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
      const newUser = { ...currentUser, ...updatedUser };
      sessionStorage.setItem('user', JSON.stringify(newUser));
      
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await fetch(`/api/users/${user.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to change password');
      return response.json();
    },
    onSuccess: () => {
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to change password. Please check your current password.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate({
      name: formData.name,
      email: formData.email,
    });
  };

  const handlePasswordChange = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.currentPassword || !formData.newPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold">Profile</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <div className="p-6 max-w-4xl">
        <div className="grid gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={userData?.avatar || user.avatar} />
                  <AvatarFallback className="text-lg">
                    {user.name?.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm" onClick={() => setShowAvatarDialog(true)}>
                    Change Avatar
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose from available avatars
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your password and security settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handlePasswordChange} variant="outline" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
              </Button>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add extra security to your account
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Avatar Selection Dialog */}
      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose Your Avatar</DialogTitle>
            <DialogDescription>
              Select a gender and choose an avatar that represents you
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <RadioGroup value={selectedGender} onValueChange={(v) => setSelectedGender(v as 'male' | 'female')}>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
              </div>
            </RadioGroup>
            <div className="grid grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {(selectedGender === 'male' ? maleAvatars : femaleAvatars).map((avatar, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    selectedAvatar === avatar
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Avatar className="h-16 w-16 mx-auto">
                    <AvatarImage src={avatar} />
                  </Avatar>
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAvatarDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAvatarChange} disabled={!selectedAvatar || updateAvatarMutation.isPending}>
                {updateAvatarMutation.isPending ? 'Saving...' : 'Save Avatar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}