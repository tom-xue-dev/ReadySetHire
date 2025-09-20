# 多语言支持使用指南

## 概述

ReadySetHire 现在支持多语言功能，目前支持英语 (en) 和中文 (zh)。所有文本内容都从语言文件中提取，便于后续添加更多语言。

## 文件结构

```
client/src/
├── locales/
│   ├── en.json          # 英语翻译文件
│   └── zh.json          # 中文翻译文件
├── contexts/
│   └── I18nContext.tsx  # 国际化上下文和钩子
```

## 使用方法

### 1. 在组件中使用翻译

```tsx
import { useI18n } from '../contexts/I18nContext';

function MyComponent() {
  const { t, language, setLanguage } = useI18n();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('home.title')}</p>
      <button onClick={() => setLanguage('zh')}>
        切换到中文
      </button>
    </div>
  );
}
```

### 2. 带参数的翻译

```tsx
// 在语言文件中定义带参数的文本
// en.json: "selectedFile": "Selected: {fileName} ({fileSize} KB)"
// zh.json: "selectedFile": "已选择: {fileName} ({fileSize} KB)"

function FileComponent({ fileName, fileSize }) {
  const { t } = useI18n();
  
  return (
    <div>
      {t('resume.selectedFile', { 
        fileName: fileName, 
        fileSize: Math.round(fileSize / 1024) 
      })}
    </div>
  );
}
```

### 3. 语言切换组件

```tsx
import { LanguageSwitcher } from '../contexts/I18nContext';

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <LanguageSwitcher /> {/* 自动渲染语言切换按钮 */}
    </header>
  );
}
```

## 语言文件结构

语言文件采用嵌套结构，便于组织：

```json
{
  "common": {
    "welcome": "Welcome",
    "logout": "Logout",
    "login": "Login"
  },
  "navigation": {
    "dashboard": "Dashboard",
    "interviews": "Interviews"
  },
  "forms": {
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

## 添加新语言

1. 在 `client/src/locales/` 目录下创建新的语言文件，如 `fr.json`
2. 更新 `I18nContext.tsx` 中的 `Language` 类型：

```tsx
export type Language = 'en' | 'zh' | 'fr';
```

3. 更新 `LanguageSwitcher` 组件添加新语言按钮

## 已更新的组件

以下组件已经更新为使用多语言：

- ✅ `Layout` - 页脚版权信息
- ✅ `Header` - 欢迎信息、退出确认、语言切换
- ✅ `Sidebar` - 导航菜单项
- ✅ `Home` - 页面标题和链接文本

## 最佳实践

1. **键名规范**: 使用点分隔的层级结构，如 `common.welcome`
2. **参数化**: 对于动态内容使用 `{paramName}` 格式
3. **一致性**: 保持所有语言文件的结构一致
4. **回退机制**: 如果翻译缺失，系统会自动回退到英语
5. **本地存储**: 用户的语言选择会自动保存到 localStorage

## 示例：更新现有组件

假设你有一个组件需要多语言支持：

```tsx
// 之前
function OldComponent() {
  return (
    <div>
      <h2>Resume Assessment</h2>
      <button>Save</button>
      <button>Cancel</button>
    </div>
  );
}

// 之后
import { useI18n } from '../contexts/I18nContext';

function NewComponent() {
  const { t } = useI18n();
  
  return (
    <div>
      <h2>{t('resume.title')}</h2>
      <button>{t('forms.save')}</button>
      <button>{t('forms.cancel')}</button>
    </div>
  );
}
```

## 注意事项

- 语言文件会在组件挂载时异步加载
- 如果语言文件加载失败，会自动回退到英语
- 语言切换会立即生效，无需刷新页面
- 所有翻译键都支持嵌套访问，如 `t('common.welcome')`
