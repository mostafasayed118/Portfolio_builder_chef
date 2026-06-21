"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Id } from "@convex/_generated/dataModel";

const CATEGORIES = ["cakes", "pastries", "cookies", "seasonal"] as const;

function SortableRow({
  item,
  onEdit,
  onDelete,
  onToggle,
}: {
  item: any;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className="bg-surface">
      <TableCell className="w-10">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell className="font-medium text-foreground">{item.name_en}</TableCell>
      <TableCell>
        <Badge variant="outline" className="border-accent/20 text-accent/80">
          {item.category}
        </Badge>
      </TableCell>
      <TableCell className="text-accent font-medium">${item.price.toFixed(2)}</TableCell>
      <TableCell>
        <Switch checked={item.isAvailable} onCheckedChange={onToggle} />
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-error hover:text-error">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function AdminMenuPage() {
  const menuItems = useQuery(api.queries.getAllMenuItems);
  const createItem = useMutation(api.mutations.createMenuItem);
  const updateItem = useMutation(api.mutations.updateMenuItem);
  const deleteItem = useMutation(api.mutations.deleteMenuItem);
  const toggleItem = useMutation(api.mutations.toggleMenuItemAvailability);
  const reorderItems = useMutation(api.mutations.reorderMenuItems);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descAr, setDescAr] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<string>("cakes");
  const [available, setAvailable] = useState(true);
  const [saving, setSaving] = useState(false);

  const [filter, setFilter] = useState<string>("all");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function resetForm() {
    setNameEn("");
    setNameAr("");
    setDescEn("");
    setDescAr("");
    setPrice("");
    setCategory("cakes");
    setAvailable(true);
    setEditingId(null);
  }

  function openEdit(item: any) {
    setNameEn(item.name_en);
    setNameAr(item.name_ar);
    setDescEn(item.description_en);
    setDescAr(item.description_ar);
    setPrice(String(item.price));
    setCategory(item.category);
    setAvailable(item.isAvailable);
    setEditingId(item._id);
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const data = {
        name_en: nameEn,
        name_ar: nameAr,
        description_en: descEn,
        description_ar: descAr,
        price: parseFloat(price),
        category: category as any,
        imageUrl: null,
        isAvailable: available,
        order: editingId ? 0 : (menuItems?.length ?? 0),
      };

      if (editingId) {
        await updateItem({ id: editingId as Id<"menuItems">, ...data });
      } else {
        await createItem(data);
      }

      toast.success(editingId ? "Menu item updated" : "Menu item added");
      setDialogOpen(false);
      resetForm();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteItem({ id: id as Id<"menuItems"> });
      toast.success("Menu item deleted");
    } catch {
      toast.error("Failed to delete");
    }
    setDeleteDialog(null);
  }

  async function handleToggle(id: string) {
    try {
      await toggleItem({ id: id as Id<"menuItems"> });
    } catch {
      toast.error("Failed to update");
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const items = menuItems ?? [];
    const oldIndex = items.findIndex((i) => i._id === active.id);
    const newIndex = items.findIndex((i) => i._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...items];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    await reorderItems({ orderedIds: reordered.map((i) => i._id) });
  }

  const filtered = menuItems
    ? filter === "all"
      ? menuItems
      : menuItems.filter((i) => i.category === filter)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-heading font-bold text-foreground">Menu Items</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <Button className="bg-accent hover:bg-accent-hover text-background" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 me-2" />
            Add Item
          </Button>
          <DialogContent className="bg-surface border-border/50 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-foreground font-heading">
                {editingId ? "Edit Item" : "New Menu Item"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-foreground">Name - English</Label>
                  <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="bg-surface-elevated border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">الاسم - العربية</Label>
                  <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" className="bg-surface-elevated border-border/50 text-right" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-foreground">Description - English</Label>
                  <Textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={2} className="bg-surface-elevated border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">الوصف - العربية</Label>
                  <Textarea value={descAr} onChange={(e) => setDescAr(e.target.value)} rows={2} dir="rtl" className="bg-surface-elevated border-border/50 text-right" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-foreground">Price ($)</Label>
                  <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="bg-surface-elevated border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Category</Label>
                  <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                    <SelectTrigger className="bg-surface-elevated border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-border/50">
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat} className="text-foreground capitalize">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 flex items-end pb-2">
                  <div className="flex items-center gap-3">
                    <Switch checked={available} onCheckedChange={setAvailable} />
                    <Label className="text-foreground text-sm">Available</Label>
                  </div>
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full bg-accent hover:bg-accent-hover text-background">
                {saving ? "Saving..." : editingId ? "Update Item" : "Add Item"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === cat
                ? "bg-accent text-background"
                : "bg-surface-elevated text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat === "all" ? "All" : cat}
          </button>
        ))}
      </div>

      <Card className="bg-surface border-border/50">
        <CardContent className="p-0">
          {!menuItems ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filtered.map((i) => i._id)} strategy={verticalListSortingStrategy}>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="w-10" />
                      <TableHead className="text-foreground">Name</TableHead>
                      <TableHead className="text-foreground">Category</TableHead>
                      <TableHead className="text-foreground">Price</TableHead>
                      <TableHead className="text-foreground">Available</TableHead>
                      <TableHead className="w-[100px] text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((item) => (
                      <SortableRow
                        key={item._id}
                        item={item}
                        onEdit={() => openEdit(item)}
                        onDelete={() => setDeleteDialog(item._id)}
                        onToggle={() => handleToggle(item._id)}
                      />
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No items yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent className="bg-surface border-border/50 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground font-heading">Delete item?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This cannot be undone.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteDialog!)}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
