#!/usr/bin/env python3
"""
ResNet18身份分类器训练脚本
用于训练10个用户(ID_1到ID_10)的身份识别模型
"""

import os
import sys
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
from PIL import Image
import json
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from tqdm import tqdm
import argparse
import warnings
warnings.filterwarnings('ignore')

class GaitDataset(Dataset):
    """步态数据集类"""
    
    def __init__(self, image_paths, labels, transform=None):
        self.image_paths = image_paths
        self.labels = labels
        self.transform = transform
        
    def __len__(self):
        return len(self.image_paths)
    
    def __getitem__(self, idx):
        image_path = self.image_paths[idx]
        label = self.labels[idx]
        
        try:
            # 加载图像
            image = Image.open(image_path).convert('RGB')
            
            if self.transform:
                image = self.transform(image)
                
            return image, label
        except Exception as e:
            print(f"Error loading image {image_path}: {e}")
            # 返回零图像作为备用
            if self.transform:
                zero_image = self.transform(Image.new('RGB', (256, 256), (0, 0, 0)))
            else:
                zero_image = transforms.ToTensor()(Image.new('RGB', (256, 256), (0, 0, 0)))
            return zero_image, label

def load_dataset(dataset_path):
    """加载数据集"""
    image_paths = []
    labels = []
    class_names = []
    
    print("正在扫描数据集...")
    
    # 扫描每个用户目录
    for user_id in sorted(os.listdir(dataset_path)):
        user_path = os.path.join(dataset_path, user_id)
        
        if not os.path.isdir(user_path):
            continue
            
        if not user_id.startswith('ID_'):
            continue
            
        print(f"处理用户: {user_id}")
        class_names.append(user_id)
        label = len(class_names) - 1
        
        # 扫描用户目录下的所有图像
        user_images = []
        for file_name in os.listdir(user_path):
            if file_name.lower().endswith(('.jpg', '.jpeg', '.png')):
                file_path = os.path.join(user_path, file_name)
                user_images.append(file_path)
        
        print(f"  找到 {len(user_images)} 张图像")
        
        # 添加到总列表
        image_paths.extend(user_images)
        labels.extend([label] * len(user_images))
    
    print(f"\n数据集统计:")
    print(f"总用户数: {len(class_names)}")
    print(f"总图像数: {len(image_paths)}")
    print(f"类别: {class_names}")
    
    return image_paths, labels, class_names

def create_data_transforms():
    """创建数据增强和预处理变换"""
    
    # 训练时的数据增强
    train_transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=10),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                           std=[0.229, 0.224, 0.225])  # ImageNet标准化
    ])
    
    # 验证时不做数据增强
    val_transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                           std=[0.229, 0.224, 0.225])
    ])
    
    return train_transform, val_transform

def create_model(num_classes):
    """创建ResNet18模型"""
    
    # 加载预训练的ResNet18
    model = models.resnet18(pretrained=True)
    
    # 冻结前面的层，只训练最后几层
    for param in model.parameters():
        param.requires_grad = False
    
    # 解冻最后两个残差块
    for param in model.layer3.parameters():
        param.requires_grad = True
    for param in model.layer4.parameters():
        param.requires_grad = True
    
    # 替换最后的全连接层
    num_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(0.5),
        nn.Linear(num_features, 256),
        nn.ReLU(),
        nn.Dropout(0.3),
        nn.Linear(256, num_classes)
    )
    
    return model

