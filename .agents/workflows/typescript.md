# TypeScript Workflow

Apply these rules whenever a prompt asks you to create, edit, review, or refactor TypeScript in this
repository. They are the default TypeScript conventions across tasks, not just a one-time checklist.
Follow the repository's local `.Agents` guidance and applicable skills as well.

## Type modeling

- Represent a fixed set of string or numeric choices with an `as const` array, then derive the union
  from the array, for example:

  ```ts
  export const vehicleStatuses = ['active', 'inactive'] as const;
  export type VehicleStatus = (typeof vehicleStatuses)[number];
  ```

- Prefer this array-derived union over TypeScript `enum` declarations and manually written unions
  for finite choice sets. Keep ordinary unions when they model distinct structural variants,
  nullable values, or other concepts that are not simply a list of choices.
- Use `interface` for record-shaped object contracts, including domain objects, input/output shapes,
  and DTOs, wherever it fits. Use `type` for unions, intersections, aliases, mapped/conditional
  types, and types derived from schemas or other existing types.
- Never use the `any` type, including `any[]` or `as any`. For values with unknown shape, use
  `unknown` and validate or narrow it before use. Use a precise generic where the type is known
  parametrically.
- Prefer `satisfies` to `as` when checking that an expression conforms to a type while retaining its
  inferred literal type. Do not use assertions to silence errors or bypass validation. If an
  assertion is truly unavoidable at an interop boundary, keep it narrow, explain why it is sound,
  and validate untrusted runtime data first.

## Zod schemas and inferred types

- For inputs validated by Zod, define the schema as the source of truth and derive the corresponding
  type with `z.infer<typeof schema>` (or `z.input` / `z.output` when input and parsed output
  differ).
- Name the schema and inferred type clearly, and reuse the inferred type in function inputs, DTOs,
  and service boundaries instead of duplicating the same shape by hand.
- Use a separately declared interface only when it adds a genuinely distinct contract or is required
  by an integration; keep it aligned with the schema without creating competing definitions.
- Parse and validate untrusted values at system boundaries. A TypeScript annotation alone does not
  validate runtime data.

## Implementation checklist

- Check existing types, schemas, and nearby patterns before introducing a new declaration.
- Keep types as precise as practical without adding needless complexity or unsafe casts.
- Ensure finite-choice arrays are the source of their derived unions, and schemas are the source of
  types for validated inputs.
- Update affected callers and documentation when a shared contract changes.
