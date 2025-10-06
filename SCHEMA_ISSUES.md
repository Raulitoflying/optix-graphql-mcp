# Optix GraphQL Schema 问题详细分析

## 📋 总体问题

通过对比真实的 Optix API Schema 和我们的查询，发现以下主要问题：

## 1️⃣ LIST_MEMBERS / SEARCH_MEMBERS 问题

### ❌ 当前问题：
```graphql
# 错误：查询中定义了 $location_id 但没使用
query ListMembers($location_id: [ID!]) {
  accounts(...) {
    ...
  }
}
```

### ✅ 真实 Schema：
- 字段名称：`accounts` (不是 members)
- 类型：`Account` (不是 Member)
- 没有 `pagination` 字段
- 响应格式：`{ data: [Account], total: Int }`

### 🔧 需要修复：
1. 移除未使用的 `$location_id` 变量
2. 使用正确的字段名称（Account 类型的字段）
3. 不要查询不存在的 `pagination` 字段

---

## 2️⃣ LIST_RESOURCES 问题

### ❌ 当前问题：
```graphql
# 错误：resource_type_id 字段名不正确
query ListResources {
  resources {
    data {
      resource_type_id  # ❌ 应该是嵌套对象
    }
  }
}
```

### ✅ 真实 Schema：
```graphql
type Resource {
  resource_id: ID!
  name: String
  description: String
  type: ResourceType!  # 嵌套对象，不是 ID
  location: Location!
  capacity: Int
  is_bookable: Boolean
}

type ResourceType {
  resource_type_id: ID!
  name: String!
  booking_experience: String
}
```

### 🔧 需要修复：
```graphql
resources {
  data {
    resource_id
    name
    description
    type {  # 嵌套查询
      resource_type_id
      name
      booking_experience
    }
    capacity
  }
}
```

---

## 3️⃣ LIST_PLAN_TEMPLATES 问题

### ❌ 当前问题：
```graphql
query ListPlanTemplates {
  planTemplates {
    data {
      frequency  # ❌ 字段不存在
    }
  }
}
```

### ✅ 真实 Schema：
```graphql
type PlanTemplate {
  plan_template_id: ID!
  name: String!
  description: String!
  price: Float!
  price_frequency: PlanFrequency!  # ✅ 正确的字段名
  allowance_renewal_frequency: PlanFrequency!
  deposit: Float!
  set_up_fee: Float!
}
```

### 🔧 需要修复：
- 使用 `price_frequency` 代替 `frequency`
- 添加其他实际存在的字段

---

## 4️⃣ GET_ORGANIZATION_INFO 问题

### ❌ 当前问题：
```graphql
query GetOrganizationInfo {
  me {
    member {  # ❌ 字段不存在或结构不对
      account_id
    }
  }
}
```

### ✅ 真实 Schema：
```graphql
type AuthenticatedUser {
  user: User!
  account: Account  # ✅ 正确的字段名
  organization: Organization!
}
```

### 🔧 需要修复：
- 使用 `account` 代替 `member`
- 查询正确的嵌套结构

---

## 5️⃣ CHECK_AVAILABILITY 问题

### ❌ 当前问题：
```javascript
// 工具传递的是字符串
args: {
  resourceId: "some-id"  // String
}

// 但查询期望数组
query CheckAvailability($resource_id: [ID!]!) {
  ...
}
```

### ✅ 真实 Schema：
```graphql
resources(resource_id: [ID!]): ResourcePagination!
bookings(resource_id: [ID!]): BookingPagination!
```

### 🔧 需要修复：
1. 在工具中将 `resourceId` 转换为数组：`[args.resourceId]`
2. 或者修改查询接受单个 ID

---

## 6️⃣ GET_UPCOMING_BOOKINGS 问题

### ❌ 当前问题：
```javascript
// 响应处理代码期望
data.upcomingBookings  // ❌ 不存在

// 实际响应是
data.bookings.data  // ✅ 正确
```

### 🔧 需要修复：
修改响应处理逻辑：
```javascript
const bookings = data.bookings?.data || [];
```

---

## 7️⃣ GET_BOOKING_STATS 问题

### ❌ 当前问题：
```graphql
query GetBookingStats {
  bookings {
    data {
      status  # ❌ Booking 类型没有 status 字段
    }
  }
}
```

### ✅ 真实 Schema：
```graphql
type Booking {
  booking_id: ID!
  account: Account
  resource: Resource
  title: String
  notes: String
  start_timestamp: Int!
  end_timestamp: Int!
  # 没有 status 字段！可能是在别的地方或者不同的名称
}
```

### 🔧 需要修复：
1. 检查 Booking 类型的完整定义，找到状态相关字段
2. 可能需要使用其他方式判断 booking 状态

---

## 8️⃣ GET_MEMBER_STATS 问题

### ❌ 当前问题：
类似 LIST_MEMBERS，查询了不存在的 `pagination` 字段

### 🔧 需要修复：
使用 `accounts` 查询和正确的响应格式

---

## 📊 所有需要修复的查询总结

| 查询名称 | 主要问题 | 优先级 |
|---------|---------|--------|
| `LIST_MEMBERS` | 未使用变量、字段名错误 | 🔴 高 |
| `SEARCH_MEMBERS` | pagination 字段不存在 | 🔴 高 |
| `LIST_RESOURCES` | resource_type 嵌套结构错误 | 🔴 高 |
| `LIST_PLAN_TEMPLATES` | frequency 字段名错误 | 🔴 高 |
| `GET_ORGANIZATION_INFO` | member 字段不存在 | 🔴 高 |
| `CHECK_AVAILABILITY` | 参数类型不匹配（数组 vs 字符串） | 🟡 中 |
| `GET_UPCOMING_BOOKINGS` | 响应字段名错误 | 🟡 中 |
| `GET_BOOKING_STATS` | status 字段可能不存在 | 🟡 中 |
| `GET_MEMBER_STATS` | 同 LIST_MEMBERS 问题 | 🟡 中 |
| `GET_BOOKING` | 未测试（需要 ID） | 🟢 低 |
| `GET_MEMBER` | 未测试（需要 ID） | 🟢 低 |
| `GET_RESOURCE` | 未测试（需要 ID） | 🟢 低 |

## 🎯 修复策略

### 立即修复（可快速验证）：
1. ✅ `LIST_BOOKINGS` - 已修复
2. `LIST_MEMBERS` - 移除未使用变量
3. `LIST_RESOURCES` - 修复 resource_type 嵌套查询
4. `LIST_PLAN_TEMPLATES` - 使用正确字段名
5. `GET_ORGANIZATION_INFO` - 使用 account 替代 member

### 需要深入研究：
1. `CHECK_AVAILABILITY` - 检查完整的可用性查询逻辑
2. `GET_BOOKING_STATS` - 查找 Booking 状态字段的正确位置
3. Mutation 查询 - 需要测试实际的 mutation 格式

## 💡 下一步行动

你想让我：
1. **修复所有高优先级的查询**（5个查询）
2. **只修复特定的查询**（告诉我哪个）
3. **先查看完整的 schema 文件**以确保所有字段都正确

选择哪个？
