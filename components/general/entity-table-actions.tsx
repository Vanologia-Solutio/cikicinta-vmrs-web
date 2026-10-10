import { ComponentType } from "react";

type EntityTableActionsProps<T> = {
  entity: T;
  actions: Record<string, ComponentType<{ entity: T }>>;
};

export function EntityTableActions<T>({
  actions,
  entity,
}: EntityTableActionsProps<T>) {
  return (
    <div className="flex items-center gap-1">
      {Object.entries(actions).map(([key, Component]) => (
        <Component key={key} entity={entity} />
      ))}
    </div>
  );
}
