const express = require('express');
const router = express.Router();
const {
  getModels,
  sendMessage,
  getChats,
  getChat,
  deleteChat,
} = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat management
 */

/**
 * @swagger
 * /api/chat/models:
 *   get:
 *     summary: Get available AI models
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of models
 */
router.get('/models', getModels);

/**
 * @swagger
 * /api/chat/message:
 *   post:
 *     summary: Send message and stream response
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - model
 *             properties:
 *               chatId:
 *                 type: string
 *               message:
 *                 type: string
 *               model:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stream of events
 */
router.post('/message', sendMessage);

/**
 * @swagger
 * /api/chat:
 *   get:
 *     summary: Get user chats
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of chats
 */
router.get('/', getChats);

/**
 * @swagger
 * /api/chat/{id}:
 *   get:
 *     summary: Get chat details
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat details
 *   delete:
 *     summary: Delete chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat deleted
 */
router.route('/:id').get(getChat).delete(deleteChat);

module.exports = router;
