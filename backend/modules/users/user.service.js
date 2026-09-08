const userRepository = require('./user.repository');
const AppError = require('../../utils/AppError');
const bcrypt = require('bcryptjs');

const checkLastAdminTx = async (tx, userId, targetRole, targetIsActive, targetDeleted) => {
  // If target will no longer be an active admin, verify another active admin exists
  if (targetRole !== 'ADMIN' || targetIsActive === false || targetDeleted) {
    const activeAdminCount = await tx.user.count({
      where: {
        role: 'ADMIN',
        is_active: true,
        deleted_at: null,
        id: { not: userId }
      }
    });
    if (activeAdminCount === 0) {
      throw new AppError('Cannot perform this operation: it would leave the system with zero active ADMIN users.', 'VALIDATION_ERROR', 400);
    }
  }
};

const checkSelfOperation = (targetId, currentUserId, operation) => {
  if (targetId === currentUserId) {
    throw new AppError(`Cannot ${operation} your own account.`, 'VALIDATION_ERROR', 400);
  }
};

const checkUniqueness = async (username, email, excludeId = null) => {
  const existing = await userRepository.findByUsernameOrEmail(username, email, excludeId);
  if (existing) {
    if (existing.username.toLowerCase() === username.toLowerCase()) {
      throw new AppError('Username is already taken', 'VALIDATION_ERROR', 400);
    }
    if (existing.email.toLowerCase() === email.toLowerCase()) {
      throw new AppError('Email is already taken', 'VALIDATION_ERROR', 400);
    }
  }
};

const getUsers = async (options) => {
  let is_active;
  if (options.is_active === 'true') is_active = true;
  else if (options.is_active === 'false') is_active = false;
  
  const { users, total } = await userRepository.findAll({ ...options, is_active });
  return {
    users,
    meta: {
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit)
    }
  };
};

const getUserById = async (id) => {
  const user = await userRepository.findById(id);
  if (!user || user.deleted_at !== null) {
    throw new AppError('User not found', 'USER_NOT_FOUND', 404);
  }
  return user;
};

const createUser = async (data, currentUserId) => {
  await checkUniqueness(data.username, data.email);
  
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(data.password, salt);
  
  return await userRepository.executeTransaction(async (tx) => {
    try {
      const newUser = await tx.user.create({
        data: {
          name: data.name,
          username: data.username,
          email: data.email,
          password_hash,
          role: data.role,
          is_active: data.is_active !== undefined ? data.is_active : true
        },
        select: userRepository.selectWithoutPassword
      });

      await tx.auditLog.create({
        data: {
          user_id: currentUserId,
          action: 'USER_CREATED',
          entity: 'USER',
          entity_id: newUser.id,
          metadata: JSON.stringify({ role: newUser.role, username: newUser.username })
        }
      });

      return newUser;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new AppError('Username or email already exists', 'VALIDATION_ERROR', 400);
      }
      throw error;
    }
  });
};

const updateUser = async (id, data, currentUserId) => {
  const existingUser = await getUserById(id);
  
  if (data.username || data.email) {
    const checkUsername = data.username || existingUser.username;
    const checkEmail = data.email || existingUser.email;
    await checkUniqueness(checkUsername, checkEmail, id);
  }

  const targetRole = data.role || existingUser.role;
  const targetIsActive = data.is_active !== undefined ? data.is_active : existingUser.is_active;

  // Prevent self-deactivation or self-role demotion
  if (id === currentUserId) {
    if (data.is_active === false) {
      checkSelfOperation(id, currentUserId, 'deactivate');
    }
    if (data.role && data.role !== existingUser.role) {
      throw new AppError('Cannot change your own role.', 'VALIDATION_ERROR', 400);
    }
  }

  const updateData = { ...data };
  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password_hash = await bcrypt.hash(data.password, salt);
    delete updateData.password;
  }

  return await userRepository.executeTransaction(async (tx) => {
    try {
      // Protect last admin
      if (existingUser.role === 'ADMIN') {
        await checkLastAdminTx(tx, id, targetRole, targetIsActive, false);
      }

      const updatedUser = await tx.user.update({
        where: { id },
        data: updateData,
        select: userRepository.selectWithoutPassword
      });

      // Audit logs
      const actions = [];
      if (data.role && data.role !== existingUser.role) actions.push('USER_ROLE_CHANGED');
      if (data.is_active === true && !existingUser.is_active) actions.push('USER_ACTIVATED');
      if (data.is_active === false && existingUser.is_active) actions.push('USER_DEACTIVATED');
      if (actions.length === 0) actions.push('USER_UPDATED');

      for (const action of actions) {
        await tx.auditLog.create({
          data: {
            user_id: currentUserId,
            action,
            entity: 'USER',
            entity_id: id,
            metadata: JSON.stringify({ role: updatedUser.role, is_active: updatedUser.is_active })
          }
        });
      }

      return updatedUser;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new AppError('Username or email already exists', 'VALIDATION_ERROR', 400);
      }
      throw error;
    }
  });
};

const deleteUser = async (id, currentUserId) => {
  const existingUser = await getUserById(id);
  
  checkSelfOperation(id, currentUserId, 'delete');

  return await userRepository.executeTransaction(async (tx) => {
    if (existingUser.role === 'ADMIN') {
      await checkLastAdminTx(tx, id, 'ADMIN', existingUser.is_active, true);
    }

    const deletedTimestamp = Date.now();
    const deletedUser = await tx.user.update({
      where: { id },
      data: { 
        deleted_at: new Date(),
        is_active: false, // Automatically deactivate on soft delete
        email: existingUser.email ? `${existingUser.email}_deleted_${deletedTimestamp}` : null,
        username: existingUser.username ? `${existingUser.username}_deleted_${deletedTimestamp}` : null
      },
      select: userRepository.selectWithoutPassword
    });

    await tx.auditLog.create({
      data: {
        user_id: currentUserId,
        action: 'USER_DELETED',
        entity: 'USER',
        entity_id: id,
        metadata: JSON.stringify({ username: deletedUser.username })
      }
    });

    return deletedUser;
  });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
