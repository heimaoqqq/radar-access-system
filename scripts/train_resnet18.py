#!/usr/bin/env python3
"""
ResNet18身份分类器训练脚本
用于训练10个用户(ID_1到ID_10)的身份识别模型
"""

import os
import glob
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
from tqdm import tqdm
import argparse
from PIL import Image
import json
import numpy as np
import random
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import warnings
warnings.filterwarnings('ignore')

class GaitDataset(Dataset):
    """步态数据集类"""
    
    def __init__(self, image_paths, labels, transform=None, contrastive_mode=False):
        self.image_paths = image_paths
        self.labels = labels
        self.transform = transform
        self.contrastive_mode = contrastive_mode
        
        # 为对比学习创建按类别分组的索引
        if self.contrastive_mode:
            self.class_to_indices = {}
            for idx, label in enumerate(labels):
                if label not in self.class_to_indices:
                    self.class_to_indices[label] = []
                self.class_to_indices[label].append(idx)
        
    def __len__(self):
        return len(self.image_paths)
    
    def __getitem__(self, idx):
        if self.contrastive_mode:
            return self._get_contrastive_pair(idx)
        else:
            return self._get_single_item(idx)
    
    def _get_single_item(self, idx):
        """获取单个图像和标签"""
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
    
    def _get_contrastive_pair(self, idx):
        """获取对比学习的图像对 - 优化负样本选择策略"""
        anchor_path = self.image_paths[idx]
        anchor_label = self.labels[idx]
        
        # 动态调整正负样本比例：60% 负样本，40% 正样本
        # 这样模型更多地学习区分不同类别
        is_positive = random.random() > 0.6
        
        if is_positive:
            # 选择同类的另一个样本作为正样本
            positive_indices = [i for i in self.class_to_indices[anchor_label] if i != idx]
            if positive_indices:
                positive_idx = random.choice(positive_indices)
            else:
                positive_idx = idx  # 如果没有其他同类样本，使用自己
            pair_path = self.image_paths[positive_idx]
            pair_label = anchor_label
            similarity = 1.0
        else:
            # 智能负样本选择策略：从所有其他类别中选择
            negative_classes = [c for c in self.class_to_indices.keys() if c != anchor_label]
            if negative_classes:
                # 策略1: 随机选择负样本类别（保持多样性）
                if random.random() > 0.3:
                    negative_class = random.choice(negative_classes)
                    negative_idx = random.choice(self.class_to_indices[negative_class])
                # 策略2: 选择相邻ID作为困难负样本（更具挑战性）
                else:
                    # 优先选择相邻的用户ID作为困难负样本
                    current_id = anchor_label
                    adjacent_ids = []
                    for neg_class in negative_classes:
                        id_diff = abs(neg_class - current_id)
                        if id_diff <= 2:  # 相邻2个ID内
                            adjacent_ids.append(neg_class)
                    
                    if adjacent_ids:
                        negative_class = random.choice(adjacent_ids)
                    else:
                        negative_class = random.choice(negative_classes)
                    
                    negative_idx = random.choice(self.class_to_indices[negative_class])
                
                pair_path = self.image_paths[negative_idx]
                pair_label = negative_class
            else:
                pair_path = anchor_path
                pair_label = anchor_label
            similarity = 0.0
        
        try:
            # 加载锚点图像和配对图像
            anchor_image = Image.open(anchor_path).convert('RGB')
            pair_image = Image.open(pair_path).convert('RGB')
            
            if self.transform:
                anchor_image = self.transform(anchor_image)
                pair_image = self.transform(pair_image)
            
            return (anchor_image, pair_image), (anchor_label, pair_label, similarity)
            
        except Exception as e:
            print(f"Error loading contrastive pair: {e}")
            # 返回零图像对作为备用
            if self.transform:
                zero_image = self.transform(Image.new('RGB', (256, 256), (0, 0, 0)))
            else:
                zero_image = transforms.ToTensor()(Image.new('RGB', (256, 256), (0, 0, 0)))
            return (zero_image, zero_image), (anchor_label, anchor_label, 1.0)

