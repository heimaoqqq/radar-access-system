# 🏠 基于雷达步态识别的养老院智能门禁系统

## 🎯 项目简介

这是一个基于ResNet18深度学习模型的雷达步态识别系统，专为养老院智能门禁设计。系统通过分析雷达时频图实现非接触式身份识别。

## ✨ 主要功能

- 🔬 **智能步态识别** - 支持10个用户（ID_1到ID_10）的身份识别
- 📊 **数据统计分析** - 访问记录、活动统计、实时监控
- 🧠 **ResNet18 + 对比学习** - 高精度身份识别模型
- 🌐 **纯前端部署** - 使用ONNX.js进行浏览器端推理
- 📱 **响应式设计** - 支持多种设备访问

## 🚀 在线演示

**访问地址**: https://heimaoqqq.github.io/radar-access-system

## 🛠️ 本地运行

```bash
# 克隆项目
git clone https://github.com/heimaoqqq/radar-access-system.git
cd radar-access-system

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📋 使用指南

### 1. 步态识别
1. 进入"步态检测"页面
2. 上传雷达时频图（224x224像素）
3. 点击"开始识别"按钮
4. 查看识别结果和置信度

### 2. 数据统计
- 查看访问记录
- 分析活动模式
- 监控系统状态

### 3. 人员管理
- 添加/编辑用户信息
- 设置权限级别
- 管理识别记录

## 🧠 技术架构

### 前端技术栈
- **React 18** - 用户界面框架
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Framer Motion** - 动画库
- **Chart.js** - 数据可视化

### AI模型
- **ResNet18** - 主干网络
- **对比学习** - 特征优化
- **ONNX.js** - 浏览器端推理
- **PyTorch训练** - 模型开发

## 📊 模型性能

- **准确率**: 100%（测试集）
- **支持用户**: 10个身份
- **推理时间**: <100ms
- **模型大小**: 50MB

## 🎓 模型训练

在Kaggle环境中训练ResNet18模型：

```python
# 安装依赖
pip install torch torchvision onnx

# 运行训练脚本
python scripts/train_resnet18.py --epochs 80 --batch_size 8
```

训练完成后会生成：
- `best_model.pth` - PyTorch模型
- `resnet18_identity.onnx` - ONNX模型

## 📁 项目结构

```
radar-access-system/
├── src/
│   ├── components/     # React组件
│   ├── pages/         # 页面组件
│   ├── utils/         # 工具函数
│   └── main.jsx       # 入口文件
├── public/
│   ├── dataset/       # 示例数据
│   └── models/        # 模型文件
├── scripts/
│   ├── train_resnet18.py    # 训练脚本
│   └── requirements.txt    # Python依赖
└── README.md
```

## 🔧 故障排除

### 模型加载失败
- 检查网络连接
- 确认ONNX.js兼容性
- 查看浏览器控制台错误

### 识别准确率低
- 确保输入图像为224x224像素
- 检查图像预处理流程
- 验证模型文件完整性

## 📝 开发日志

- ✅ 完成ResNet18模型训练
- ✅ 集成对比学习优化
- ✅ 实现ONNX.js浏览器部署
- ✅ 添加GitHub Pages支持
- ✅ 优化用户界面体验

## 👥 贡献者

- **heimaoqqq** - 项目开发者

## 📄 许可证

MIT License

---

**⚡ 快速开始**: 直接访问 [在线演示](https://heimaoqqq.github.io/radar-access-system) 体验系统功能！
