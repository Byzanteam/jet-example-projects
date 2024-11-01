# Tower Example

## Usage

1. `jcli admin var set` 设置环境变量 `TOWER_PLUGIN_KEY`
1. 在 tower admin 中创建一个 application
   1. 并获取到 `App ID` 作为 `TOWER_PLUGIN_KEY`
   1. 设置 `登录回调 URI` 为 `$BASE_URL/oauth2/callback`（如
      `http://localhost:2137/tower_example/development/main/oauth2/callback`）
1. `jcli push` 将代码推送到 jet
1. `jcli db migrate` 迁移数据库
1. `jcli plugins install tower` 安装 tower 插件实例
1. `jcli function deploy` 部署函数
1. 访问 `$BASE_URL/login` （如
   `http://localhost:2137/tower_example/development/main/login`），并完成登录流程之后，页面会显示当前登录用户信息（数据结构如下）

```
ID: e395ae74-da56-4e53-bc57-c9bbb6564c28
name: Alice
phone: 18612345678
updated at: 11/1/2024, 3:52:13 PM
extra: {"data":{"inserted_at":"2024-11-01T07:52:13.819844Z"}}
```

> [!TIP]
> `BASE_URL` 通过 `jcli function inspect` 查询。

## Environment Variables

| Name               | Description                             | Default    |
| ------------------ | --------------------------------------- | ---------- |
| `TOWER_PLUGIN_KEY` | Tower plugin key (get from tower admin) | `required` |
