const express = require('express');
const { createRequest, getRequests, updateRequestStatus } = require('../controllers/request.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const router = express.Router();

/**
 * @swagger
 * /api/requests:
 *   get:
 *     summary: List blood requests
 *     tags: [Blood Requests]
 *     parameters:
 *       - in: query
 *         name: bloodGroup
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, FULFILLED, CANCELLED]
 *     responses:
 *       200:
 *         description: List of requests
 *   post:
 *     summary: Create a new blood request
 *     tags: [Blood Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bloodGroup
 *               - unitsRequired
 *               - urgency
 *               - location
 *             properties:
 *               bloodGroup:
 *                 type: string
 *               unitsRequired:
 *                 type: number
 *               urgency:
 *                 type: string
 *               location:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       201:
 *         description: Created
 */
router.route('/')
  .get(getRequests)
  .post(authenticate, createRequest);

/**
 * @swagger
 * /api/requests/{id}/status:
 *   put:
 *     summary: Update request status
 *     tags: [Blood Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, FULFILLED, CANCELLED]
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/:id/status', authenticate, updateRequestStatus);

module.exports = router;
