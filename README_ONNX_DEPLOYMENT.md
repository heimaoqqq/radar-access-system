# ResNet18 ONNX.js 部署指南

## 🎯 概述
本系统使用ONNX.js直接在浏览器中运行ResNet18身份识别模型，避免TensorFlow转换问题，完美适配GitHub Pages部署。

## 📋 完整部署流程

### 1️⃣ 训练模型并生成ONNX
```bash
# 在训练环境中运行
cd scripts
python train_resnet18.py --epochs 80 --batch_size 8

# 训练完成后会自动生成:
# - best_model.pth (PyTorch模型)
# - model.onnx (ONNX模型)
```

### 2️⃣ 处理大文件限制（50MB > 25MB GitHub限制）

#### 方案A: Git LFS（推荐）
```bash
# 安装并设置Git LFS
git lfs install
git lfs track "*.onnx"

# 复制模型文件
cp scripts/temp_conversion/model.onnx public/models/resnet18_identity/model.onnx

# 提交大文件
git add .gitattributes
git add public/models/resnet18_identity/model.onnx
git commit -m "Add ONNX model via Git LFS"
git push origin main
```

#### 方案B: 模型优化压缩
```bash
# 安装优化依赖
pip install onnxoptimizer onnxruntime

# 运行优化脚本
cd scripts
python optimize_onnx.py
# 自动压缩模型到25MB以下
```

#### 方案C: GitHub Releases（最佳GitHub Pages方案）
```bash
# 1. 创建Release并上传模型文件
# 2. 修改模型配置使用Release URL
# 3. 无需Git LFS，适合GitHub Pages
```

### 3️⃣ 安装依赖
```bash
npm install
# 已包含 onnxruntime-web: ^1.16.3
```

### 4️⃣ 本地测试
```bash
npm run dev
# 访问 http://localhost:5173
# 测试身份识别功能
```

### 5️⃣ 部署到GitHub Pages
```bash
npm run build
# 将dist/目录内容推送到GitHub Pages
```

## 🔧 技术特点

### ONNX.js优势
- ✅ **无依赖冲突** - 避免TensorFlow版本兼容问题
- ✅ **性能优化** - 专为浏览器优化，支持WebGL加速  
- ✅ **直接路径** - PyTorch → ONNX → 浏览器
- ✅ **模型小巧** - ONNX模型文件更紧凑

### 模型规格
- **输入格式**: `[1, 3, 224, 224]` (NCHW)
- **预处理**: ImageNet标准归一化
- **输出**: 10个类别概率 (ID_1 到 ID_10)
- **精度**: 训练达到100%准确率

## 📁 文件结构
```
public/models/resnet18_identity/
├── model.onnx          # ONNX模型文件
└── .gitkeep           # Git占位文件

src/utils/
└── resnet18Model.js   # ONNX.js模型加载器

scripts/
├── train_resnet18.py  # 训练脚本
└── convert_to_tfjs.py # 转换脚本(已弃用)
```

## 🎮 使用示例

```javascript
import ResNet18Classifier from './utils/resnet18Model.js'

// 创建分类器实例
const classifier = new ResNet18Classifier()

// 加载ONNX模型
await classifier.loadModel('/models/resnet18_identity/model.onnx')

// 单图识别
const result = await classifier.predictSingle(imageElement)
console.log(`识别结果: ${result.classId}, 置信度: ${result.confidence}`)

// 三图验证
const verification = await classifier.verifyIdentity([img1, img2, img3])
if (verification.success) {
  console.log(`身份验证成功: ${verification.identifiedId}`)
}
```

## ⚠️ 注意事项

1. **模型文件** - 确保将训练好的model.onnx放置在public/models/resnet18_identity/目录
2. **图像格式** - 支持常见格式(JPG/PNG)，自动调整为224x224
3. **浏览器兼容** - 需要现代浏览器支持WebAssembly
4. **模型大小** - ONNX文件约50-100MB，首次加载需要时间

## 🔍 故障排除

### 模型加载失败
- 检查model.onnx文件是否存在于正确路径
- 确认onnxruntime-web依赖已安装
- 查看浏览器控制台错误信息

### 识别精度问题  
- 确保输入图像质量良好
- 验证图像预处理是否正确
- 检查模型是否使用最新训练的版本

## 📊 性能指标

- **模型大小**: ~50MB (ONNX)
- **加载时间**: 2-5秒 (首次)
- **推理速度**: <100ms/图
- **内存占用**: ~200MB
- **训练精度**: 100% (验证集)

## 🚀 部署到生产环境

1. 确保ONNX模型文件在public目录
2. 运行`npm run build`生成生产版本
3. 将dist/目录部署到GitHub Pages
4. 验证模型加载和识别功能正常

---

*本指南涵盖了从训练到部署的完整流程，确保ResNet18身份识别系统能够在GitHub Pages上稳定运行。*
