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
import { Label } from "@rallly/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rallly/ui/select";
import { toast } from "@rallly/ui/sonner";
import { UsersIcon } from "lucide-react";
import { useState } from "react";
import { updateUserGroupsAction } from "@/features/groups/actions";
import { useSafeAction } from "@/lib/safe-action/client";

interface GroupOption {
  id: string;
  name: string;
}

export function UserGroupSettings({
  availableGroups,
  initialPrimaryGroupId,
  initialGroupIds,
}: {
  availableGroups: GroupOption[];
  initialPrimaryGroupId: string | null;
  initialGroupIds: string[];
}) {
  const [primaryGroupId, setPrimaryGroupId] = useState<string>(
    initialPrimaryGroupId ?? "none",
  );
  const [selectedGroupIds, setSelectedGroupIds] =
    useState<string[]>(initialGroupIds);

  const updateUserGroups = useSafeAction(updateUserGroupsAction, {
    onSuccess: () => {
      toast.success("Subteams updated successfully");
    },
  });

  const handlePrimaryChange = (val: string | null) => {
    const nextVal = val ?? "none";
    setPrimaryGroupId(nextVal);
    if (nextVal !== "none" && !selectedGroupIds.includes(nextVal)) {
      setSelectedGroupIds([...selectedGroupIds, nextVal]);
    }
  };

  const toggleGroup = (groupId: string, checked: boolean) => {
    if (checked) {
      setSelectedGroupIds([...selectedGroupIds, groupId]);
    } else {
      setSelectedGroupIds(selectedGroupIds.filter((id) => id !== groupId));
      if (primaryGroupId === groupId) {
        setPrimaryGroupId("none");
      }
    }
  };

  const handleSave = () => {
    updateUserGroups.execute({
      primaryGroupId: primaryGroupId === "none" ? null : primaryGroupId,
      groupIds: selectedGroupIds,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UsersIcon className="size-4 text-primary" />
          <CardTitle className="text-base">
            Subteam & Group Membership
          </CardTitle>
        </div>
        <CardDescription>
          Designate your primary team/group (e.g. Mechanical, Software) and any
          other subteams you participate in. This categorizes you in schedule
          views.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {availableGroups.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            No groups or subteams created yet. Head to Space Settings &gt;
            Groups / Subteams to create them.
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label className="font-medium text-sm">Primary Group</Label>
              <Select
                value={primaryGroupId}
                onValueChange={handlePrimaryChange}
              >
                <SelectTrigger className="w-full sm:max-w-xs">
                  <SelectValue placeholder="Select primary group">
                    {(selected: string | null | undefined) => {
                      if (!selected || selected === "none") return "None";
                      return (
                        availableGroups.find((g) => g.id === selected)?.name ??
                        selected
                      );
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {availableGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="font-medium text-sm">
                All Subteams / Groups You Belong To
              </Label>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {availableGroups.map((group) => {
                  const isChecked = selectedGroupIds.includes(group.id);
                  const isPrimary = primaryGroupId === group.id;

                  return (
                    <div
                      key={group.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-card/60 p-2.5"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Checkbox
                          id={`group-${group.id}`}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            toggleGroup(group.id, Boolean(checked))
                          }
                        />
                        <label
                          htmlFor={`group-${group.id}`}
                          className="cursor-pointer font-medium text-sm leading-none"
                        >
                          {group.name}
                        </label>
                      </div>
                      {isPrimary ? (
                        <Badge
                          variant="secondary"
                          className="px-1.5 py-0 text-[10px]"
                        >
                          Primary
                        </Badge>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                variant="primary"
                loading={updateUserGroups.isExecuting}
                onClick={handleSave}
              >
                Save Subteam Preferences
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
