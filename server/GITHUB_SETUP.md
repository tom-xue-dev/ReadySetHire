# GitHub Repository 配置指南

## 🔐 必需的 Secrets 配置

你需要在 GitHub repository 的 Settings → Secrets and variables → Actions 中配置以下 secrets：

### 1. **Docker Hub 配置** (必需)
```
DOCKER_USERNAME=你的DockerHub用户名
DOCKER_PASSWORD=你的DockerHub密码或访问令牌
```

**配置步骤：**
1. 登录 [Docker Hub](https://hub.docker.com/)
2. 创建访问令牌：Account Settings → Security → Access Tokens → New Access Token
3. 在 GitHub 中添加：
   - `DOCKER_USERNAME`: 你的 Docker Hub 用户名
   - `DOCKER_PASSWORD`: 刚创建的访问令牌

### 2. **Snyk 安全扫描** (可选)
```
SNYK_TOKEN=你的Snyk API令牌
```

**配置步骤：**
1. 注册 [Snyk](https://snyk.io/)
2. 获取 API Token：Account Settings → API Token
3. 在 GitHub 中添加 `SNYK_TOKEN`

**如果不使用 Snyk，可以删除相关步骤：**
```yaml
# 删除或注释这部分
- name: Run Snyk security scan
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

## 🌍 环境变量配置

### 当前 Workflow 环境变量
你的 workflow 中已经硬编码了这些环境变量：
```yaml
env:
  NODE_VERSION: '18'
  POSTGRES_VERSION: '15'
```

### 数据库配置
测试环境使用的数据库配置：
```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_USER: readysethire_user
      POSTGRES_PASSWORD: readysethire_password
      POSTGRES_DB: readysethire_test
```

## 📋 配置清单

### ✅ 立即需要配置的 Secrets

| Secret Name | 描述 | 是否必需 | 获取方法 |
|-------------|------|----------|----------|
| `DOCKER_USERNAME` | Docker Hub 用户名 | ✅ 必需 | Docker Hub 账户 |
| `DOCKER_PASSWORD` | Docker Hub 访问令牌 | ✅ 必需 | Docker Hub → Security → Access Tokens |
| `SNYK_TOKEN` | Snyk API 令牌 | ⚠️ 可选 | Snyk → Account Settings → API Token |

### 🔧 配置步骤

1. **进入 GitHub Repository**
   ```
   https://github.com/你的用户名/你的仓库名/settings/secrets/actions
   ```

2. **点击 "New repository secret"**

3. **添加每个 secret：**
   - Name: `DOCKER_USERNAME`
   - Secret: `你的Docker Hub用户名`
   - 点击 "Add secret"

4. **重复步骤 3 添加其他 secrets**

## 🚀 验证配置

配置完成后，推送代码到 GitHub 来验证：

```bash
git add .
git commit -m "feat: add CI/CD workflow with tests"
git push origin main
```

然后检查 GitHub Actions 标签页看 workflow 是否成功运行。

## ⚠️ 安全注意事项

1. **永远不要在代码中硬编码敏感信息**
2. **使用访问令牌而不是密码**
3. **定期轮换访问令牌**
4. **只给必要的权限**

## 🛠️ 故障排除

### Docker 推送失败
- 检查 `DOCKER_USERNAME` 和 `DOCKER_PASSWORD` 是否正确
- 确保 Docker Hub 仓库存在或有权限创建

### Snyk 扫描失败
- 检查 `SNYK_TOKEN` 是否有效
- 或者删除 Snyk 相关步骤（见上方说明）

### 测试失败
- 检查数据库服务是否正常启动
- 确保所有依赖都已正确安装

## 📚 进阶配置

### 环境特定的 Secrets
如果需要不同环境的配置，可以创建环境：

1. **Settings → Environments**
2. **创建环境**：`staging`, `production`
3. **为每个环境配置特定的 secrets**

### 分支保护规则
建议配置分支保护：
1. **Settings → Branches**
2. **Add rule** for `main` branch
3. **启用**：
   - Require status checks to pass
   - Require branches to be up to date
   - Include administrators

## 🎯 最小配置

如果只想快速测试，最少只需要配置：
```
DOCKER_USERNAME=你的Docker Hub用户名
DOCKER_PASSWORD=你的Docker Hub访问令牌
```

然后删除或注释 Snyk 相关的步骤即可。
