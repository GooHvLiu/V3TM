/**
 * Built-in roles · name and description
 * ------------------------------------------
 * Seed data stores role.<code>.name / .description identifiers for the
 * built-in roles. Roles created by an administrator keep plain strings,
 * so callers must check whether the value resolves here before rendering.
 */
export default {
  superAdmin: {
    name: "Super admin",
    description: "Template author role, holds every permission"
  },
  admin: {
    name: "Administrator",
    description: "Maintains system parameters, users and business data"
  },
  operator: {
    name: "Operator",
    description: "Handles daily business data, cannot change system configuration"
  },
  viewer: {
    name: "Viewer",
    description: "Read-only access, no write operations"
  }
};
