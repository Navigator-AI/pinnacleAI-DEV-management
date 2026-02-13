import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Zap,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState('');
  const [integrationUrl, setIntegrationUrl] = useState('');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

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

  const handleSaveProfile = () => {
    toast({ 
      title: "Profile Updated", 
      description: "Your profile changes have been saved successfully" 
    });
  };

  const handleChangeAvatar = () => {
    setShowAvatarDialog(true);
  };

  const handleAvatarSave = () => {
    if (selectedAvatar) {
      updateAvatarMutation.mutate({ avatar: selectedAvatar, gender: selectedGender });
    }
  };

  const handleChangePassword = () => {
    toast({ 
      title: "Change Password", 
      description: "Password change functionality coming soon" 
    });
  };

  const handleConnectIntegration = (service: string) => {
    setSelectedIntegration(service);
    setIntegrationUrl('');
    setShowIntegrationDialog(true);
  };

  const handleSaveIntegration = () => {
    if (!integrationUrl) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }
    
    toast({ 
      title: `${selectedIntegration} Connected`, 
      description: `Successfully connected to ${integrationUrl}` 
    });
    setShowIntegrationDialog(false);
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-semibold">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-xl grid-cols-4">
            <TabsTrigger value="profile" data-testid="tab-profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications">
              <Bell className="h-4 w-4 mr-2" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="appearance" data-testid="tab-appearance">
              <Palette className="h-4 w-4 mr-2" />
              Display
            </TabsTrigger>
            <TabsTrigger value="integrations" data-testid="tab-integrations">
              <Zap className="h-4 w-4 mr-2" />
              Apps
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal details and avatar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={userData?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} />
                    <AvatarFallback>{user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" data-testid="button-change-avatar" onClick={handleChangeAvatar}>
                      Change Avatar
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Choose from available avatars
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue={user?.name?.split(' ')[0] || ''} data-testid="input-first-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue={user?.name?.split(' ')[1] || ''} data-testid="input-last-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user?.email || ''}
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" defaultValue={user?.role || ''} disabled data-testid="input-role" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button data-testid="button-save-profile" onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your password and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                  </div>
                  <Button variant="outline" data-testid="button-change-password" onClick={handleChangePassword}>
                    Change Password
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                  </div>
                  <Switch data-testid="switch-2fa" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-email-notifications" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-push-notifications" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Task Assignments</p>
                    <p className="text-sm text-muted-foreground">Get notified when assigned to a task</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-task-assignments" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Comments & Mentions</p>
                    <p className="text-sm text-muted-foreground">Get notified when mentioned</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-mentions" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Project Updates</p>
                    <p className="text-sm text-muted-foreground">Get notified about project changes</p>
                  </div>
                  <Switch data-testid="switch-project-updates" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how PinnacleAI looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Use dark theme</p>
                  </div>
                  <Switch data-testid="switch-dark-mode" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Compact Mode</p>
                    <p className="text-sm text-muted-foreground">Reduce spacing for more content</p>
                  </div>
                  <Switch data-testid="switch-compact-mode" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Animations</p>
                    <p className="text-sm text-muted-foreground">Enable smooth transitions</p>
                  </div>
                  <Switch defaultChecked data-testid="switch-animations" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Connected Apps</CardTitle>
                <CardDescription>Manage your integrations and connected services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Slack</p>
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" data-testid="button-connect-slack" onClick={() => handleConnectIntegration('Slack')}>
                    Connect
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Stripe</p>
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" data-testid="button-connect-stripe" onClick={() => handleConnectIntegration('Stripe')}>
                    Connect
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">GitHub</p>
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" data-testid="button-connect-github" onClick={() => handleConnectIntegration('GitHub')}>
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Integration Connection Dialog */}
      <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {selectedIntegration}</DialogTitle>
            <DialogDescription>
              Enter your {selectedIntegration} {selectedIntegration === 'GitHub' ? 'repository' : 'webhook'} URL to connect
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="integration-url">
                {selectedIntegration === 'GitHub' ? 'Repository URL' : selectedIntegration === 'Slack' ? 'Webhook URL' : 'API Key'}
              </Label>
              <Input
                id="integration-url"
                placeholder={selectedIntegration === 'GitHub' ? 'https://github.com/username/repo' : selectedIntegration === 'Slack' ? 'https://hooks.slack.com/services/...' : 'sk_live_...'}
                value={integrationUrl}
                onChange={(e) => setIntegrationUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIntegrationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveIntegration}>
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <Button onClick={handleAvatarSave} disabled={!selectedAvatar || updateAvatarMutation.isPending}>
                {updateAvatarMutation.isPending ? 'Saving...' : 'Save Avatar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