def load_dataset(dataset_path):
    """加载数据集"""
    image_paths = []
    labels = []
    class_names = []
    
    print("正在扫描数据集...")
    
    # 扫描每个用户目录并按数字ID排序
    user_dirs = []
    for class_dir in os.listdir(dataset_path):
        class_path = os.path.join(dataset_path, class_dir)
        if os.path.isdir(class_path) and class_dir.startswith('ID_'):
            try:
                # 提取数字ID进行排序
                id_num = int(class_dir.split('_')[1])
                user_dirs.append((id_num, class_dir, class_path))
            except:
                continue
    
    # 按ID数字排序 (1, 2, 3, ..., 10)
    user_dirs.sort(key=lambda x: x[0])
    
    for id_num, class_dir, class_path in user_dirs:
        class_names.append(class_dir)
        class_idx = len(class_names) - 1
        
        # 扫描该用户的所有图像
        image_count = 0
        for img_file in os.listdir(class_path):
            if img_file.lower().endswith(('.png', '.jpg', '.jpeg')):
                img_path = os.path.join(class_path, img_file)
                image_paths.append(img_path)
                labels.append(class_idx)
                image_count += 1
        
        print(f"  {class_dir}: {image_count} 张图像")
    
    if len(class_names) == 0:
        print("错误: 未找到符合格式的用户目录 (ID_*)")
        return [], [], []
    
    print(f"总共找到 {len(class_names)} 个用户类别")
    print(f"类别排序: {class_names}")
    return image_paths, labels, class_names

def create_data_transforms():
    """创建微多普勒时频图专用的简洁预处理"""
    
    # 训练时的最小化预处理（保持时频图的物理意义）
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),  # 直接resize到目标尺寸
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                           std=[0.229, 0.224, 0.225])
    ])
    
    # 验证/测试时使用相同预处理
    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                           std=[0.229, 0.224, 0.225])
    ])
    
    return train_transform, val_transform

class ContrastiveLoss(nn.Module):
    """对比损失函数"""
    
    def __init__(self, margin=1.0):
        super(ContrastiveLoss, self).__init__()
        self.margin = margin
        
    def forward(self, output1, output2, target):
        """
        Args:
            output1: 第一个图像的特征向量
            output2: 第二个图像的特征向量  
            target: 相似度标签 (1表示相似，0表示不相似)
        """
        euclidean_distance = F.pairwise_distance(output1, output2, keepdim=True)
        
        loss_contrastive = torch.mean(
            target * torch.pow(euclidean_distance, 2) +
            (1 - target) * torch.pow(torch.clamp(self.margin - euclidean_distance, min=0.0), 2)
        )
        
        return loss_contrastive

