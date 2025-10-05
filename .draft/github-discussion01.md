# 我制作了内联const enum用的插件

前段时间我尝试使用`tsdown`，但发现它的const enum不内联，而且已经有issue
提出。我以为这是它自己的问题。但没想到rollup的`@rollup/plugin-typescript`也是这样。

思考后我制作了一个插件`rollup-plugin-const-enum`, [README.md](https://github.com/baendlorel/rollup-plugin-const-enum)。它使用正则表达式匹配出所有const enum的信息，再对代码中所有的const enum进行替换。为了保证轻量级，我没有使用ast解析工具，只是靠正则表达式和逐字解析做到了消除注释和扫描const enum声明。
只要这样用就行了，我已经用在了我自己的项目中，感觉还不错😀

```js
import { constEnum } from 'rollup-plugin-const-enum';

export default {
  // ...
  plugins: [
    constEnum(), // place it near the front
    // other plugins
  ],
};
```

如果你喜欢这个插件，那我还推荐我做的另一个插件`rollup-plugin-func-macro`，这个是带AST解析器的，它会把写了`__func__`的位置全部替换成当前代码所处在的函数名字。