def train_model(model, train_loader, val_loader, num_epochs=50, learning_rate=0.001, device='cuda'):
    """训练模型"""
    
    model = model.to(device)
    
    # 损失函数和优化器
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=15, gamma=0.5)
    
    # 记录训练历史
    train_losses = []
    train_accuracies = []
    val_losses = []
    val_accuracies = []
    
    best_val_acc = 0.0
    best_model_state = None
    
    print("开始训练...")
    
    for epoch in range(num_epochs):
        # 训练阶段
        model.train()
        train_loss = 0.0
        train_correct = 0
        train_total = 0
        
        train_pbar = tqdm(train_loader, desc=f'Epoch {epoch+1}/{num_epochs} [Train]')
        for batch_idx, (data, target) in enumerate(train_pbar):
            data, target = data.to(device), target.to(device)
            
            optimizer.zero_grad()
            output = model(data)
            loss = criterion(output, target)
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item()
            _, predicted = torch.max(output.data, 1)
            train_total += target.size(0)
            train_correct += (predicted == target).sum().item()
            
            # 更新进度条
            train_pbar.set_postfix({
                'Loss': f'{loss.item():.4f}',
                'Acc': f'{100.*train_correct/train_total:.2f}%'
            })
        
        # 验证阶段
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        
        with torch.no_grad():
            val_pbar = tqdm(val_loader, desc=f'Epoch {epoch+1}/{num_epochs} [Val]')
            for data, target in val_pbar:
                data, target = data.to(device), target.to(device)
                output = model(data)
                loss = criterion(output, target)
                
                val_loss += loss.item()
                _, predicted = torch.max(output.data, 1)
                val_total += target.size(0)
                val_correct += (predicted == target).sum().item()
                
                val_pbar.set_postfix({
                    'Loss': f'{loss.item():.4f}',
                    'Acc': f'{100.*val_correct/val_total:.2f}%'
                })
        
        # 计算平均值
        avg_train_loss = train_loss / len(train_loader)
        avg_val_loss = val_loss / len(val_loader)
        train_acc = 100. * train_correct / train_total
        val_acc = 100. * val_correct / val_total
        
        # 记录历史
        train_losses.append(avg_train_loss)
        train_accuracies.append(train_acc)
        val_losses.append(avg_val_loss)
        val_accuracies.append(val_acc)
        
        # 保存最佳模型
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_model_state = model.state_dict().copy()
        
        # 更新学习率
        scheduler.step()
        
        print(f'Epoch {epoch+1}/{num_epochs}:')
        print(f'  Train Loss: {avg_train_loss:.4f}, Train Acc: {train_acc:.2f}%')
        print(f'  Val Loss: {avg_val_loss:.4f}, Val Acc: {val_acc:.2f}%')
        print(f'  Best Val Acc: {best_val_acc:.2f}%')
        print(f'  Learning Rate: {scheduler.get_last_lr()[0]:.6f}\n')
    
    # 加载最佳模型
    model.load_state_dict(best_model_state)
    
    return model, {
        'train_losses': train_losses,
        'train_accuracies': train_accuracies,
        'val_losses': val_losses,
        'val_accuracies': val_accuracies,
        'best_val_acc': best_val_acc
    }

def evaluate_model(model, test_loader, class_names, device='cuda'):
    """评估模型性能"""
    
    model.eval()
    all_preds = []
    all_labels = []
    
    with torch.no_grad():
        for data, target in tqdm(test_loader, desc='Evaluating'):
            data, target = data.to(device), target.to(device)
            output = model(data)
            _, predicted = torch.max(output, 1)
            
            all_preds.extend(predicted.cpu().numpy())
            all_labels.extend(target.cpu().numpy())
    
    # 计算准确率
    accuracy = accuracy_score(all_labels, all_preds)
    
    # 打印分类报告
    print(f"\n最终测试准确率: {accuracy:.4f}")
    print("\n详细分类报告:")
    print(classification_report(all_labels, all_preds, target_names=class_names))
    
    # 绘制混淆矩阵
    cm = confusion_matrix(all_labels, all_preds)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=class_names, yticklabels=class_names)
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig('confusion_matrix.png', dpi=300, bbox_inches='tight')
    plt.show()
    
    return accuracy

def plot_training_history(history):
    """绘制训练历史"""
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
    
    # 损失曲线
    ax1.plot(history['train_losses'], label='Train Loss')
    ax1.plot(history['val_losses'], label='Validation Loss')
    ax1.set_title('Training and Validation Loss')
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Loss')
    ax1.legend()
    ax1.grid(True)
    
    # 准确率曲线
    ax2.plot(history['train_accuracies'], label='Train Accuracy')
    ax2.plot(history['val_accuracies'], label='Validation Accuracy')
    ax2.set_title('Training and Validation Accuracy')
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('Accuracy (%)')
    ax2.legend()
    ax2.grid(True)
    
    plt.tight_layout()
    plt.savefig('training_history.png', dpi=300, bbox_inches='tight')
    plt.show()