class ResNet18Contrastive(nn.Module):
    """支持对比学习的ResNet18模型"""
    
    def __init__(self, num_classes, embedding_dim=128):
        super(ResNet18Contrastive, self).__init__()
        
        # 加载预训练的ResNet18
        self.backbone = models.resnet18(pretrained=True)
        
        # 更激进的解冻策略：解冻更多层以提高学习能力
        for param in self.backbone.parameters():
            param.requires_grad = False
        
        # 解冻后面三个残差块 + BatchNorm层
        for param in self.backbone.layer2.parameters():
            param.requires_grad = True
        for param in self.backbone.layer3.parameters():
            param.requires_grad = True
        for param in self.backbone.layer4.parameters():
            param.requires_grad = True
        
        # 获取特征维度
        num_features = self.backbone.fc.in_features
        
        # 移除原始的分类头
        self.backbone.fc = nn.Identity()
        
        # 添加特征嵌入层
        self.embedding = nn.Sequential(
            nn.Linear(num_features, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, embedding_dim),
            L2Norm(dim=1)  # L2标准化用于对比学习
        )
        
        # 分类头
        self.classifier = nn.Sequential(
            nn.Linear(embedding_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(256, num_classes)
        )
        
    def forward(self, x):
        features = self.backbone(x)
        embeddings = self.embedding(features)
        
        if self.training:
            # 训练时返回嵌入向量和分类结果
            classification = self.classifier(embeddings)
            return embeddings, classification
        else:
            # 推理时只返回分类结果
            return self.classifier(embeddings)

class L2Norm(nn.Module):
    """L2标准化层"""
    def __init__(self, dim=1):
        super(L2Norm, self).__init__()
        self.dim = dim
        
    def forward(self, x):
        return F.normalize(x, p=2, dim=self.dim)

def create_model(num_classes, contrastive_learning=False, embedding_dim=128):
    """创建ResNet18模型"""
    
    if contrastive_learning:
        # 使用对比学习模型
        model = ResNet18Contrastive(num_classes, embedding_dim)
    else:
        # 使用标准分类模型
        model = models.resnet18(pretrained=True)
        
        # 冻结前面的层，只训练最后几层
        for param in model.parameters():
            param.requires_grad = False
        
        # 解冻更多层进行微调 - 为达到100%准确率
        for name, param in model.named_parameters():
            if 'layer4' in name or 'layer3' in name or 'layer2' in name or 'fc' in name:
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

def train_model(model, train_loader, val_loader, num_epochs=50, learning_rate=0.001, device='cuda', contrastive_learning=False, contrastive_weight=0.5):
    """训练模型"""
    
    model = model.to(device)
    
    # 损失函数和优化器
    criterion = nn.CrossEntropyLoss()
    contrastive_criterion = ContrastiveLoss(margin=1.0) if contrastive_learning else None
    optimizer = optim.Adam(model.parameters(), lr=learning_rate, weight_decay=1e-5)
    # 使用余弦退火调度器，更平滑的学习率衰减
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=num_epochs//4, eta_min=learning_rate*0.01)
    
    # 记录训练历史
    train_losses = []
    train_accuracies = []
    val_losses = []
    val_accuracies = []
    contrastive_losses = [] if contrastive_learning else None
    
    print(f"开始训练，设备: {device}")
    print(f"对比学习模式: {'开启' if contrastive_learning else '关闭'}")
    if contrastive_learning:
        print(f"对比学习权重: {contrastive_weight}")
    print(f"训练样本数: {len(train_loader.dataset)}")
    print(f"验证样本数: {len(val_loader.dataset)}")
    print("-" * 50)
    
    best_val_accuracy = 0.0
    best_model_state = None
    
    for epoch in range(num_epochs):
        # 训练阶段
        model.train()
        running_loss = 0.0
        running_contrastive_loss = 0.0
        correct_predictions = 0
        total_samples = 0
        
        train_pbar = tqdm(train_loader, desc=f'Epoch {epoch+1}/{num_epochs} [Train]')
        for batch_idx, batch_data in enumerate(train_pbar):
            
            if contrastive_learning:
                # 对比学习模式
                (anchor_images, pair_images), (anchor_labels, pair_labels, similarities) = batch_data
                anchor_images = anchor_images.to(device)
                pair_images = pair_images.to(device)
                anchor_labels = anchor_labels.to(device)
                similarities = similarities.to(device)
                
                optimizer.zero_grad()
                
                # 前向传播
                anchor_embeddings, anchor_outputs = model(anchor_images)
                pair_embeddings, pair_outputs = model(pair_images)
                
                # 分类损失
                classification_loss = criterion(anchor_outputs, anchor_labels)
                
                # 对比损失
                contrastive_loss = contrastive_criterion(anchor_embeddings, pair_embeddings, similarities)
                
                # 总损失
                total_loss = (1 - contrastive_weight) * classification_loss + contrastive_weight * contrastive_loss
                
                total_loss.backward()
                optimizer.step()
                
                running_loss += total_loss.item()
                running_contrastive_loss += contrastive_loss.item()
                
                # 计算准确率
                _, predicted = torch.max(anchor_outputs.data, 1)
                total_samples += anchor_labels.size(0)
                correct_predictions += (predicted == anchor_labels).sum().item()
                
            else:
                # 标准分类模式
                images, labels = batch_data
                images, labels = images.to(device), labels.to(device)
                
                optimizer.zero_grad()
                outputs = model(images)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()
                
                running_loss += loss.item()
                _, predicted = torch.max(outputs.data, 1)
                total_samples += labels.size(0)
                correct_predictions += (predicted == labels).sum().item()
            
            # 更新进度条
            current_accuracy = 100 * correct_predictions / total_samples
            postfix = {'Loss': f'{running_loss/(batch_idx+1):.4f}', 'Acc': f'{current_accuracy:.2f}%'}
            if contrastive_learning:
                postfix['ContLoss'] = f'{running_contrastive_loss/(batch_idx+1):.4f}'
            train_pbar.set_postfix(postfix)
        
        # 计算训练指标
        epoch_train_loss = running_loss / len(train_loader)
        epoch_train_accuracy = 100 * correct_predictions / total_samples
        epoch_contrastive_loss = running_contrastive_loss / len(train_loader) if contrastive_learning else 0
        
        # 验证阶段
        model.eval()
        val_running_loss = 0.0
        val_correct_predictions = 0
        val_total_samples = 0
        
        with torch.no_grad():
            val_pbar = tqdm(val_loader, desc=f'Epoch {epoch+1}/{num_epochs} [Val]')
            for images, labels in val_pbar:
                images, labels = images.to(device), labels.to(device)
                
                if contrastive_learning:
                    # 验证时只使用分类输出
                    outputs = model(images)  # 推理模式下只返回分类结果
                else:
                    outputs = model(images)
                    
                loss = criterion(outputs, labels)
                
                val_running_loss += loss.item()
                _, predicted = torch.max(outputs.data, 1)
                val_total_samples += labels.size(0)
                val_correct_predictions += (predicted == labels).sum().item()
                
                # 更新进度条
                current_val_accuracy = 100 * val_correct_predictions / val_total_samples
                val_pbar.set_postfix({
                    'Loss': f'{val_running_loss/(len(val_pbar)-len(val_loader)+len(val_pbar)):.4f}',
                    'Acc': f'{current_val_accuracy:.2f}%'
                })
        
        # 计算验证指标
        epoch_val_loss = val_running_loss / len(val_loader)
        epoch_val_accuracy = 100 * val_correct_predictions / val_total_samples
        
        # 保存最佳模型
        if epoch_val_accuracy > best_val_accuracy:
            best_val_accuracy = epoch_val_accuracy
            best_model_state = model.state_dict().copy()
        
        # 记录历史
        train_losses.append(epoch_train_loss)
        train_accuracies.append(epoch_train_accuracy)
        val_losses.append(epoch_val_loss)
        val_accuracies.append(epoch_val_accuracy)
        if contrastive_learning:
            contrastive_losses.append(epoch_contrastive_loss)
        
        # 打印epoch结果
        print(f'Epoch {epoch+1}/{num_epochs}:')
        print(f'  Train Loss: {epoch_train_loss:.4f}, Train Acc: {epoch_train_accuracy:.2f}%')
        if contrastive_learning:
            print(f'  Contrastive Loss: {epoch_contrastive_loss:.4f}')
        print(f'  Val Loss: {epoch_val_loss:.4f}, Val Acc: {epoch_val_accuracy:.2f}%')
        print(f'  Best Val Acc: {best_val_accuracy:.2f}%')
        print('-' * 50)
        
        # 更新学习率
        scheduler.step()
    
    # 加载最佳模型
    if best_model_state is not None:
        model.load_state_dict(best_model_state)
        print(f"已加载最佳模型 (验证准确率: {best_val_accuracy:.2f}%)")
    
    history = {
        'train_losses': train_losses,
        'train_accuracies': train_accuracies,
        'val_losses': val_losses,
        'val_accuracies': val_accuracies,
        'best_val_accuracy': best_val_accuracy
    }
    
    if contrastive_learning:
        history['contrastive_losses'] = contrastive_losses
    
    return model, history

def evaluate_model(model, test_loader, class_names, device='cuda'):
    """评估模型性能 - 提供详细的每类别准确度报告"""
    
    model.eval()
    all_preds = []
    all_labels = []
    class_correct = {}
    class_total = {}
    
    # 初始化每个类别的统计
    for i, class_name in enumerate(class_names):
        class_correct[i] = 0
        class_total[i] = 0
    
    with torch.no_grad():
        for data, target in tqdm(test_loader, desc='Evaluating'):
            data, target = data.to(device), target.to(device)
            
            # 根据模型类型获取输出
            if hasattr(model, 'classifier'):
                # 对比学习模型在推理时只返回分类结果
                output = model(data)
            else:
                # 标准ResNet模型
                output = model(data)
            
            pred = output.argmax(dim=1, keepdim=True)
            all_preds.extend(pred.cpu().numpy().flatten())
            all_labels.extend(target.cpu().numpy())
            
            # 统计每个类别的正确预测数
            for i in range(target.size(0)):
                label = target[i].item()
                prediction = pred[i].item()
                class_total[label] += 1
                if label == prediction:
                    class_correct[label] += 1
    
    # 计算整体准确率
    accuracy = accuracy_score(all_labels, all_preds)
    
    # 生成分类报告
    classification_rep = classification_report(
        all_labels, all_preds, 
        target_names=class_names,
        digits=4
    )
    
    # 生成混淆矩阵
    conf_matrix = confusion_matrix(all_labels, all_preds)
    
    # 生成详细的每类别准确度报告
    print("\n" + "="*60)
    print("📊 每个类别详细准确度报告")
    print("="*60)
    
    for i, class_name in enumerate(class_names):
        if class_total[i] > 0:
            class_accuracy = 100.0 * class_correct[i] / class_total[i]
            print(f"{class_name:>8}: {class_correct[i]:>3}/{class_total[i]:>3} = {class_accuracy:>6.2f}% "
                  f"{'✅' if class_accuracy >= 90 else '⚠️' if class_accuracy >= 70 else '❌'}")
        else:
            print(f"{class_name:>8}: 无测试样本")
    
    print("="*60)
    print(f"总体准确率: {accuracy*100:.2f}%")
    
    # 找出表现最好和最差的类别
    class_accuracies = []
    for i, class_name in enumerate(class_names):
        if class_total[i] > 0:
            acc = 100.0 * class_correct[i] / class_total[i]
            class_accuracies.append((class_name, acc, class_total[i]))
    
    if class_accuracies:
        class_accuracies.sort(key=lambda x: x[1], reverse=True)
        best_class = class_accuracies[0]
        worst_class = class_accuracies[-1]
        
        print(f"\n🏆 最佳表现: {best_class[0]} ({best_class[1]:.2f}%, {best_class[2]}样本)")
        print(f"⚠️  待改进: {worst_class[0]} ({worst_class[1]:.2f}%, {worst_class[2]}样本)")
        
        # 计算类别间准确率差异
        acc_diff = best_class[1] - worst_class[1]
        print(f"📈 类别差异: {acc_diff:.2f}% ({'良好' if acc_diff <= 10 else '较大' if acc_diff <= 20 else '显著'})")
    
    return accuracy * 100, classification_rep, conf_matrix

def plot_training_history(history, contrastive_learning=False):
    """绘制训练历史"""
    
    if contrastive_learning:
        fig, axes = plt.subplots(2, 3, figsize=(20, 10))
    else:
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    
    # 训练和验证损失
    axes[0, 0].plot(history['train_losses'], label='训练损失', color='blue')
    axes[0, 0].plot(history['val_losses'], label='验证损失', color='red')
    axes[0, 0].set_title('模型损失')
    axes[0, 0].set_xlabel('Epochs')
    axes[0, 0].set_ylabel('Loss')
    axes[0, 0].legend()
    axes[0, 0].grid(True)
    
    # 训练和验证准确率
    axes[0, 1].plot(history['train_accuracies'], label='训练准确率', color='blue')
    axes[0, 1].plot(history['val_accuracies'], label='验证准确率', color='red')
    axes[0, 1].set_title('模型准确率')
    axes[0, 1].set_xlabel('Epochs')
    axes[0, 1].set_ylabel('Accuracy (%)')
    axes[0, 1].legend()
    axes[0, 1].grid(True)
    
    if contrastive_learning:
        # 对比学习损失
        axes[0, 2].plot(history['contrastive_losses'], label='对比损失', color='green')
        axes[0, 2].set_title('对比学习损失')
        axes[0, 2].set_xlabel('Epochs')
        axes[0, 2].set_ylabel('Contrastive Loss')
        axes[0, 2].legend()
        axes[0, 2].grid(True)
    
    # 学习曲线
    epochs = range(1, len(history['train_losses']) + 1)
    axes[1, 0].plot(epochs, history['train_losses'], 'b-', label='训练损失')
    axes[1, 0].plot(epochs, history['val_losses'], 'r-', label='验证损失')
    axes[1, 0].set_title('学习曲线')
    axes[1, 0].set_xlabel('Epochs')
    axes[1, 0].set_ylabel('Loss')
    axes[1, 0].legend()
    axes[1, 0].grid(True)
    
    # 准确率变化趋势
    axes[1, 1].plot(epochs, history['train_accuracies'], 'b-', label='训练准确率')
    axes[1, 1].plot(epochs, history['val_accuracies'], 'r-', label='验证准确率')
    axes[1, 1].axhline(y=history['best_val_accuracy'], color='g', linestyle='--', 
                      label=f'最佳验证准确率: {history["best_val_accuracy"]:.2f}%')
    axes[1, 1].set_title('准确率趋势')
    axes[1, 1].set_xlabel('Epochs')
    axes[1, 1].set_ylabel('Accuracy (%)')
    axes[1, 1].legend()
    axes[1, 1].grid(True)
    
    if contrastive_learning:
        # 对比损失趋势
        axes[1, 2].plot(epochs, history['contrastive_losses'], 'g-', label='对比损失')
        axes[1, 2].set_title('对比损失变化趋势')
        axes[1, 2].set_xlabel('Epochs')
        axes[1, 2].set_ylabel('Contrastive Loss')
        axes[1, 2].legend()
        axes[1, 2].grid(True)
    
    plt.tight_layout()
    filename = 'training_history_contrastive.png' if contrastive_learning else 'training_history.png'
    plt.savefig(filename, dpi=300, bbox_inches='tight')
    plt.show()
    
    print(f"训练历史图表已保存为 '{filename}'")

def plot_confusion_matrix_results(conf_matrix, class_names):
    """绘制混淆矩阵"""
    plt.figure(figsize=(10, 8))
    sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues',
                xticklabels=class_names, yticklabels=class_names)
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig('confusion_matrix.png', dpi=300, bbox_inches='tight')
    plt.show()
    
    print("混淆矩阵已保存为 'confusion_matrix.png'")

