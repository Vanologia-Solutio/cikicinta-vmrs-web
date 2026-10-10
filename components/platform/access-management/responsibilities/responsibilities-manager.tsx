"use client";

import { TreeBranchLines } from "@/components/general/tree-branch-lines";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { masterDataQueries } from "@/hooks/use-master-data";
import { menuQueries } from "@/hooks/use-menu";
import { responsibilityQueries } from "@/hooks/use-responsibility";
import { errorMessage, notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { UpdateResponsibilitiesPayload } from "@/services/responsibility-service";
import { useAuthStore } from "@/shared/stores/auth-store";
import { Menu } from "@/shared/types/menu";
import {
  CaretRightIcon,
  FloppyDiskIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";
import { Fragment, useMemo, useState } from "react";

interface MenuTreeNode extends Menu {
  children: MenuTreeNode[];
}

interface ModuleGroup {
  moduleName: string;
  roots: MenuTreeNode[];
  ids: string[];
}

type SelectionState = boolean | "indeterminate";

function collectIds(nodes: MenuTreeNode[], out: string[] = []): string[] {
  for (const node of nodes) {
    out.push(node.id);
    collectIds(node.children, out);
  }
  return out;
}

function collectParentIds(
  nodes: MenuTreeNode[],
  out: Set<string> = new Set(),
): Set<string> {
  for (const node of nodes) {
    if (node.children.length > 0) {
      out.add(node.id);
      collectParentIds(node.children, out);
    }
  }
  return out;
}

function buildModuleGroups(menus: Menu[]): ModuleGroup[] {
  const byId = new Map<string, MenuTreeNode>(
    menus.map((menu) => [menu.id, { ...menu, children: [] }]),
  );
  const rootsByModule = new Map<string, MenuTreeNode[]>();

  byId.forEach((node) => {
    const parentNode = node.parent?.id ? byId.get(node.parent.id) : undefined;
    if (parentNode) {
      parentNode.children.push(node);
      return;
    }
    const roots = rootsByModule.get(node.module.name) ?? [];
    roots.push(node);
    rootsByModule.set(node.module.name, roots);
  });

  return Array.from(rootsByModule.entries())
    .map(([moduleName, roots]) => ({
      moduleName,
      roots,
      ids: collectIds(roots),
      sequence: Number(roots[0]?.module.sequence ?? 0),
    }))
    .sort((a, b) => a.sequence - b.sequence)
    .map(({ moduleName, roots, ids }) => ({ moduleName, roots, ids }));
}

function getSelectionState(
  ids: string[],
  selected: Set<string>,
): SelectionState {
  const selectedCount = ids.filter((id) => selected.has(id)).length;

  if (selectedCount === 0) return false;
  if (selectedCount === ids.length) return true;
  return "indeterminate";
}

/** Checkbox that renders the three-way state of a group of menus. */
function TriStateCheckbox({
  id,
  state,
  onToggle,
}: {
  id: string;
  state: SelectionState;
  onToggle: (checked: boolean) => void;
}) {
  return (
    <Checkbox
      id={id}
      checked={state === true}
      indeterminate={state === "indeterminate"}
      onCheckedChange={(checked) => onToggle(checked === true)}
    />
  );
}

function MenuTreeRow({
  node,
  depth,
  isLast,
  ancestorLines,
  expandedIds,
  selectedMenus,
  onToggleExpand,
  onNodeToggle,
}: {
  node: MenuTreeNode;
  depth: number;
  isLast: boolean;
  ancestorLines: boolean[];
  expandedIds: Set<string>;
  selectedMenus: Set<string>;
  onToggleExpand: (id: string) => void;
  onNodeToggle: (node: MenuTreeNode, checked: boolean) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const state = getSelectionState(collectIds([node]), selectedMenus);

  return (
    <Fragment>
      <div className="flex items-stretch gap-2 rounded-md py-1 pr-1 text-sm hover:bg-muted/60">
        {depth > 0 && (
          <TreeBranchLines ancestorLines={ancestorLines} isLast={isLast} />
        )}

        <div className="flex min-w-0 flex-1 items-center gap-2 pl-1">
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon-sm"
              type="button"
              onClick={() => onToggleExpand(node.id)}
              className="shrink-0"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <CaretRightIcon
                className={cn(
                  "transition-transform duration-300",
                  isExpanded && "rotate-90",
                )}
              />
            </Button>
          ) : (
            <span className="inline-block size-6 shrink-0" />
          )}

          <TriStateCheckbox
            id={`menu-${node.id}`}
            state={state}
            onToggle={(checked) => onNodeToggle(node, checked)}
          />
          <Label
            htmlFor={`menu-${node.id}`}
            className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1"
          >
            <span className="truncate font-medium">{node.title}</span>
            <span className="truncate text-xs text-muted-foreground">
              {node.path}
            </span>
            {!node.isActive && <Badge variant="destructive">Inactive</Badge>}
            {!node.isVisible && <Badge variant="outline">Hidden</Badge>}
          </Label>
        </div>
      </div>
      {hasChildren && isExpanded
        ? node.children.map((child, index) => (
            <MenuTreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              isLast={index === node.children.length - 1}
              ancestorLines={depth > 0 ? [...ancestorLines, !isLast] : []}
              expandedIds={expandedIds}
              selectedMenus={selectedMenus}
              onToggleExpand={onToggleExpand}
              onNodeToggle={onNodeToggle}
            />
          ))
        : null}
    </Fragment>
  );
}

export function ResponsibilitiesManager() {
  const [tenantId, setTenantId] = useState<string>("");
  const [roleId, setRoleId] = useState<string>("");
  const [selectedMenus, setSelectedMenus] = useState<Set<string>>(new Set());

  const currentUser = useAuthStore((s) => s.user);
  const refreshSession = useAuthStore((s) => s.refresh);

  const { data: tenants, isLoading: isTenantsLoading } =
    masterDataQueries.useActiveTenants();
  const { data: roles, isLoading: isRolesLoading } =
    masterDataQueries.useActiveRoles();

  const { data: allMenusData, isLoading: isMenusLoading } = menuQueries.useList(
    { pageIndex: 0, pageSize: 1000 },
  );

  const {
    data: currentResponsibilities,
    isLoading: isResponsibilitiesLoading,
  } = responsibilityQueries.useGet(tenantId, roleId, {
    enabled: !!tenantId && !!roleId,
  });

  const { mutateAsync: updateResponsibilities, isPending: isUpdating } =
    responsibilityQueries.useUpdate();

  // Reset the checked set whenever a new assignment is loaded.
  const [prevResponsibilities, setPrevResponsibilities] = useState(
    currentResponsibilities,
  );

  if (currentResponsibilities !== prevResponsibilities) {
    setPrevResponsibilities(currentResponsibilities);
    if (currentResponsibilities?.success) {
      setSelectedMenus(new Set(currentResponsibilities.data.menuIds));
    } else if (currentResponsibilities && !currentResponsibilities.success) {
      setSelectedMenus(new Set());
    }
  }

  const tenantItems = useMemo(
    () =>
      (tenants?.data ?? []).map((tenant) => ({
        value: tenant.id,
        label: tenant.name,
      })),
    [tenants],
  );
  const roleItems = useMemo(
    () =>
      (roles?.data ?? []).map((role) => ({ value: role.id, label: role.name })),
    [roles],
  );

  const allMenus = useMemo(() => allMenusData?.data ?? [], [allMenusData]);

  const moduleGroups = useMemo(() => buildModuleGroups(allMenus), [allMenus]);

  const allMenuIds = useMemo(() => allMenus.map((menu) => menu.id), [allMenus]);

  const [manualExpandedIds, setManualExpandedIds] =
    useState<Set<string> | null>(null);

  // Until the user toggles anything, every parent is open.
  const defaultExpandedIds = useMemo(
    () =>
      new Set(
        moduleGroups.flatMap((group) => [...collectParentIds(group.roots)]),
      ),
    [moduleGroups],
  );
  const expandedIds = manualExpandedIds ?? defaultExpandedIds;

  const handleToggleExpand = (id: string) => {
    setManualExpandedIds((prev) => {
      const next = new Set(prev ?? defaultExpandedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const setIdsSelected = (ids: string[], checked: boolean) => {
    setSelectedMenus((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (checked) {
          next.add(id);
        } else {
          next.delete(id);
        }
      }
      return next;
    });
  };

  const handleNodeToggle = (node: MenuTreeNode, checked: boolean) => {
    setIdsSelected(collectIds([node]), checked);
  };

  const handleAssignAllToggle = (checked: boolean) => {
    setSelectedMenus(checked ? new Set(allMenuIds) : new Set());
  };

  const assignAllState: SelectionState =
    allMenuIds.length === 0
      ? false
      : getSelectionState(allMenuIds, selectedMenus);

  const handleSave = async () => {
    if (!tenantId || !roleId) {
      notify.error("Please select a tenant and a role.");
      return;
    }

    try {
      const payload: UpdateResponsibilitiesPayload = {
        tenantId,
        roleId,
        menuIds: Array.from(selectedMenus),
      };
      const res = await updateResponsibilities(payload);
      if (res.success) {
        notify.success("Responsibilities updated successfully", {
          description: `${res.data.count} menus assigned`,
        });

        // Saving the signed-in user's own tenant + role changes their sidebar.
        const affectsCurrentUser =
          currentUser?.attrs.tenant.id === tenantId &&
          currentUser?.attrs.role.id === roleId;
        if (affectsCurrentUser) await refreshSession().catch(() => {});
      }
    } catch (error) {
      notify.error("Failed to update responsibilities", {
        description: errorMessage(error),
      });
    }
  };

  const isLoading =
    isUpdating ||
    isTenantsLoading ||
    isRolesLoading ||
    isMenusLoading ||
    isResponsibilitiesLoading;

  return (
    <section id="responsibilities-manager" className="space-y-6">
      <FieldGroup className="max-w-sm">
        <Field>
          <FieldLabel htmlFor="responsibility-tenant">Tenant</FieldLabel>
          <Select
            items={tenantItems}
            value={tenantId || null}
            onValueChange={(value) => setTenantId(value ?? "")}
            disabled={isTenantsLoading}
          >
            <SelectTrigger id="responsibility-tenant" className="w-full">
              <SelectValue placeholder="Select tenant" />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {tenantItems.map((tenant) => (
                <SelectItem key={tenant.value} value={tenant.value}>
                  {tenant.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="responsibility-role">Role</FieldLabel>
          <Select
            items={roleItems}
            value={roleId || null}
            onValueChange={(value) => setRoleId(value ?? "")}
            disabled={isRolesLoading}
          >
            <SelectTrigger id="responsibility-role" className="w-full">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {roleItems.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <Button
            onClick={handleSave}
            disabled={!tenantId || !roleId || isLoading}
            className="w-full md:w-auto"
          >
            {isUpdating ? (
              <SpinnerGapIcon className="animate-spin" />
            ) : (
              <FloppyDiskIcon />
            )}
            Save Changes
          </Button>
        </Field>
      </FieldGroup>

      <div className="rounded-lg border p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 p-8">
            <SpinnerGapIcon className="size-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : !tenantId || !roleId ? (
          <div className="p-8 text-center text-muted-foreground">
            Please select a tenant and a role to view and assign menus.
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4">
              <div className="flex items-center gap-2">
                <TriStateCheckbox
                  id="assign-all-menus"
                  state={assignAllState}
                  onToggle={handleAssignAllToggle}
                />
                <Label
                  htmlFor="assign-all-menus"
                  className="text-base font-semibold"
                >
                  Assign All Menus
                </Label>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setManualExpandedIds(defaultExpandedIds)}
                >
                  Expand all
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setManualExpandedIds(new Set())}
                >
                  Collapse all
                </Button>
              </div>
            </div>
            <div className="columns-1 gap-8 md:columns-2">
              {moduleGroups.map(({ moduleName, roots, ids }) => (
                <div
                  key={moduleName}
                  className="mb-8 h-fit break-inside-avoid space-y-2"
                >
                  <div className="flex items-center gap-2 border-b pb-2">
                    <TriStateCheckbox
                      id={`module-${moduleName}`}
                      state={getSelectionState(ids, selectedMenus)}
                      onToggle={(checked) => setIdsSelected(ids, checked)}
                    />
                    <Label
                      htmlFor={`module-${moduleName}`}
                      className="text-base font-semibold"
                    >
                      {moduleName}
                    </Label>
                  </div>
                  <div>
                    {roots.map((root, index) => (
                      <MenuTreeRow
                        key={root.id}
                        node={root}
                        depth={0}
                        isLast={index === roots.length - 1}
                        ancestorLines={[]}
                        expandedIds={expandedIds}
                        selectedMenus={selectedMenus}
                        onToggleExpand={handleToggleExpand}
                        onNodeToggle={handleNodeToggle}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
