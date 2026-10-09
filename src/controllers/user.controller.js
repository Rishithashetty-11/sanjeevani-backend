const prisma = require('../config/db');

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        bloodGroup: true,
        latitude: true,
        longitude: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, bloodGroup, latitude, longitude } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { name, phone, address, bloodGroup, latitude, longitude },
      select: {
        id: true, name: true, email: true, phone: true, address: true, bloodGroup: true, latitude: true, longitude: true
      }
    });

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = { getProfile, updateProfile };