def final_test_model(model, dataset_path, class_names, device='cuda', samples_per_user=100):
    """最终测试：从每个用户全部数据中随机抽取指定数量图像进行识别"""
    
    # 确保模型在正确的设备上
    model = model.to(device)
    model.eval()
    
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                           std=[0.229, 0.224, 0.225])
    ])
    
    total_correct = 0
    total_samples = 0
    user_results = {}
    
    print(f"\n🔬 最终测试：每用户抽取 {samples_per_user} 张图像")
    print("=" * 60)
    
    for user_idx, user_id in enumerate(class_names):
        user_dir = os.path.join(dataset_path, user_id)
        if not os.path.exists(user_dir):
            continue
            
        # 获取该用户的所有图像
        user_images = []
        for ext in ['*.jpg', '*.jpeg', '*.png', '*.bmp']:
            user_images.extend(glob.glob(os.path.join(user_dir, ext)))
        
        # 随机抽取样本
        if len(user_images) > samples_per_user:
            selected_images = random.sample(user_images, samples_per_user)
        else:
            selected_images = user_images
            
        correct = 0
        total = len(selected_images)
        
        # 逐张预测
        with torch.no_grad():
            for img_path in selected_images:
                try:
                    image = Image.open(img_path).convert('RGB')
                    image_tensor = transform(image).unsqueeze(0).to(device)
                    
                    # 获取预测
                    if hasattr(model, 'embedding'):
                        # 对比学习模式 - 推理时只返回分类结果
                        outputs = model(image_tensor)
                    else:
                        # 标准ResNet模式
                        outputs = model(image_tensor)
                    
                    pred = torch.argmax(outputs, dim=1).item()
                    
                    if pred == user_idx:
                        correct += 1
                        
                except Exception as e:
                    print(f"处理图像错误 {img_path}: {e}")
                    total -= 1
                    
        accuracy = (correct / total * 100) if total > 0 else 0
        user_results[user_id] = {
            'correct': correct,
            'total': total,
            'accuracy': accuracy
        }
        
        # 显示结果
        status = "✅" if accuracy >= 95 else "⚠️" if accuracy >= 90 else "❌"
        print(f"    {user_id}: {correct:3d}/{total:3d} = {accuracy:6.2f}% {status}")
        
        total_correct += correct
        total_samples += total
    
    overall_accuracy = (total_correct / total_samples * 100) if total_samples > 0 else 0
    
    print("=" * 60)
    print(f"📊 最终测试结果: {total_correct}/{total_samples} = {overall_accuracy:.2f}%")
    
    # 找出最好和最差表现
    best_user = max(user_results.items(), key=lambda x: x[1]['accuracy'])
    worst_user = min(user_results.items(), key=lambda x: x[1]['accuracy'])
    
    print(f"🏆 最佳表现: {best_user[0]} ({best_user[1]['accuracy']:.2f}%)")
    print(f"⚠️  待改进: {worst_user[0]} ({worst_user[1]['accuracy']:.2f}%)")
    print(f"📈 准确率差异: {best_user[1]['accuracy'] - worst_user[1]['accuracy']:.2f}%")
    
    return overall_accuracy, user_results

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
    try:
        model.eval()
        
        # 检查模型设备并确保输入输出在同一设备
        device = next(model.parameters()).device
        dummy_input = torch.randn(1, 3, 224, 224).to(device)
        
        # 将模型移动到CPU进行ONNX导出（避免设备不匹配）
        model_cpu = model.to('cpu')
        dummy_input_cpu = torch.randn(1, 3, 224, 224)
        
        onnx_path = os.path.join(save_path, 'resnet18_identity.onnx')
        
        torch.onnx.export(
            model_cpu,
            dummy_input_cpu,
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
        
    except Exception as e:
        print(f"ONNX导出失败: {e}")
        print("PyTorch模型已保存，可以手动进行转换")

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='训练ResNet18身份分类器')
    parser.add_argument('--dataset_path', type=str, default='../dataset', 
                       help='数据集路径')
    parser.add_argument('--epochs', type=int, default=80, 
                       help='训练轮数')
    parser.add_argument('--batch_size', type=int, default=8, 
                       help='批次大小')
    parser.add_argument('--learning_rate', type=float, default=0.0002, 
                       help='学习率')
    parser.add_argument('--save_path', type=str, default='../public/models/resnet18_identity',
                       help='模型保存路径')
    parser.add_argument('--contrastive', action='store_true',
                       help='启用对比学习模式')
    parser.add_argument('--contrastive_weight', type=float, default=0.5,
                       help='对比损失权重 (0.0-1.0)')
    parser.add_argument('--embedding_dim', type=int, default=128,
                       help='对比学习嵌入维度')
    parser.add_argument('--final_test_samples', type=int, default=100,
                       help='最终测试时每用户抽取的样本数')
    
    args = parser.parse_args()
    
    # 设置设备
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"使用设备: {device}")
    
    # 加载数据集
    image_paths, labels, class_names = load_dataset(args.dataset_path)
    
    if len(image_paths) == 0:
        print("错误: 未找到任何图像文件")
        return
    
    print(f"数据集统计:")
    print(f"  总图像数: {len(image_paths)}")
    print(f"  类别数: {len(class_names)}")
    print(f"  类别: {class_names}")
    
    # 分割数据集 (85% 训练, 15% 验证，无测试集 - 充分利用小数据集)
    train_paths, val_paths, train_labels, val_labels = train_test_split(
        image_paths, labels, test_size=0.15, random_state=42, stratify=labels
    )
    
    print(f"数据分割:")
    print(f"  训练集: {len(train_paths)} 样本")
    print(f"  验证集: {len(val_paths)} 样本")
    
    # 创建数据变换
    train_transform, val_transform = create_data_transforms()
    
    # 创建数据集和数据加载器
    if args.contrastive:
        # 对比学习模式：训练集使用对比学习，验证/测试集使用标准模式
        train_dataset = GaitDataset(train_paths, train_labels, train_transform, contrastive_mode=True)
        print("训练集配置为对比学习模式")
    else:
        train_dataset = GaitDataset(train_paths, train_labels, train_transform, contrastive_mode=False)
    
    val_dataset = GaitDataset(val_paths, val_labels, val_transform, contrastive_mode=False)
    
    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True, num_workers=4)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False, num_workers=4)
    
    # 创建模型
    model = create_model(len(class_names), contrastive_learning=args.contrastive, embedding_dim=args.embedding_dim)
    
    # 训练模型
    print("开始训练...")
    trained_model, history = train_model(
        model=model,
        train_loader=train_loader,
        val_loader=val_loader,
        num_epochs=args.epochs,
        learning_rate=args.learning_rate,
        device=device,
        contrastive_learning=args.contrastive,
        contrastive_weight=args.contrastive_weight
    )
    
    # 最终测试：从每用户全部数据随机抽取指定数量进行测试
    print("进行最终测试...")
    final_accuracy, final_results = final_test_model(
        trained_model, args.dataset_path, class_names, device, args.final_test_samples
    )
    
    # 简化的性能报告
    print(f"\n{'='*70}")
    print("🎯 ResNet18身份识别系统 - 最终测试报告")
    print(f"{'='*70}")
    print(f"📈 训练完成: 最佳验证准确率 {history['best_val_accuracy']:.2f}%")
    print(f"🎯 最终测试准确率: {final_accuracy:.2f}%")
    
    # 绘制训练历史
    plot_training_history(history, contrastive_learning=args.contrastive)
    
    # 保存模型
    print("保存模型...")
    save_model_for_web(trained_model, class_names, args.save_path)
    
    print(f"\n{'='*70}")
    print("✅ 训练完成！模型已保存并可用于部署")
    print(f"{'='*70}")

if __name__ == '__main__':
    main()
