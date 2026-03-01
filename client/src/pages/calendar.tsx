import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X, Clock, MapPin, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { CalendarEvent } from "@shared/schema";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function CalendarPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  const { data: events = [] } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar/events"],
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/events"] });
      setIsCreateDialogOpen(false);
      toast({ title: "Event created successfully" });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/calendar/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/events"] });
      setSelectedEvent(null);
      toast({ title: "Event updated successfully" });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/calendar/events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/events"] });
      setSelectedEvent(null);
      toast({ title: "Event deleted successfully" });
    },
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleCreateEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const startDate = formData.get("startDate") as string;
    const startTime = formData.get("startTime") as string;
    const endDate = formData.get("endDate") as string;
    const endTime = formData.get("endTime") as string;

    createEventMutation.mutate({
      title: formData.get("title"),
      description: formData.get("description"),
      startTime: `${startDate}T${startTime}`,
      endTime: `${endDate}T${endTime}`,
      location: formData.get("location"),
      type: formData.get("type"),
      color: formData.get("color"),
    });
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const selectedOrToday = selectedDate ?? new Date();

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            <h1 className="text-2xl font-semibold">Calendar</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium min-w-[200px] text-center">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {/* Day Headers */}
          {DAYS.map(day => (
            <div key={day} className="bg-muted p-2 text-center text-sm font-medium">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {days.map((date, index) => {
            const dayEvents = getEventsForDate(date);
            return (
              <div
                key={index}
                className={`bg-card min-h-[120px] p-2 ${
                  date ? "cursor-pointer hover:bg-accent" : "bg-muted/50"
                } ${isToday(date) ? "ring-2 ring-primary" : ""}`}
                onClick={() => {
                  if (date) {
                    setSelectedDate(date);
                    setIsCreateDialogOpen(true);
                  }
                }}
              >
                {date && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${isToday(date) ? "text-primary" : ""}`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                          style={{ backgroundColor: event.color || "#3b82f6", color: "white" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                        >
                          {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" name="title" placeholder="Add title" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  defaultValue={formatDateForInput(selectedOrToday)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input id="startTime" name="startTime" type="time" defaultValue="09:00" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  defaultValue={formatDateForInput(selectedOrToday)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" name="endTime" type="time" defaultValue="10:00" required />
              </div>
            </div>

            <div>
              <Label htmlFor="type">Event Type</Label>
              <Select name="type" defaultValue="event">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="Add location" />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Add description" rows={3} />
            </div>

            <div>
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                {["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"].map(color => (
                  <label key={color} className="cursor-pointer">
                    <input
                      type="radio"
                      name="color"
                      value={color}
                      defaultChecked={color === "#3b82f6"}
                      className="sr-only peer"
                    />
                    <div
                      className="w-8 h-8 rounded-full peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-primary"
                      style={{ backgroundColor: color }}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{selectedEvent?.title}</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (selectedEvent) deleteEventMutation.mutate(selectedEvent.id);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">
                    {new Date(selectedEvent.startTime).toLocaleDateString([], { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(selectedEvent.startTime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })} - {new Date(selectedEvent.endTime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>

              {selectedEvent.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm">{selectedEvent.location}</div>
                </div>
              )}

              {selectedEvent.description && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm">{selectedEvent.description}</div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: selectedEvent.color || "#3b82f6" }}
                />
                <span className="text-sm capitalize">{selectedEvent.type}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
