# Frontend Configuration Architecture

## 概述

本文档描述了ReadySetHire前端应用的配置系统架构，该系统将原本硬编码的后端连接地址抽象成了灵活的配置文件，支持多环境部署和开发。

## 架构组件

### 1. 核心配置文件
```
client/src/config/
├── api.ts              # 主配置文件
├── test-config.ts      # 配置测试工具
└── README.md          # 配置文档
```

### 2. 环境配置文件
```
client/
├── .env.example        # 环境变量示例
├── .env.development    # 开发环境配置
├── .env.production     # 生产环境配置
└── .env.staging        # 预发布环境配置
```

### 3. 类型定义
```
client/src/vite-env.d.ts  # TypeScript环境变量类型定义
```

### 4. 构建配置
```
client/vite.config.ts     # Vite构建工具配置
```

## 配置层次结构

```
┌─────────────────────────────────────┐
│           应用程序层                  │
├─────────────────────────────────────┤
│         API Helper 层                │
│    (client/src/api/helper.js)       │
├─────────────────────────────────────┤
│          配置抽象层                  │
│     (client/src/config/api.ts)      │
├─────────────────────────────────────┤
│         环境变量层                   │
│    (.env.development/.env.production)│
├─────────────────────────────────────┤
│          构建工具层                  │
│      (vite.config.ts)              │
└─────────────────────────────────────┘
```

## 主要特性

### 1. 多环境支持
- **开发环境**: `http://localhost:3000/api`
- **生产环境**: `https://comp2140a2.uqcloud.net/api`
- **预发布环境**: `https://staging.comp2140a2.uqcloud.net/api`

### 2. 类型安全
- 完整的TypeScript支持
- 环境变量类型定义
- 配置接口类型检查

### 3. 错误处理
- 请求超时控制
- 详细错误信息
- 连接状态检测

### 4. 开发体验
- 配置状态组件
- 调试工具
- 自动测试验证

## 配置流程

### 1. 环境检测
```typescript
const getEnvironment = (): string => {
  return getEnvVar('MODE', 'development');
};
```

### 2. 配置选择
```typescript
const getConfig = (): ApiConfig => {
  const env = getEnvironment();
  switch (env) {
    case 'production': return PRODUCTION_CONFIG;
    case 'staging': return STAGING_CONFIG;
    default: return DEVELOPMENT_CONFIG;
  }
};
```

### 3. 配置应用
```typescript
export const {
  baseUrl: API_BASE_URL,
  timeout: API_TIMEOUT,
  jwtToken: JWT_TOKEN,
  username: USERNAME,
} = apiConfig;
```

## 使用方式

### 1. 基本使用
```javascript
import { API_BASE_URL, JWT_TOKEN, USERNAME } from '../config/api.ts';

// 使用配置的API地址
const response = await fetch(`${API_BASE_URL}/endpoint`);
```

### 2. 高级使用
```javascript
import { apiConfig, getConfig, getEnvironment } from '../config/api.ts';

// 获取完整配置对象
const config = getConfig();
console.log('Current environment:', getEnvironment());
console.log('API timeout:', config.timeout);
```

### 3. 组件集成
```jsx
import ConfigStatus from '../components/ConfigStatus';

function App() {
  return (
    <div>
      {/* 开发环境显示配置状态 */}
      <ConfigStatus showDetails={true} />
      {/* 应用内容 */}
    </div>
  );
}
```

## 部署配置

### 1. 开发环境
```bash
# 启动开发服务器
npm run dev

# 使用特定环境
npm run dev --mode development
```

### 2. 生产环境
```bash
# 生产构建
npm run build

# 预发布构建
npm run build --mode staging
```

### 3. 环境变量设置
```bash
# 开发环境
VITE_API_BASE_URL=http://localhost:3000/api
VITE_JWT_TOKEN=your_dev_token
VITE_USERNAME=your_username

# 生产环境
VITE_API_BASE_URL=https://comp2140a2.uqcloud.net/api
VITE_JWT_TOKEN=your_prod_token
VITE_USERNAME=your_username
```

## 迁移指南

### 从旧系统迁移

**旧代码 (硬编码)**:
```javascript
const API_BASE_URL = 'https://comp2140a2.uqcloud.net/api';
const JWT_TOKEN = 'hardcoded_token';
const USERNAME = 'hardcoded_username';
```

**新代码 (配置化)**:
```javascript
import { API_BASE_URL, JWT_TOKEN, USERNAME } from '../config/api.ts';
```

### 迁移步骤
1. 创建环境配置文件
2. 更新导入语句
3. 验证配置正确性
4. 测试不同环境

## 安全注意事项

### 1. 敏感信息保护
- 不要将JWT token提交到版本控制
- 使用环境变量管理敏感配置
- 生产环境使用HTTPS

### 2. 配置验证
- 启动时验证配置完整性
- 检查API连接状态
- 监控配置变更

### 3. 错误处理
- 优雅处理配置错误
- 提供有意义的错误信息
- 实现降级策略

## 监控和调试

### 1. 配置状态监控
- 使用ConfigStatus组件
- 检查配置完整性
- 验证API连接

### 2. 调试工具
- 配置测试函数
- 开发环境日志
- 错误追踪

### 3. 性能监控
- 请求超时设置
- 连接重试机制
- 性能指标收集

## 最佳实践

### 1. 配置管理
- 使用类型安全的配置
- 提供合理的默认值
- 实现配置验证

### 2. 环境隔离
- 清晰的环境分离
- 独立的配置文件
- 环境特定的优化

### 3. 可维护性
- 详细的文档说明
- 一致的命名规范
- 模块化的架构设计

## 故障排除

### 常见问题

1. **配置未生效**
   - 检查环境变量名称
   - 确认文件路径正确
   - 重启开发服务器

2. **类型错误**
   - 更新vite-env.d.ts
   - 检查导入语句
   - 验证类型定义

3. **API连接失败**
   - 验证URL格式
   - 检查网络连接
   - 确认后端服务状态

### 调试命令
```bash
# 显示配置调试信息
npm run dev -- --debug=config

# 检查环境变量
echo $VITE_API_BASE_URL

# 验证构建配置
npm run build -- --mode development
```
