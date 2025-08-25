import React, { useState } from 'react';

const DemoMode = ({ onTriggerEvent }) => {
  const [isOpen, setIsOpen] = useState(false);

  const demoScenarios = [
    {
      id: 'normal_access',
      title: '正常访问',
      description: '模拟授权居民正常通过',
      icon: '✅',
      action: () => {
        onTriggerEvent({
          type: 'access',
          data: {
            residentId: 'R001',
            residentName: '张三',
            status: 'authorized',
            confidence: 0.98
          }
        });
      }
    },
    {
      id: 'unauthorized',
      title: '未授权访问',
      description: '模拟未授权人员尝试进入',
      icon: '🚫',
      action: () => {
        onTriggerEvent({
          type: 'access',
          data: {
            residentId: null,
            residentName: '未知人员',
            status: 'denied',
            confidence: 0.45
          }
        });
      }
    },
    {
      id: 'fall_detection',
      title: '跌倒检测',
      description: '模拟检测到居民跌倒',
      icon: '⚠️',
      action: () => {
        onTriggerEvent({
          type: 'alert',
          data: {
            type: 'fall_detected',
            priority: 'critical',
            location: '主楼入口',
            description: '检测到异常步态，疑似跌倒事件'
          }
        });
      }
    },
    {
      id: 'emergency',
      title: '紧急情况',
      description: '模拟紧急呼叫事件',
      icon: '🚨',
      action: () => {
        onTriggerEvent({
          type: 'alert',
          data: {
            type: 'emergency',
            priority: 'critical',
            location: '活动室',
            description: '收到紧急求助信号'
          }
        });
      }
    },
    {
      id: 'peak_traffic',
      title: '高峰期流量',
      description: '模拟高峰期多人同时通过',
      icon: '👥',
      action: () => {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            onTriggerEvent({
              type: 'access',
              data: {
                residentId: `R00${i + 1}`,
                residentName: ['张三', '李四', '王五', '赵六', '孙七'][i],
                status: 'authorized',
                confidence: 0.85 + Math.random() * 0.14
              }
            });
          }, i * 1000);
        }
      }
    },
    {
      id: 'system_test',
      title: '系统测试',
      description: '运行完整系统测试流程',
      icon: '🔧',
      action: () => {
        onTriggerEvent({
          type: 'system_test',
          data: {
            testId: `TEST-${Date.now()}`,
            status: 'running'
          }
        });
      }
    }
  ];

  return (
    <>
      {/* Floating Demo Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-2xl hover:bg-purple-700 transition-all z-50 group"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🎮</span>
          <span className="hidden group-hover:inline font-semibold">演示模式</span>
        </div>
      </button>

      {/* Demo Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 bg-white rounded-xl shadow-2xl p-6 w-96 max-h-[600px] overflow-y-auto z-50 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">🎮 交互式演示模式</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            选择场景进行演示，展示系统各项功能
          </p>

          <div className="space-y-3">
            {demoScenarios.map(scenario => (
              <button
                key={scenario.id}
                onClick={() => {
                  scenario.action();
                  // Visual feedback
                  const button = document.getElementById(`demo-${scenario.id}`);
                  if (button) {
                    button.classList.add('animate-pulse');
                    setTimeout(() => {
                      button.classList.remove('animate-pulse');
                    }, 1000);
                  }
                }}
                id={`demo-${scenario.id}`}
                className="w-full p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-purple-50 hover:to-purple-100 transition-all text-left group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{scenario.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 group-hover:text-purple-700">
                      {scenario.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {scenario.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">💡 提示：</span> 
              点击场景按钮后，请切换到实时监控或数据分析页面查看效果
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default DemoMode;
