const User = require('./user.model');

async function getCurrentUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
}

async function getCurrentUserProfile(userId) {
  const user = await getCurrentUser(userId);
  return user.toSafeObject();
}

async function updateCurrentUserProfile(userId, updates) {
  const allowedFields = ['name', 'phone', 'settings'];
  const toUpdate = {};

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      toUpdate[field] = updates[field];
    }
  });

  const user = await User.findByIdAndUpdate(userId, toUpdate, { new: true });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user.toSafeObject();
}

async function getAddresses(userId) {
  const user = await getCurrentUser(userId);
  return user.addresses || [];
}

async function addAddress(userId, addressData) {
  const user = await getCurrentUser(userId);

  if (addressData.isDefault) {
    user.addresses.forEach((addr) => {
      // eslint-disable-next-line no-param-reassign
      addr.isDefault = false;
    });
  }

  user.addresses.push(addressData);
  await user.save();

  return user.addresses;
}

async function updateAddress(userId, addressId, addressData) {
  const user = await getCurrentUser(userId);
  const address = user.addresses.id(addressId);

  if (!address) {
    const error = new Error('Address not found');
    error.statusCode = 404;
    throw error;
  }

  if (addressData.isDefault) {
    user.addresses.forEach((addr) => {
      // eslint-disable-next-line no-param-reassign
      addr.isDefault = false;
    });
  }

  Object.assign(address, addressData);
  await user.save();

  return user.addresses;
}

async function deleteAddress(userId, addressId) {
  const user = await getCurrentUser(userId);
  const address = user.addresses.id(addressId);

  if (!address) {
    const error = new Error('Address not found');
    error.statusCode = 404;
    throw error;
  }

  address.deleteOne();
  await user.save();

  return user.addresses;
}

async function deleteAccount(userId) {
  const result = await User.findByIdAndDelete(userId);
  if (!result) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
}

module.exports = {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  deleteAccount,
};

