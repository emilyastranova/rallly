import { describe, expect, it } from "vitest";

describe("User Groups / Subteams", () => {
  it("allows a user to have a primary group and multiple secondary groups", () => {
    const user = {
      id: "student-1",
      name: "Alex",
      primaryGroupId: "grp-build",
      primaryGroup: { id: "grp-build", name: "Mechanical / Build" },
      groups: [
        { id: "grp-build", name: "Mechanical / Build" },
        { id: "grp-drive", name: "Drive Team" },
        { id: "grp-scout", name: "Scouting" },
      ],
    };

    expect(user.primaryGroup.name).toBe("Mechanical / Build");
    expect(user.groups).toHaveLength(3);
    expect(user.groups.map((g) => g.id)).toContain(user.primaryGroupId);
    expect(user.groups.map((g) => g.name)).toContain("Drive Team");
  });

  it("organizes participants into sections by group with separators", () => {
    const participants = [
      {
        id: "p-1",
        name: "Alice",
        group: { id: "grp-software", name: "Software" },
        userGroups: [{ id: "grp-software", name: "Software" }],
      },
      {
        id: "p-2",
        name: "Bob",
        group: { id: "grp-build", name: "Mechanical" },
        userGroups: [{ id: "grp-build", name: "Mechanical" }],
      },
      {
        id: "p-3",
        name: "Charlie",
        group: { id: "grp-software", name: "Software" },
        userGroups: [
          { id: "grp-software", name: "Software" },
          { id: "grp-drive", name: "Drive Team" },
        ],
      },
      {
        id: "p-4",
        name: "Dave (Mentor)",
        group: null,
        userGroups: [],
      },
    ];

    // Grouping logic matching desktop-poll.tsx
    const groupMap = new Map<string, typeof participants>();
    const ungrouped: typeof participants = [];

    for (const p of participants) {
      const gName = p.group?.name;
      if (gName) {
        if (!groupMap.has(gName)) {
          groupMap.set(gName, []);
        }
        groupMap.get(gName)?.push(p);
      } else {
        ungrouped.push(p);
      }
    }

    const sections = Array.from(groupMap.entries()).map(([name, list]) => ({
      groupName: name,
      participants: list,
    }));

    if (ungrouped.length > 0) {
      sections.push({
        groupName: "General / Other",
        participants: ungrouped,
      });
    }

    expect(sections).toHaveLength(3);
    expect(
      sections.find((s) => s.groupName === "Software")?.participants,
    ).toHaveLength(2);
    expect(
      sections.find((s) => s.groupName === "Mechanical")?.participants,
    ).toHaveLength(1);
    expect(
      sections.find((s) => s.groupName === "General / Other")?.participants,
    ).toHaveLength(1);
  });

  it("filters participants when a specific group is selected in the dropdown", () => {
    const participants = [
      {
        id: "p-1",
        name: "Alice",
        group: { id: "grp-software", name: "Software" },
        userGroups: [{ id: "grp-software", name: "Software" }],
      },
      {
        id: "p-2",
        name: "Bob",
        group: { id: "grp-build", name: "Mechanical" },
        userGroups: [{ id: "grp-build", name: "Mechanical" }],
      },
      {
        id: "p-3",
        name: "Charlie",
        group: { id: "grp-software", name: "Software" },
        userGroups: [
          { id: "grp-software", name: "Software" },
          { id: "grp-drive", name: "Drive Team" },
        ],
      },
    ];

    const filterByGroup = (groupId: string) => {
      if (groupId === "all") return participants;
      return participants.filter((p) => {
        if (p.group?.id === groupId) return true;
        if (p.userGroups?.some((ug) => ug.id === groupId)) return true;
        return false;
      });
    };

    expect(filterByGroup("all")).toHaveLength(3);
    expect(filterByGroup("grp-software")).toHaveLength(2);
    expect(filterByGroup("grp-build")).toHaveLength(1);
    expect(filterByGroup("grp-drive")).toHaveLength(1); // Charlie is in Drive Team as secondary group!
  });
});

describe("Custom Named Slots (Morning, Afternoon, Evening)", () => {
  it("preserves custom titles for arbitrary time slots", () => {
    const morningSlot = {
      type: "timeSlot",
      title: "Morning (Build Session)",
      start: "2026-10-10T09:00:00",
      end: "2026-10-10T12:00:00",
    };

    const afternoonSlot = {
      type: "timeSlot",
      title: "Afternoon (Drive Practice)",
      start: "2026-10-10T13:00:00",
      end: "2026-10-10T17:00:00",
    };

    const eveningSlot = {
      type: "timeSlot",
      title: "Evening (Code Review)",
      start: "2026-10-10T18:00:00",
      end: "2026-10-10T21:00:00",
    };

    const slots = [morningSlot, afternoonSlot, eveningSlot];

    expect(slots.map((s) => s.title)).toEqual([
      "Morning (Build Session)",
      "Afternoon (Drive Practice)",
      "Evening (Code Review)",
    ]);

    // Check duration calculation (in minutes)
    const morningDuration =
      (new Date(morningSlot.end).getTime() -
        new Date(morningSlot.start).getTime()) /
      60000;
    expect(morningDuration).toBe(180); // 3 hours

    const afternoonDuration =
      (new Date(afternoonSlot.end).getTime() -
        new Date(afternoonSlot.start).getTime()) /
      60000;
    expect(afternoonDuration).toBe(240); // 4 hours
  });
});
