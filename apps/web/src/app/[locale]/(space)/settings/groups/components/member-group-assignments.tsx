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
import { Checkbox } from "@rallly/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@rallly/ui/dialog";
import { Input } from "@rallly/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rallly/ui/select";
import { toast } from "@rallly/ui/sonner";
import { Edit2Icon, SearchIcon, StarIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { OptimizedAvatarImage } from "@/components/optimized-avatar-image";
import { adminAssignUserGroupsAction } from "@/features/groups/actions";
import { useSafeAction } from "@/lib/safe-action/client";

interface GroupItem {
  id: string;
  name: string;
}

interface MemberItem {
  memberId: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    primaryGroupId: string | null;
    primaryGroup: { id: string; name: string } | null;
    groups: Array<{ id: string; name: string }>;
  };
}

export function MemberGroupAssignments({
  members,
  groups,
  spaceId,
  isAdmin,
}: {
  members: MemberItem[];
  groups: GroupItem[];
  spaceId: string;
  isAdmin: boolean;
}) {
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [editingMember, setEditingMember] = useState<MemberItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Dialog state
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [primaryGroupId, setPrimaryGroupId] = useState<string | null>(null);

  const adminAssign = useSafeAction(adminAssignUserGroupsAction);

  const filteredMembers = useMemo(() => {
    return members.filter(({ user }) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (filterGroup === "all") return true;
      if (filterGroup === "unassigned") {
        return user.groups.length === 0 && !user.primaryGroupId;
      }
      return (
        user.primaryGroupId === filterGroup ||
        user.groups.some((g) => g.id === filterGroup)
      );
    });
  }, [members, search, filterGroup]);

  const handleOpenDialog = (member: MemberItem) => {
    setEditingMember(member);
    setSelectedGroupIds(member.user.groups.map((g) => g.id));
    setPrimaryGroupId(member.user.primaryGroupId);
    setDialogOpen(true);
  };

  const handleSaveDialog = async () => {
    if (!editingMember) return;

    await adminAssign.executeAsync({
      targetUserId: editingMember.user.id,
      primaryGroupId: primaryGroupId || null,
      groupIds: selectedGroupIds,
      spaceId,
    });

    toast.success(`Updated groups for ${editingMember.user.name}`);
    setDialogOpen(false);
  };

  const handleQuickChangePrimary = async (
    targetUserId: string,
    userName: string,
    currentGroupIds: string[],
    newPrimaryId: string,
  ) => {
    const finalPrimaryId = newPrimaryId === "none" ? null : newPrimaryId;
    const finalGroupIds = new Set(currentGroupIds);
    if (finalPrimaryId) {
      finalGroupIds.add(finalPrimaryId);
    }

    await adminAssign.executeAsync({
      targetUserId,
      primaryGroupId: finalPrimaryId,
      groupIds: Array.from(finalGroupIds),
      spaceId,
    });

    toast.success(`Updated primary group for ${userName}`);
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">
              Member Subteam & Group Assignments
            </CardTitle>
            <CardDescription>
              Assign students and members to subteams and set their primary
              group.
            </CardDescription>
          </div>
          <Badge variant="default" className="w-fit font-normal text-xs">
            {members.length} {members.length === 1 ? "member" : "members"}
          </Badge>
        </div>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search members by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-sm"
            />
          </div>
          <Select
            value={filterGroup}
            onValueChange={(val) => setFilterGroup(val ?? "all")}
          >
            <SelectTrigger className="w-full text-xs sm:w-52">
              <SelectValue placeholder="All Members">
                {(val: string | null | undefined) => {
                  if (!val || val === "all") return "All Subteams";
                  if (val === "unassigned") return "Unassigned Members";
                  return groups.find((g) => g.id === val)?.name ?? val;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subteams</SelectItem>
              <SelectItem value="unassigned">Unassigned Members</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-border border-border border-t">
          {filteredMembers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No members found matching your search.
            </div>
          ) : (
            filteredMembers.map((item) => {
              const { user, role } = item;
              const currentGroupIds = user.groups.map((g) => g.id);

              return (
                <div
                  key={user.id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <OptimizedAvatarImage
                      name={user.name}
                      src={user.image ?? undefined}
                      size="md"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-semibold text-sm">
                          {user.name}
                        </span>
                        {role === "admin" ? (
                          <Badge
                            variant="secondary"
                            className="px-1 py-0 text-[10px]"
                          >
                            Admin
                          </Badge>
                        ) : null}
                      </div>
                      <div className="truncate text-muted-foreground text-xs">
                        {user.email}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        {user.groups.length > 0 ? (
                          user.groups.map((g) => (
                            <Badge
                              key={g.id}
                              variant={
                                g.id === user.primaryGroupId
                                  ? "default"
                                  : "outline"
                              }
                              className="px-1.5 py-0 text-[10px]"
                            >
                              {g.id === user.primaryGroupId ? (
                                <StarIcon className="mr-1 size-2.5 fill-current" />
                              ) : null}
                              {g.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            No subteams
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="hidden text-muted-foreground text-xs lg:inline">
                        Primary:
                      </span>
                      <Select
                        value={user.primaryGroupId ?? "none"}
                        onValueChange={(val) => {
                          if (isAdmin && val) {
                            handleQuickChangePrimary(
                              user.id,
                              user.name,
                              currentGroupIds,
                              val,
                            );
                          }
                        }}
                        disabled={!isAdmin || adminAssign.isExecuting}
                      >
                        <SelectTrigger className="h-8 w-36 text-xs">
                          <SelectValue placeholder="Primary Group">
                            {(val: string | null | undefined) => {
                              if (!val || val === "none") return "None";
                              return (
                                groups.find((g) => g.id === val)?.name ?? val
                              );
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {groups.map((g) => (
                            <SelectItem key={g.id} value={g.id}>
                              {g.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {isAdmin ? (
                      <Button
                        type="button"
                        variant="default"
                        size="xs"
                        className="h-8 gap-1 text-xs"
                        onClick={() => handleOpenDialog(item)}
                      >
                        <Edit2Icon className="size-3" />
                        <span>Assign</span>
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Subteams</DialogTitle>
            <DialogDescription>
              Select subteams for {editingMember?.user.name} and set their
              primary subteam.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div>
              <div className="mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                Subteams
              </div>
              {groups.length === 0 ? (
                <p className="text-muted-foreground text-xs italic">
                  No groups created yet. Create groups above first.
                </p>
              ) : (
                <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto p-1">
                  {groups.map((group) => {
                    const isChecked = selectedGroupIds.includes(group.id);
                    const checkboxId = `subteam-checkbox-${group.id}`;
                    return (
                      <label
                        htmlFor={checkboxId}
                        key={group.id}
                        className="flex cursor-pointer items-center gap-2 rounded-md border border-border p-2 font-medium text-xs hover:bg-muted/50"
                      >
                        <Checkbox
                          id={checkboxId}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedGroupIds((prev) => [
                                ...prev,
                                group.id,
                              ]);
                            } else {
                              setSelectedGroupIds((prev) =>
                                prev.filter((id) => id !== group.id),
                              );
                              if (primaryGroupId === group.id) {
                                setPrimaryGroupId(null);
                              }
                            }
                          }}
                        />
                        <span className="truncate">{group.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <div className="mb-1.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                Primary Subteam
              </div>
              <Select
                value={primaryGroupId ?? "none"}
                onValueChange={(val) => {
                  const nextId = val === "none" ? null : val;
                  setPrimaryGroupId(nextId);
                  if (nextId && !selectedGroupIds.includes(nextId)) {
                    setSelectedGroupIds((prev) => [...prev, nextId]);
                  }
                }}
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="None">
                    {(val: string | null | undefined) => {
                      if (!val || val === "none") return "None";
                      return groups.find((g) => g.id === val)?.name ?? val;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-[11px] text-muted-foreground">
                The primary subteam is highlighted on poll schedules and member
                lists.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="default"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={adminAssign.isExecuting}
              loading={adminAssign.isExecuting}
              onClick={handleSaveDialog}
            >
              Save Assignments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
