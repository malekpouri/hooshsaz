const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');

// @desc    Create a new user (Admin only)
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
  const { username, fullName, password, role } = req.body;

  try {
    const userExists = await prisma.user.findUnique({
      where: { username },
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        username,
        fullName,
        password: hashedPassword,
        role: role || 'USER',
      },
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  const { username, fullName, role, password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) {
      return res.status(404).json({ message: 'کاربری یافت نشد' });
    }

    const updateData = {
      username,
      fullName,
      role,
    };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        createdAt: true,
        isProtected: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        createdAt: true,
        isProtected: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) {
      return res.status(404).json({ message: 'کاربری یافت نشد' });
    }

    if (user.isProtected) {
      return res.status(400).json({ message: 'کاربر محافظت شده است' });
    }

    await prisma.user.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'کاربر حذف شد' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

// @desc    Get all chat logs
// @route   GET /api/admin/chats
// @access  Private/Admin
const getAllChats = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const [chats, total] = await Promise.all([
      prisma.chat.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: { username: true },
          },
          model: {
            select: { name: true },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.chat.count(),
    ]);

    res.json({
      chats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

// @desc    Get system config (Ollama URL)
// @route   GET /api/admin/config
// @access  Private/Admin
const getSystemConfig = async (req, res) => {
  try {
    const config = await prisma.systemConfig.findMany();
    const configMap = {};
    config.forEach((item) => {
      configMap[item.key] = item.value;
    });
    res.json(configMap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update system config
// @route   PUT /api/admin/config
// @access  Private/Admin
const updateSystemConfig = async (req, res) => {
  const { key, value } = req.body;
  try {
    await prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    res.json({ message: 'تغییرات با موفقیت ذخیره شد' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

// @desc    Test Ollama connection
// @route   POST /api/admin/test-ollama
// @access  Private/Admin
const testOllamaConnection = async (req, res) => {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'OLLAMA_URL' },
    });

    const ollamaUrl = config ? config.value : 'http://localhost:11434';
    
    // Simple fetch to Ollama version or tags endpoint
    const response = await fetch(`${ollamaUrl}/api/tags`);
    
    if (response.ok) {
      res.json({ status: 'success', message: 'اتصال با Ollama با موفقیت برقرار شد' });
    } else {
      res.status(500).json({ status: 'error', message: 'اتصال با Ollama با موفقیت برقرار نشد' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  createUser,
  updateUser,
  getUsers,
  deleteUser,
  getAllChats,
  getSystemConfig,
  updateSystemConfig,
  testOllamaConnection,
};
