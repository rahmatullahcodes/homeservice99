const DEFAULT_ERROR_MESSAGE = "Forbidden: Insufficient permissions";

function normalizePermissions(permissions) {
  let list = [];
  if (Array.isArray(permissions)) {
    list = permissions;
  } else if (typeof permissions === "string") {
    list = permissions.split(",");
  } else if (permissions && typeof permissions === "object") {
    list = Object.entries(permissions)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([key]) => key);
  }

  return list
    .map((permission) => String(permission).trim())
    .filter((permission) => permission.length > 0);
}

export function requireAdminPermission(required) {
  const requiredPermissions = Array.isArray(required) ? required : [required];

  return function adminPermissionCheck(req, res, next) {
    const role = req.user?.role || req.admin?.role;
    if (role === "admin") {
      return next();
    }

    const permissions = normalizePermissions(req.user?.permissions || req.admin?.permissions);
    const hasAccess = requiredPermissions.some((permission) => permissions.includes(permission));

    if (!hasAccess) {
      return res.status(403).json({ message: DEFAULT_ERROR_MESSAGE });
    }

    return next();
  };
}

export function adminOnly(req, res, next) {
  const role = req.user?.role || req.admin?.role;
  if (role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Super admin access required" });
  }
  return next();
}
