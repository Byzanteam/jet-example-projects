# SMS Plugin Example

## 概述

本示例项目展示了如何利用 Hono 框架搭建一个简易的 Web 服务器，并通过 GraphQL
请求实现与 jet-sms-plugin 的集成，从而发送短信。

**在 jet nightly 环境中，使用jcli 来获取项目的访问地址。**

## 快速开始

### 安装和部署

**按照以下步骤在您的环境中部署并测试短信功能:**

1. 推送项目到 jet 环境：

```bash
jcli push
```

2. 设置环境变量

```bash
jcli admin var set ACCESS_KEY_ID xxx

jcli admin var set ACCESS_SECRET xxx

jcli admin var set SIGN_NAME xxx
```

3. 安装 SMS 插件：

```bash
jcli plugins install sms
```

4. 部署函数：

```bash
jcli function deploy
```

### 测试短信发送

- 访问 GET /sms 以发送测试短信。
- 您可以通过返回的响应或通过日志查看发送状态和结果。
