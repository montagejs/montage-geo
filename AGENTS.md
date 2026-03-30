# montage-geo Agent Notes

This repo is part of the DisasterAWARE workspace. Read the shared guide first:

- `/Users/johnny/Projects/contour-framework/AGENTS.md`

Use this repo for reusable geospatial primitives, models, converters, services, and lower-level map support.

## Local Ownership

- `logic/model/`
  Core geospatial model objects.
- `logic/converter/`
  Format and geometry conversion utilities.
- `logic/service/`
  Shared geospatial services.
- `data/`
  Descriptors and mappings for data-layer concerns.
- `ui/`
  Lower-level geospatial map components and examples.
- `test/`
  Jasmine and Karma validation.

## Local Rules

- Prefer framework-agnostic geospatial abstractions.
- Avoid app-specific DisasterAWARE behavior here unless the user explicitly wants to couple it.
- Preserve compatibility with current MontageJS consumers unless the task is a deliberate migration step.

## Validation

- Available commands include `npm test`, `npm run test:karma`, `npm run test:karma-dev`, and `npm run test:jasmine`.
