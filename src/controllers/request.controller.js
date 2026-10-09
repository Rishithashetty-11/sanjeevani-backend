const prisma = require('../config/db');

const createRequest = async (req, res) => {
  try {
    const { bloodGroup, unitsRequired, urgency, location, latitude, longitude } = req.body;

    const request = await prisma.bloodRequest.create({
      data: {
        requesterId: req.user.userId,
        bloodGroup,
        unitsRequired,
        urgency,
        location,
        latitude,
        longitude
      }
    });

    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create request' });
  }
};

const getRequests = async (req, res) => {
  try {
    const { bloodGroup, status } = req.query;

    const filter = {};
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (status) filter.status = status;

    const requests = await prisma.bloodRequest.findMany({
      where: filter,
      include: {
        requester: {
          select: { name: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await prisma.bloodRequest.findUnique({ where: { id: parseInt(id) } });

    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.requesterId !== req.user.userId && req.user.role !== 'HOSPITAL') {
      return res.status(403).json({ error: 'Not authorized to update this request' });
    }

    const updated = await prisma.bloodRequest.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update request status' });
  }
};

module.exports = { createRequest, getRequests, updateRequestStatus };
