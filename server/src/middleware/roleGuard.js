const requireRole = (...args) => {
  // Normalize: accept requireRole('DONOR'), requireRole(['DONOR','ADMIN']), or requireRole('DONOR','ADMIN')
  const roles = args.length === 1 && Array.isArray(args[0]) ? args[0] : args.flat();

  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

module.exports = requireRole;