def save_model_for_web(model, class_names, save_path='../public/models/resnet18_identity'):
    """保存模型用于Web部署"""
    
    os.makedirs(save_path, exist_ok=True)
    
    # 保存PyTorch模型
    torch.save({
        'model_state_dict': model.state_dict(),
        'class_names': class_names,
        'num_classes': len(class_names)
    }, os.path.join(save_path, 'resnet18_identity.pth'))
    
    print(f"PyTorch模型已保存到: {save_path}/resnet18_identity.pth")
    
    # 保存类别映射
    class_mapping = {i: name for i, name in enumerate(class_names)}
    with open(os.path.join(save_path, 'class_mapping.json'), 'w') as f:
        json.dump(class_mapping, f, indent=2)
    
    print(f"类别映射已保存到: {save_path}/class_mapping.json")
    
    # 导出为ONNX格式（用于后续转换为TensorFlow.js）
    model.eval()
    dummy_input = torch.randn(1, 3, 224, 224)
    onnx_path = os.path.join(save_path, 'resnet18_identity.onnx')
    
    torch.onnx.export(
        model,
        dummy_input,
        onnx_path,
        export_params=True,
        opset_version=11,
        do_constant_folding=True,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={
            'input': {0: 'batch_size'},
            'output': {0: 'batch_size'}
        }
    )
    
    print(f"ONNX模型已保存到: {onnx_path}")
    print("\n提示: 使用以下命令转换为TensorFlow.js格式:")
    print(f"pip install onnx-tf tensorflowjs")
    print(f"onnx-tf convert -i {onnx_path} -o {save_path}/tf_model")
    print(f"tensorflowjs_converter --input_format=tf_saved_model --output_format=tfjs_graph_model {save_path}/tf_model {save_path}")

def main():
    parser = argparse.ArgumentParser(description='训练ResNet18身份分类器')
    parser.add_argument('--dataset_path', type=str, default='../dataset', 
                       help='数据集路径')
    parser.add_argument('--epochs', type=int, default=50, 
                       help='训练轮数')
    parser.add_argument('--batch_size', type=int, default=32, 
                       help='批次大小')
    parser.add_argument('--learning_rate', type=float, default=0.001, 
                       help='学习率')
    parser.add_argument('--test_split', type=float, default=0.2, 
                       help='测试集比例')
    parser.add_argument('--val_split', type=float, default=0.2, 
                       help='验证集比例')
    
    args = parser.parse_args()
    
    # 检查GPU
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"使用设备: {device}")
    
    # 加载数据集
    image_paths, labels, class_names = load_dataset(args.dataset_path)
    
    if len(class_names) == 0:
        print("错误: 没有找到有效的数据集!")
        return
    
    # 分割数据集
    train_paths, temp_paths, train_labels, temp_labels = train_test_split(
        image_paths, labels, test_size=(args.test_split + args.val_split), 
        random_state=42, stratify=labels
    )
    
    val_paths, test_paths, val_labels, test_labels = train_test_split(
        temp_paths, temp_labels, test_size=args.test_split/(args.test_split + args.val_split), 
        random_state=42, stratify=temp_labels
    )
    
    print(f"\n数据集分割:")
    print(f"训练集: {len(train_paths)} 张图像")
    print(f"验证集: {len(val_paths)} 张图像")
    print(f"测试集: {len(test_paths)} 张图像")
    
    # 创建数据变换
    train_transform, val_transform = create_data_transforms()
    
    # 创建数据集和数据加载器
    train_dataset = GaitDataset(train_paths, train_labels, train_transform)
    val_dataset = GaitDataset(val_paths, val_labels, val_transform)
    test_dataset = GaitDataset(test_paths, test_labels, val_transform)
    
    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False, num_workers=2)
    test_loader = DataLoader(test_dataset, batch_size=args.batch_size, shuffle=False, num_workers=2)
    
    # 创建模型
    model = create_model(len(class_names))
    
    print(f"\n模型架构:")
    print(f"输入尺寸: (3, 224, 224)")
    print(f"输出类别数: {len(class_names)}")
    print(f"类别: {class_names}")
    
    # 训练模型
    trained_model, history = train_model(
        model, train_loader, val_loader, 
        num_epochs=args.epochs, 
        learning_rate=args.learning_rate, 
        device=device
    )
    
    # 绘制训练历史
    plot_training_history(history)
    
    # 评估测试集
    test_accuracy = evaluate_model(trained_model, test_loader, class_names, device)
    
    # 保存模型
    save_model_for_web(trained_model, class_names)
    
    print(f"\n训练完成!")
    print(f"最佳验证准确率: {history['best_val_acc']:.2f}%")
    print(f"最终测试准确率: {test_accuracy:.4f}")

if __name__ == '__main__':
    main()
