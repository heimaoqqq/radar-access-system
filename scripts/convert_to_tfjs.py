#!/usr/bin/env python3
"""
模型转换脚本：PyTorch → TensorFlow.js
将训练好的ResNet18模型转换为Web可用的TensorFlow.js格式
"""

import os
import sys
import torch
import torch.nn as nn
import torchvision.models as models
import json
import subprocess
import argparse
from pathlib import Path

def load_pytorch_model(model_path, num_classes=10):
    """加载PyTorch模型"""
    
    # 创建模型结构
    model = models.resnet18(pretrained=False)
    num_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(0.5),
        nn.Linear(num_features, 256),
        nn.ReLU(),
        nn.Dropout(0.3),
        nn.Linear(256, num_classes)
    )
    
    # 加载权重
    checkpoint = torch.load(model_path, map_location='cpu')
    model.load_state_dict(checkpoint['model_state_dict'])
    model.eval()
    
    return model, checkpoint.get('class_names', [f'ID_{i+1}' for i in range(num_classes)])

def convert_to_onnx(model, onnx_path):
    """转换为ONNX格式"""
    
    print("正在转换为ONNX格式...")
    
    # 创建虚拟输入
    dummy_input = torch.randn(1, 3, 224, 224)
    
    # 导出ONNX
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

def convert_to_tensorflow(onnx_path, tf_path):
    """转换ONNX到TensorFlow"""
    
    print("正在转换ONNX到TensorFlow...")
    
    try:
        # 使用onnx-tf转换
        cmd = f"onnx-tf convert -i {onnx_path} -o {tf_path}"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"转换失败: {result.stderr}")
            return False
            
        print(f"TensorFlow模型已保存到: {tf_path}")
        return True
        
    except Exception as e:
        print(f"转换过程出错: {e}")
        return False

def convert_to_tfjs(tf_path, tfjs_path):
    """转换TensorFlow到TensorFlow.js"""
    
    print("正在转换到TensorFlow.js格式...")
    
    try:
        # 使用tensorflowjs_converter转换
        cmd = f"tensorflowjs_converter --input_format=tf_saved_model --output_format=tfjs_graph_model --quantize_float16 {tf_path} {tfjs_path}"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"转换失败: {result.stderr}")
            return False
            
        print(f"TensorFlow.js模型已保存到: {tfjs_path}")
        return True
        
    except Exception as e:
        print(f"转换过程出错: {e}")
        return False

def create_model_metadata(class_names, tfjs_path):
    """创建模型元数据"""
    
    metadata = {
        "model_name": "ResNet18 Identity Classifier",
        "model_version": "1.0.0",
        "description": "基于ResNet18的养老院身份识别分类器",
        "input_shape": [1, 224, 224, 3],
        "output_shape": [1, len(class_names)],
        "num_classes": len(class_names),
        "class_names": class_names,
        "class_mapping": {i: name for i, name in enumerate(class_names)},
        "preprocessing": {
            "resize": [224, 224],
            "normalize": {
                "mean": [0.485, 0.456, 0.406],
                "std": [0.229, 0.224, 0.225]
            }
        },
        "usage": {
            "strict_consistency_check": True,
            "required_images": 3,
            "confidence_threshold": 0.7,
            "time_permissions": {
                "staff": "24h",
                "resident": "06:30-20:30"
            }
        }
    }
    
    # 保存元数据
    metadata_path = os.path.join(tfjs_path, 'metadata.json')
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    print(f"模型元数据已保存到: {metadata_path}")

def validate_tfjs_model(tfjs_path):
    """验证TensorFlow.js模型"""
    
    print("正在验证TensorFlow.js模型...")
    
    # 检查必要文件
    required_files = ['model.json']
    for file_name in required_files:
        file_path = os.path.join(tfjs_path, file_name)
        if not os.path.exists(file_path):
            print(f"错误: 缺少文件 {file_name}")
            return False
    
    # 检查权重文件
    weight_files = [f for f in os.listdir(tfjs_path) if f.endswith('.bin')]
    if not weight_files:
        print("错误: 缺少权重文件 (.bin)")
        return False
    
    # 读取模型配置
    model_json_path = os.path.join(tfjs_path, 'model.json')
    try:
        with open(model_json_path, 'r') as f:
            model_config = json.load(f)
        
        print("模型验证成功!")
        print(f"  - 模型格式: {model_config.get('format', 'unknown')}")
        print(f"  - 权重文件数量: {len(weight_files)}")
        print(f"  - 权重文件: {', '.join(weight_files)}")
        
        return True
        
    except Exception as e:
        print(f"读取模型配置失败: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='转换PyTorch模型为TensorFlow.js格式')
    parser.add_argument('--model_path', type=str, 
                       default='../public/models/resnet18_identity/resnet18_identity.pth',
                       help='PyTorch模型路径')
    parser.add_argument('--output_path', type=str, 
                       default='../public/models/resnet18_identity',
                       help='输出目录')
    parser.add_argument('--temp_dir', type=str, 
                       default='./temp_conversion',
                       help='临时文件目录')
    
    args = parser.parse_args()
    
    # 检查输入文件
    if not os.path.exists(args.model_path):
        print(f"错误: 找不到模型文件 {args.model_path}")
        return
    
    # 创建输出目录
    os.makedirs(args.output_path, exist_ok=True)
    os.makedirs(args.temp_dir, exist_ok=True)
    
    print("=== ResNet18模型转换 ===")
    print(f"输入模型: {args.model_path}")
    print(f"输出目录: {args.output_path}")
    
    try:
        # 1. 加载PyTorch模型
        print("\n步骤1: 加载PyTorch模型")
        model, class_names = load_pytorch_model(args.model_path)
        print(f"加载成功! 类别数: {len(class_names)}")
        print(f"类别: {class_names}")
        
        # 2. 转换为ONNX
        print("\n步骤2: 转换为ONNX格式")
        onnx_path = os.path.join(args.temp_dir, 'model.onnx')
        convert_to_onnx(model, onnx_path)
        
        # 3. 转换为TensorFlow
        print("\n步骤3: 转换为TensorFlow格式")
        tf_path = os.path.join(args.temp_dir, 'tf_model')
        if not convert_to_tensorflow(onnx_path, tf_path):
            print("TensorFlow转换失败，请检查onnx-tf是否正确安装")
            return
        
        # 4. 转换为TensorFlow.js
        print("\n步骤4: 转换为TensorFlow.js格式")
        if not convert_to_tfjs(tf_path, args.output_path):
            print("TensorFlow.js转换失败，请检查tensorflowjs是否正确安装")
            return
        
        # 5. 创建元数据
        print("\n步骤5: 创建模型元数据")
        create_model_metadata(class_names, args.output_path)
        
        # 6. 验证模型
        print("\n步骤6: 验证转换结果")
        if validate_tfjs_model(args.output_path):
            print("\n🎉 模型转换成功!")
            print(f"TensorFlow.js模型已保存到: {args.output_path}")
            print("\n现在可以在Web应用中使用该模型了!")
        else:
            print("\n❌ 模型验证失败")
        
        # 清理临时文件
        print(f"\n清理临时文件: {args.temp_dir}")
        import shutil
        shutil.rmtree(args.temp_dir, ignore_errors=True)
        
    except Exception as e:
        print(f"\n转换过程出错: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
