// 创建数据集索引文件
const fs = require('fs');
const path = require('path');

const datasetPath = path.join(__dirname, '../public/dataset');
const outputPath = path.join(__dirname, '../public/dataset_index.json');

const datasetIndex = {};

// 读取所有ID文件夹
for (let id = 1; id <= 10; id++) {
  const idFolder = `ID_${id}`;
  const folderPath = path.join(datasetPath, idFolder);
  
  if (fs.existsSync(folderPath)) {
    const files = fs.readdirSync(folderPath)
      .filter(file => file.endsWith('.jpg') || file.endsWith('.png'))
      .sort();
    
    datasetIndex[idFolder] = files;
    console.log(`✅ ${idFolder}: 找到 ${files.length} 张图像`);
  } else {
    console.log(`⚠️ ${idFolder}: 文件夹不存在`);
    datasetIndex[idFolder] = [];
  }
}

// 写入索引文件
fs.writeFileSync(outputPath, JSON.stringify(datasetIndex, null, 2));
console.log('\n📝 数据集索引已创建:', outputPath);
console.log('📊 总计:', Object.values(datasetIndex).reduce((sum, files) => sum + files.length, 0), '张图像');
