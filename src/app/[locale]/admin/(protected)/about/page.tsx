"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminAboutPage() {
  const tEdit = useTranslations("admin.edit");
  const tNav = useTranslations("admin");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    toast.success(tEdit("successMsg"));
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-heading font-bold">{tNav("aboutSection")}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{tNav("aboutSection")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="About title" />
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea rows={8} placeholder="About content" />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "..." : tEdit("saveBtn")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
