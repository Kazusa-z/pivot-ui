# 交互示例索引

运行 `pnpm dev`，在 `http://localhost:6009` 打开 Storybook。故事中的输出区域用于观察 React 状态、修改请求和提交结果；它们帮助你理解接法，不要求应用也显示这些调试内容。

| 想观察的行为   | 在 Storybook 查找                              | 可以尝试                                       |
| -------------- | ---------------------------------------------- | ---------------------------------------------- |
| 主题和设计变量 | Foundation / Theme、Tokens                     | 切换主题，比较背景、文字、边框和禁用状态       |
| 点击和等待状态 | Widgets / Buttons                              | 点击异步按钮，检查等待期间是否防止重复激活     |
| 输入草稿和改名 | Widgets / Text Inputs                          | 输入中文、Enter 提交、Escape 取消、失败后重试  |
| 选项身份       | Widgets / Choices                              | 单选、多选、搜索，比较字符串和数字值           |
| 连续数值编辑   | InputNumber、Slider、NumericSlider             | 拖动、键盘微调、输入超出软范围的值             |
| 多轴编辑       | NumericTupleInput、Vector、Rect                | 改一个轴、切换比例锁定、取消编辑               |
| 图形选色       | Widgets / Color                                | 拖动选色平面，编辑 HEX，尝试取色能力缺失和拒绝 |
| 渐变           | ColorRamp、ColorRampChannels                   | 重合位置、增删点、独立透明度轨道               |
| 曲线           | CurveWidget、CurvePicker                       | 点和控制柄、空曲线、缩放、预设应用             |
| 集合和树       | Widgets / Tree、Templates / CollectionTemplate | 展开、选择、删除焦点项、改名失败和重排         |
| 资源           | Templates / Resources                          | 搜索、分页、缺失引用、改名失败、未就绪资源     |
| 浮层           | Menus、Overlays、Dialogs                       | 嵌套打开、Escape、关闭后焦点、窄窗口滚动       |
| 应用数据连接   | Property / PropertyField、Complex bindings     | 预览与保存值分开、延迟、拒绝、外部更新、混合值 |

## 如何判断示例结果

一次拖动可以出现多次预览，但通常只在结束时保存一次。选择曲线点、缩放视图或翻页不应保存属性。保存失败后，已保存的数据应保持不变，编辑器应提供明确的重试或取消路径。

对象切换或数据版本变化后，等待中的结果不能覆盖新对象的界面。应用仍需保证已经发送的保存请求对应正确对象；关闭控件不等于撤销请求。

## 把示例用到应用里

先复制组件组合和 React 状态接法，再把故事中的模拟服务替换成应用服务。不要从 `stories/support` 导入生产代码。公开接口与示例见[属性数据](./B11_INTEGRATION.md)、[资源](./B10_RESOURCES.md)和[颜色](./B08_COLOR.md)指南。
