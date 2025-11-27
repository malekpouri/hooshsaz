const prisma = require('../utils/prisma');
const ollamaService = require('../services/ollama.service');

// @desc    Get available AI models
// @route   GET /api/chat/models
// @access  Private
const getModels = async (req, res) => {
  try {
    const models = await ollamaService.getModels();
    res.json(models);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch models' });
  }
};

// @desc    Send message and stream response
// @route   POST /api/chat/message
// @access  Private
const sendMessage = async (req, res) => {
  const { chatId, message, model } = req.body;
  const userId = req.user.id;

  if (!message || !model) {
    return res.status(400).json({ message: 'Message and model are required' });
  }

  try {
    let chat;
    
    // 1. Get or Create Chat
    if (chatId) {
      chat = await prisma.chat.findUnique({
        where: { id: chatId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });

      if (!chat || chat.userId !== userId) {
        return res.status(404).json({ message: 'Chat not found' });
      }
    } else {
      // Ensure AIModel exists
      let aiModel = await prisma.aIModel.findUnique({
        where: { name: model },
      });

      if (!aiModel) {
        aiModel = await prisma.aIModel.create({
          data: {
            name: model,
            provider: 'ollama',
            description: 'Ollama model',
          },
        });
      }

      // Create new chat
      chat = await prisma.chat.create({
        data: {
          userId,
          title: message.substring(0, 50) + '...',
          modelId: aiModel.id,
        },
        include: { messages: true },
      });
    }

    // 2. Save User Message
    await prisma.message.create({
      data: {
        chatId: chat.id,
        role: 'user',
        content: message,
      },
    });

    // 3. Prepare Context for Ollama (History)
    // We'll send the full history for now, or last N messages
    const history = chat.messages.map(m => ({
      role: m.role,
      content: m.content
    }));
    history.push({ role: 'user', content: message });

    // 4. Set up Streaming Response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial info including chat ID (useful for new chats)
    res.write(`data: ${JSON.stringify({ type: 'info', chatId: chat.id })}\n\n`);

    // 5. Call Ollama and Stream
    let fullResponse = '';
    
    await ollamaService.chatStream(
      model,
      history,
      (chunk) => {
        // Send chunk to client
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
        fullResponse += chunk;
      },
      async (completeResponse) => {
        // 6. Save Assistant Message on completion
        await prisma.message.create({
          data: {
            chatId: chat.id,
            role: 'assistant',
            content: completeResponse,
          },
        });
        
        // Update Chat title if it's the first message and generic
        // (Optional enhancement for later)
        
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();
      }
    );

  } catch (error) {
    console.error('Chat error:', error);
    // If headers not sent, send JSON error
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error during chat' });
    } else {
      // If streaming started, send error event
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Stream failed' })}\n\n`);
      res.end();
    }
  }
};

// @desc    Get user's chats
// @route   GET /api/chat
// @access  Private
const getChats = async (req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single chat with messages
// @route   GET /api/chat/:id
// @access  Private
const getChat = async (req, res) => {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: req.params.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!chat || chat.userId !== req.user.id) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete chat
// @route   DELETE /api/chat/:id
// @access  Private
const deleteChat = async (req, res) => {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: req.params.id },
    });

    if (!chat || chat.userId !== req.user.id) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    await prisma.chat.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Chat removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getModels,
  sendMessage,
  getChats,
  getChat,
  deleteChat,
};
