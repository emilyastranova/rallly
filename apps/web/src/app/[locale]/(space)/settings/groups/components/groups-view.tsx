"use client";

import { Badge } from "@rallly/ui/badge";
import { Button } from "@rallly/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@rallly/ui/card";
import { Input } from "@rallly/ui/input";
import { PlusIcon, Trash2Icon, UsersIcon } from "lucide-react";
import { useState } from "react";
import {
  createGroupAction,
  deleteGroupAction,
} from "@/features/groups/actions";
import { useSafeAction } from "@/lib/safe-action/client";

interface GroupItem {
  id: string;
  name: string;
  description: string | null;
  _count: {
    members: number;
    primaryUsers: number;
  };
}

export function GroupsView({
  initialGroups,
  spaceId,
}: {
  initialGroups: GroupItem[];
  spaceId?: string;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createGroup = useSafeAction(createGroupAction);
  const deleteGroup = useSafeAction(deleteGroupAction);

  const handleCreate = () => {
    if (!name.trim()) return;
    createGroup.execute({
      name: name.trim(),
      description: description.trim() || undefined,
      spaceId,
    });
    setName("");
    setDescription("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create Group / Subteam</CardTitle>
          <CardDescription>
            Add subteams for your students or team members (e.g. Mechanical,
            Software, Electrical, Business, Drive Team).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Group name (e.g. Software, Mechanical)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="sm:max-w-xs"
            />
            <Input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="sm:max-w-sm"
            />
            <Button
              type="button"
              variant="primary"
              disabled={!name.trim() || createGroup.isExecuting}
              loading={createGroup.isExecuting}
              onClick={handleCreate}
            >
              <PlusIcon data-icon="inline-start" />
              Add Group
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {initialGroups.map((group) => (
          <Card
            key={group.id}
            className="relative flex flex-col justify-between"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UsersIcon className="size-4 text-primary" />
                  <CardTitle className="font-semibold text-sm">
                    {group.name}
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {group._count.members}{" "}
                  {group._count.members === 1 ? "member" : "members"}
                </Badge>
              </div>
              {group.description ? (
                <CardDescription className="pt-1 text-xs">
                  {group.description}
                </CardDescription>
              ) : null}
            </CardHeader>
            <CardContent className="flex items-center justify-between pt-0">
              <span className="text-[11px] text-muted-foreground">
                {group._count.primaryUsers} primary
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Delete group"
                className="text-destructive hover:text-destructive"
                disabled={deleteGroup.isExecuting}
                onClick={() => {
                  deleteGroup.execute({ groupId: group.id });
                }}
              >
                <Trash2Icon className="size-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
